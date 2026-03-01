"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadIcon,
  CameraIcon,
  FileTextIcon,
  Loader2Icon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
  ImageIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OcrDashboardProps {
  currency: string;
  locale: string;
}

type OcrState = "idle" | "processing" | "results";

interface ExtractedData {
  merchant: string;
  amount: string;
  date: string;
  items: string[];
  rawText: string;
}

interface AccountOption {
  id: string;
  name: string;
  currency: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/* ------------------------------------------------------------------ */
/*  Text extraction helpers                                            */
/* ------------------------------------------------------------------ */

function extractMerchant(text: string): string {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  // Merchant is typically in the first few non-empty lines
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Skip lines that look like dates, amounts, or phone numbers
    if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(trimmed)) continue;
    if (/^\$?\d+\.\d{2}$/.test(trimmed)) continue;
    if (/^[\d\s()+-]{7,}$/.test(trimmed)) continue;
    if (trimmed.length >= 2 && trimmed.length <= 60) {
      return trimmed;
    }
  }
  return "";
}

function extractTotal(text: string): string {
  const patterns = [
    /(?:grand\s*total|total\s*due|amount\s*due|balance\s*due|total)[:\s]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /(?:total)[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /\$\s*([\d,]+\.\d{2})/g,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return match[1].replace(/,/g, "");
    }
  }

  // Fallback: find the largest dollar amount
  const amountRegex = /\$?\s*(\d{1,6}\.\d{2})/g;
  let largest = 0;
  let result: RegExpExecArray | null;
  while ((result = amountRegex.exec(text)) !== null) {
    const val = parseFloat(result[1] ?? "0");
    if (val > largest) largest = val;
  }

  return largest > 0 ? largest.toFixed(2) : "";
}

function extractDate(text: string): string {
  // Try common date formats
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/,
    // MM/DD/YY
    /(\d{1,2})[/\-](\d{1,2})[/\-](\d{2})(?!\d)/,
    // Month DD, YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      try {
        const dateStr = match[0] ?? "";
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split("T")[0] ?? "";
        }
      } catch {
        // continue to next pattern
      }
    }
  }

  // Default to today
  return new Date().toISOString().split("T")[0] ?? "";
}

