---
name: document-vault
description: Use when building E2E encrypted document storage, receipt filing, tax document management, or any file storage feature.
---

# Document Vault

## Overview

Implements E2E encrypted document storage — receipts, tax documents, statements, and financial records. Files are encrypted client-side before storage, with category tagging, full-text search (client-side OCR), and receipt-to-transaction linking. Storage limits enforced per plan tier.

## When to Use

- Building encrypted file upload and storage
- Implementing receipt-to-transaction linking
- Adding tax document organization
- Creating document search functionality
- Managing storage limits and quotas

## Core Principles

- **E2E encrypted** — Files encrypted client-side before any upload; server sees only ciphertext
- **Receipts linked to transactions** — Each receipt can be linked to one or more transactions
- **Category and tag system** — Documents organized by type (receipt, statement, tax, other)
- **Client-side search** — Full-text search runs on decrypted data in-browser
- **Storage quotas** — Enforce per-tier limits (free: 100MB, paid: 5GB)

## Workflow

### Step 1: File Encryption Before Upload

```ts
async function encryptFile(
  file: File,
  encryptionKey: CryptoKey
): Promise<EncryptedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    arrayBuffer
  );

  return {
    encryptedData: new Blob([encrypted]),
    iv: arrayBufferToBase64(iv),
    originalName: file.name,
    originalType: file.type,
    originalSize: file.size,
  };
}

async function decryptFile(
  encryptedBlob: Blob,
  iv: string,
  encryptionKey: CryptoKey,
  originalType: string
): Promise<File> {
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const ivArray = base64ToArrayBuffer(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    encryptionKey,
    arrayBuffer
  );

  return new File([decrypted], 'document', { type: originalType });
}
```

### Step 2: Document Metadata Model

```ts
interface VaultDocument {
  id: string;
  name: string;
  type: DocumentType;
  tags: string[];
  mimeType: string;
  size: number;               // Original file size
  encryptedSize: number;      // Encrypted file size
  thumbnailId?: string;       // Encrypted thumbnail
  transactionIds: string[];   // Linked transactions
  ocrText?: string;           // Extracted text (encrypted)
  uploadedAt: string;
  category: 'receipt' | 'statement' | 'tax' | 'insurance' | 'contract' | 'other';
  year?: number;              // Tax year for tax documents
}

type DocumentType = 'pdf' | 'image' | 'other';
```

### Step 3: Upload Flow

```tsx
function DocumentUpload({ onUpload }: Props) {
  const { encryptionKey } = useEncryption();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }

      // Generate thumbnail for images
      const thumbnail = file.type.startsWith('image/')
        ? await generateThumbnail(file, 200, 200)
        : undefined;

      // Encrypt file
      const encrypted = await encryptFile(file, encryptionKey);

      // Upload encrypted file
      await uploadToStorage(encrypted);

      // OCR for receipts
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const ocrText = await performOCR(file);
        // Store encrypted OCR text for search
      }

      onUpload({ file: encrypted, thumbnail, ocrText });
    }
    setUploading(false);
  };

  return (
    <div className="rounded-lg border-2 border-dashed p-8 text-center">
      <input
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={e => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        id="vault-upload"
      />
      <label htmlFor="vault-upload" className="cursor-pointer">
        <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2">Drop files here or click to upload</p>
        <p className="text-sm text-muted-foreground">PDF, JPG, PNG — Max 10MB per file</p>
      </label>
    </div>
  );
}
```

### Step 4: Receipt-to-Transaction Linking

```tsx
function LinkReceiptToTransaction({ documentId }: Props) {
  const [search, setSearch] = useState('');
  const transactions = useTransactionSearch(search);

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search transactions to link..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {transactions.map(tx => (
        <button
          key={tx.id}
          onClick={() => linkDocument(documentId, tx.id)}
          className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted"
        >
          <span>{tx.description}</span>
          <span className="font-medium">{formatCurrency(tx.amount)}</span>
        </button>
      ))}
    </div>
  );
}
```

### Step 5: Storage Quota

```ts
const STORAGE_LIMITS = {
  free: 100 * 1024 * 1024,     // 100MB
  basic: 1024 * 1024 * 1024,   // 1GB
  premium: 5 * 1024 * 1024 * 1024, // 5GB
};

function useStorageQuota(tier: 'free' | 'basic' | 'premium') {
  const [used, setUsed] = useState(0);
  const limit = STORAGE_LIMITS[tier];

  return {
    used,
    limit,
    remaining: limit - used,
    percentUsed: (used / limit) * 100,
    canUpload: (fileSize: number) => used + fileSize <= limit,
  };
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/encryption/` | File encryption/decryption |
| `src/lib/receipt-ocr.ts` | OCR for receipt search |
| `src/components/budget/` | Vault UI components |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Uploading files before encryption | Always encrypt client-side first |
| No file size validation | Enforce 10MB per file limit |
| Storing OCR text unencrypted | Encrypt OCR text like any other PII |
| No storage quota enforcement | Check quota before each upload |
| Thumbnails stored unencrypted | Encrypt thumbnails too |

## Validation Checklist

- [ ] Files encrypted client-side before upload
- [ ] File size validation (10MB per file)
- [ ] Storage quota enforced
- [ ] Thumbnails encrypted
- [ ] OCR text encrypted for search
- [ ] Receipt-to-transaction linking works
- [ ] Category tagging functional
- [ ] File download decrypts correctly

## Related Skills

- `e2e-encryption` — file encryption patterns
- `receipt-scanner` — OCR for uploaded receipts
- `canadian-tax` — tax document organization
