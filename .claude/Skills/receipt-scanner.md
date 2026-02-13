---
name: receipt-scanner
description: Use when implementing or improving receipt scanning, camera-based document capture, or OCR-powered data extraction from receipts.
---

# Receipt Scanner

## Overview

Implements client-side receipt scanning using Tesseract.js — camera capture, image preprocessing, OCR text extraction, and structured data parsing (merchant, amount, date, items). Designed mobile-first with language-aware OCR supporting 100+ languages.

## When to Use

- Building camera-based receipt capture UI
- Implementing image preprocessing for OCR quality
- Extracting structured data from receipt text
- Improving OCR accuracy for specific receipt formats
- Adding language-specific OCR support

## Core Principles

- **Client-side OCR** — All processing happens in-browser (privacy-first)
- **Mobile-first camera** — Camera UI designed for phone-held receipt scanning
- **Preprocessing is critical** — Good image processing = 2-3x better OCR accuracy
- **Language-aware** — Load appropriate Tesseract language pack based on user locale
- **Graceful degradation** — Manual entry fallback when OCR fails

## Workflow

### Step 1: Camera Capture UI

```tsx
function ReceiptCamera({ onCapture }: { onCapture: (image: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',  // Back camera
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  const capture = () => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob(blob => blob && onCapture(blob), 'image/jpeg', 0.9);
  };

  return (
    <div className="relative flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
      <canvas ref={canvasRef} className="hidden" />
      {/* Receipt alignment guide */}
      <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-dashed border-white/60" />
      <Button
        onClick={capture}
        size="lg"
        className="mt-4 min-h-[56px] min-w-[56px] rounded-full"
      >
        Capture
      </Button>
    </div>
  );
}
```

### Step 2: Image Preprocessing

```ts
async function preprocessReceiptImage(imageBlob: Blob): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = await createImageBitmap(imageBlob);

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Apply threshold (binarization) for cleaner OCR
  const threshold = 128;
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = val;
  }

  // Increase contrast
  ctx.putImageData(imageData, 0, 0);
  ctx.filter = 'contrast(1.5)';
  ctx.drawImage(canvas, 0, 0);

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
}
```

### Step 3: Tesseract OCR

```ts
import { createWorker } from 'tesseract.js';
import { getOCRLanguage } from '@/lib/parsers/tesseract-lang-map';

async function performOCR(
  imageBlob: Blob,
  locale: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const lang = getOCRLanguage(locale); // e.g., 'eng', 'fra', 'deu'

  const worker = await createWorker(lang, undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    },
  });

  const { data: { text } } = await worker.recognize(imageBlob);
  await worker.terminate();

  return text;
}
```

### Step 4: Receipt Data Extraction

```ts
interface ReceiptData {
  merchant: string | null;
  date: string | null;       // ISO date
  total: string | null;      // Decimal string
  subtotal: string | null;
  tax: string | null;
  items: ReceiptItem[];
  rawText: string;
  confidence: number;        // 0-1
}

function extractReceiptData(ocrText: string, locale: string): ReceiptData {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);

  return {
    merchant: extractMerchant(lines),
    date: extractDate(lines, locale),
    total: extractTotal(lines, locale),
    subtotal: extractSubtotal(lines, locale),
    tax: extractTax(lines, locale),
    items: extractLineItems(lines, locale),
    rawText: ocrText,
    confidence: calculateConfidence(lines),
  };
}

function extractMerchant(lines: string[]): string | null {
  // Merchant name is typically the first 1-2 lines
  // Often in ALL CAPS or larger font (appears as first non-empty line)
  return lines[0] || null;
}

function extractTotal(lines: string[], locale: string): string | null {
  // Look for "TOTAL", "AMOUNT DUE", "BALANCE DUE"
  const totalPatterns = [
    /TOTAL\s*[:\$€£¥]?\s*([\d,]+\.?\d*)/i,
    /AMOUNT\s*DUE\s*[:\$€£¥]?\s*([\d,]+\.?\d*)/i,
    /BALANCE\s*DUE\s*[:\$€£¥]?\s*([\d,]+\.?\d*)/i,
  ];

  for (const line of lines.reverse()) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) return match[1].replace(/,/g, '');
    }
  }
  return null;
}
```

### Step 5: Receipt-to-Transaction Linking

```tsx
function ReviewReceiptData({ receiptData, onConfirm }: Props) {
  const [merchant, setMerchant] = useState(receiptData.merchant || '');
  const [amount, setAmount] = useState(receiptData.total || '');
  const [date, setDate] = useState(receiptData.date || new Date().toISOString().split('T')[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Receipt</CardTitle>
        <Badge variant={receiptData.confidence > 0.8 ? 'default' : 'secondary'}>
          {Math.round(receiptData.confidence * 100)}% confident
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Merchant</Label>
          <Input value={merchant} onChange={e => setMerchant(e.target.value)} />
        </div>
        <div>
          <Label>Total Amount</Label>
          <CurrencyInput value={amount} onChange={setAmount} currency="USD" locale="en-US" />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <Button onClick={() => onConfirm({ merchant, amount, date })}>
          Create Transaction
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/receipt-ocr.ts` | Receipt OCR processing |
| `src/lib/parsers/tesseract-lang-map.ts` | Locale-to-Tesseract language mapping |
| `src/lib/bank-statement-ocr.ts` | Bank statement OCR (related) |
| `src/components/budget/` | Receipt scanner UI components |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping image preprocessing | Always preprocess (grayscale + threshold + contrast) |
| Loading all Tesseract languages | Load only the user's locale language |
| Not showing confidence score | Always show OCR confidence to user |
| Blocking UI during OCR | Use web worker + progress indicator |
| No manual override for OCR errors | Always allow editing of extracted fields |
| Hardcoding receipt patterns for one locale | Use locale-aware patterns |

## Validation Checklist

- [ ] Camera uses back-facing (`facingMode: 'environment'`)
- [ ] Image preprocessing applied before OCR
- [ ] Correct Tesseract language loaded for user locale
- [ ] Progress indicator during OCR processing
- [ ] Confidence score shown to user
- [ ] All extracted fields editable (manual override)
- [ ] Receipt image stored encrypted if saved
- [ ] Works on mobile (primary use case)

## Related Skills

- `mobile-first-ux` — camera UI must be mobile-optimized
- `e2e-encryption` — receipt images encrypted before storage
- `pdf-ocr-import` — related OCR pipeline for bank statements
- `document-vault` — receipt storage patterns