function extractLineItems(text: string): string[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Lines that contain both text and an amount pattern are likely line items
    if (/\S+.*\$?\s*\d+\.\d{2}/.test(trimmed) && trimmed.length > 5) {
      // Exclude total/subtotal lines
      if (!/^(sub\s*)?total|^tax|^balance|^amount|^change|^cash|^card/i.test(trimmed)) {
        items.push(trimmed);
      }
    }
  }

  return items;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OcrDashboard({ currency }: OcrDashboardProps) {
  const t = useTranslations("ocr");

  /* ---- State ---- */

  const [state, setState] = useState<OcrState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    merchant: "",
    amount: "",
    date: "",
    items: [],
    rawText: "",
  });
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- Fetch accounts on mount ---- */

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data: AccountOption[] = await res.json();
          setAccounts(data);
          if (data.length > 0) {
            setSelectedAccountId(data[0]!.id);
          }
        }
      } catch {
        // silently ignore
      }
    }
    fetchAccounts();
  }, []);

  /* ---- File handling ---- */

  const validateFile = useCallback(
    (f: File): string | null => {
      if (f.size > MAX_FILE_SIZE) {
        return t("errors.tooLarge");
      }
      if (!ACCEPTED_TYPES.includes(f.type)) {
        return t("errors.invalidType");
      }
      return null;
    },
    [t]
  );

  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      setSuccess(null);

      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(f);

      // Create preview URL
      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        setPreview(url);
      } else {
        setPreview(null);
      }

      // Start OCR processing
      setState("processing");
      setProgress(0);
      setProgressLabel(t("processing.analyzing"));

      try {
        // Dynamic import to avoid SSR issues
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng", undefined, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
              setProgressLabel(t("processing.extracting"));
            }
          },
        });

        const result = await worker.recognize(f);
        const text = result.data.text;

        await worker.terminate();

        if (!text || text.trim().length === 0) {
          setError(t("errors.noText"));
          setState("idle");
          return;
        }

        // Extract structured data from OCR text
        const merchant = extractMerchant(text);
        const amount = extractTotal(text);
        const date = extractDate(text);
        const items = extractLineItems(text);

        setExtractedData({
          merchant,
          amount,
          date,
          items,
          rawText: text,
        });

        setState("results");
      } catch {
        setError(t("errors.ocrFailed"));
        setState("idle");
      }
    },
    [validateFile, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  /* ---- Actions ---- */

  const handleCreateTransaction = useCallback(async () => {
    if (!selectedAccountId) {
      setError(t("errors.accountRequired"));
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const amountNum = parseFloat(extractedData.amount);
      if (isNaN(amountNum)) {
        setError(t("errors.createFailed"));
        setSaving(false);
        return;
      }

      // Convert to minor units (cents) and make negative since it's an expense
      const amountMinor = -Math.round(Math.abs(amountNum) * 100);

      const account = accounts.find((a) => a.id === selectedAccountId);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccountId,
          amount_minor: amountMinor,
          currency: account?.currency ?? currency,
          transaction_date: extractedData.date,
          description:
            extractedData.items.length > 0
              ? extractedData.items.join("; ")
              : extractedData.merchant,
          merchant_name: extractedData.merchant,
        }),
      });

      if (res.ok) {
        setSuccess(t("success.transactionCreated"));
      } else {
        setError(t("errors.createFailed"));
      }
    } catch {
      setError(t("errors.createFailed"));
    } finally {
      setSaving(false);
    }
  }, [selectedAccountId, extractedData, accounts, currency, t]);

  const handleSaveReceipt = useCallback(async () => {
    if (!file) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Build a storage path reference (actual upload handled server-side or via signed URL)
      const timestamp = Date.now();
      const storagePath = `receipts/${timestamp}-${file.name}`;

      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage_path: storagePath,
          extracted_data: {
            merchant: extractedData.merchant,
            amount: extractedData.amount,
            date: extractedData.date,
            items: extractedData.items,
            rawText: extractedData.rawText,
          },
        }),
      });

      if (res.ok) {
        setSuccess(t("success.receiptSaved"));
      } else {
        setError(t("errors.saveFailed"));
      }
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [file, extractedData, t]);

  const handleDiscard = useCallback(() => {
    // Clean up preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setProgress(0);
    setProgressLabel("");
    setExtractedData({
      merchant: "",
      amount: "",
      date: "",
      items: [],
      rawText: "",
    });
    setError(null);
    setSuccess(null);
    setState("idle");
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [preview]);

  /* ---- Render: Idle state (Upload) ---- */

  if (state === "idle") {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CameraIcon className="size-5" />
              {t("upload.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
            >
              <UploadIcon className="mb-4 size-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                {dragOver ? t("upload.dropHere") : t("upload.dragDrop")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("upload.supportedFormats")}</p>
              <p className="text-xs text-muted-foreground">{t("upload.maxSize")}</p>
              <Button variant="outline" className="mt-4" type="button">
                {t("upload.browse")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Render: Processing state ---- */

  if (state === "processing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-5 animate-spin" />
            {t("processing.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image preview */}
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-48 rounded-md border object-contain"
              />
            </div>
          )}

          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground">{progressLabel}</p>
            <p className="text-center text-xs text-muted-foreground">
              {t("processing.progress", { progress })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---- Render: Results state ---- */

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircleIcon className="size-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column: Image preview + raw text */}
        <div className="space-y-4">
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="size-4" />
                  {file?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={preview}
                  alt="Receipt"
                  className="w-full rounded-md border object-contain"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileTextIcon className="size-4" />
                {t("results.rawText")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="h-48 w-full resize-y rounded-md border border-border bg-muted/50 p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={extractedData.rawText}
                readOnly
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Editable extracted data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("results.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Merchant */}
            <div className="space-y-2">
              <Label htmlFor="ocr-merchant">{t("results.merchant")}</Label>
              <Input
                id="ocr-merchant"
                value={extractedData.merchant}
                placeholder={t("results.merchantPlaceholder")}
                onChange={(e) =>
                  setExtractedData((prev) => ({
                    ...prev,
                    merchant: e.target.value,
                  }))
                }
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="ocr-amount">{t("results.amount")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency === "USD"
                    ? "$"
                    : currency === "EUR"
                      ? "\u20AC"
                      : currency === "GBP"
                        ? "\u00A3"
                        : currency}
                </span>
                <Input
                  id="ocr-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-8"
                  value={extractedData.amount}
                  placeholder={t("results.amountPlaceholder")}
                  onChange={(e) =>
                    setExtractedData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="ocr-date">{t("results.date")}</Label>
              <Input
                id="ocr-date"
                type="date"
                value={extractedData.date}
                onChange={(e) =>
                  setExtractedData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <Label htmlFor="ocr-items">{t("results.items")}</Label>
              <textarea
                id="ocr-items"
                className="h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("results.itemsPlaceholder")}
                value={extractedData.items.join("\n")}
                onChange={(e) =>
                  setExtractedData((prev) => ({
                    ...prev,
                    items: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                  }))
                }
              />
            </div>

            {/* Account selector */}
            <div className="space-y-2">
              <Label>{t("results.account")}</Label>
              {accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("results.noAccounts")}</p>
              ) : (
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("results.selectAccount")} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acct) => (
                      <SelectItem key={acct.id} value={acct.id}>
                        {acct.name} ({acct.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={handleCreateTransaction}
                disabled={saving || !extractedData.amount || !selectedAccountId}
              >
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    {t("actions.creating")}
                  </>
                ) : (
                  t("actions.createTransaction")
                )}
              </Button>

              <Button variant="secondary" onClick={handleSaveReceipt} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    {t("actions.saving")}
                  </>
                ) : (
                  t("actions.saveReceipt")
                )}
              </Button>

              <Button variant="outline" onClick={handleDiscard} disabled={saving}>
                <XIcon className="size-4" />
                {t("actions.discard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
