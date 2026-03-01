"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  detectFileFormat,
  parseCSVContent,
  detectBankWithConfidence,
  convertToTransactions,
  convertToTransactionsUniversal,
  parseOFXFile,
  getBankConfig,
} from "@/lib/parsers";
import type { ParsedTransaction, FormatDetectionResult, BankDetectionResult } from "@/lib/parsers";

type Step = "upload" | "configure" | "preview" | "import";
const STEPS: Step[] = ["upload", "configure", "preview", "import"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface AccountOption {
  id: string;
  name: string;
  currency: string;
}

interface ImportResult {
  importedCount: number;
  skippedCount: number;
}

export default function ImportPage() {
  const t = useTranslations("import");
  const tc = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [formatResult, setFormatResult] = useState<FormatDetectionResult | null>(null);
  const [bankResult, setBankResult] = useState<BankDetectionResult | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data: AccountOption[] = await res.json();
        setAccounts(data);
        if (data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data[0]!.id);
          setSelectedCurrency(data[0]!.currency);
        }
      }
    } catch {
      // silently ignore
    }
  }, [selectedAccountId]);

  // Handle file selection
  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      if (f.size > MAX_FILE_SIZE) {
        setError(t("errors.fileTooLarge"));
        return;
      }

      setFile(f);

      // Detect format (async)
      const format = await detectFileFormat(f);
      setFormatResult(format);

      // Read file content
      const text = await f.text();
      setFileContent(text);

      // Fetch accounts for configure step
      await fetchAccounts();

      // Auto-advance to configure
      setStep("configure");
    },
    [t, fetchAccounts]
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

  // Parse and advance to preview
  const goToPreview = useCallback(async () => {
    if (!selectedAccountId) return;
    setError(null);

    try {
      const format = formatResult?.format ?? "csv";
      let parsed: ParsedTransaction[] = [];

      if (format === "ofx" || format === "qfx" || format === "qbo") {
        const ofxData = await parseOFXFile(fileContent, selectedAccountId);
        parsed = ofxData.transactions;
      } else {
        // CSV parsing
        const rows = parseCSVContent(fileContent);
        if (rows.length === 0) {
          setError(t("errors.noTransactions"));
          return;
        }

        // Get headers from first row keys
        const headers = Object.keys(rows[0]!);

        // Detect bank
        const bank = detectBankWithConfidence(headers);
        setBankResult(bank);

        if (bank.bank && bank.confidence > 0.5) {
          const config = getBankConfig(bank.bank);
          if (config) {
            parsed = convertToTransactions(rows, config, selectedAccountId);
          }
        }

        // Fallback to universal parser
        if (parsed.length === 0) {
          const result = await convertToTransactionsUniversal(rows, selectedAccountId);
          parsed = result.transactions;
        }
      }

      if (parsed.length === 0) {
        setError(t("errors.noTransactions"));
        return;
      }

      setTransactions(parsed);
      setStep("preview");
    } catch {
      setError(t("errors.parseError"));
    }
  }, [fileContent, formatResult, selectedAccountId, t]);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!selectedAccountId || transactions.length === 0) return;
    setImporting(true);
    setImportProgress(0);
    setError(null);

    // Filter out duplicates
    const newTransactions = transactions.filter((tx) => !tx.isDuplicate);
    if (newTransactions.length === 0) {
      setImportResult({ importedCount: 0, skippedCount: transactions.length });
      setStep("import");
      setImporting(false);
      return;
    }

    try {
      const account = accounts.find((a) => a.id === selectedAccountId);
      const currency = account?.currency ?? selectedCurrency;

      // Convert to API format
      const payload = newTransactions.map((tx) => ({
        account_id: selectedAccountId,
        amount_minor: Math.round(tx.amount * 100),
        currency,
        transaction_date: tx.date.toISOString().split("T")[0],
        description: tx.description,
        merchant_name: tx.description,
        fitid: tx.fitid,
      }));

      setImportProgress(50);

      const res = await fetch("/api/import/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payload }),
      });

      setImportProgress(100);

      if (res.ok) {
        const data = await res.json();
        setImportResult({
          importedCount: data.count,
          skippedCount: transactions.length - newTransactions.length,
        });
        setStep("import");
      } else {
        setError(t("errors.importFailed"));
      }
    } catch {
      setError(t("errors.importFailed"));
    } finally {
      setImporting(false);
    }
  }, [selectedAccountId, transactions, accounts, selectedCurrency, t]);

  const stepIndex = STEPS.indexOf(step);
  const duplicateCount = transactions.filter((tx) => tx.isDuplicate).length;
  const newCount = transactions.length - duplicateCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <Badge variant={i <= stepIndex ? "default" : "outline"}>
              {i + 1}. {t(`steps.${s}`)}
            </Badge>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4" />
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("upload.title")}</CardTitle>
            <CardDescription>{t("upload.description")}</CardDescription>
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
                {dragOver ? t("upload.dropHere") : t("upload.description")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("upload.supportedFormats")}</p>
              <p className="text-xs text-muted-foreground">{t("upload.maxSize")}</p>
              <Button variant="outline" className="mt-4">
                {t("upload.browse")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.ofx,.qfx,.qbo"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure */}
      {step === "configure" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("configure.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected file info */}
            {file && (
              <div className="flex items-center gap-2 rounded-md border border-border p-3">
                <FileIcon className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  {t("upload.selectedFile")}: {file.name}
                </span>
                {formatResult && (
                  <Badge variant="outline">{formatResult.format.toUpperCase()}</Badge>
                )}
              </div>
            )}

            {/* Account selector */}
            <div className="space-y-2">
              <Label>{t("configure.account")}</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(v) => {
                  setSelectedAccountId(v);
                  const acct = accounts.find((a) => a.id === v);
                  if (acct) setSelectedCurrency(acct.currency);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("configure.selectAccount")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acct) => (
                    <SelectItem key={acct.id} value={acct.id}>
                      {acct.name} ({acct.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank detection info */}
            {bankResult && (
              <p className="text-sm text-muted-foreground">
                {bankResult.bank
                  ? t("configure.bankDetected", { bank: bankResult.bank })
                  : t("configure.bankNotDetected")}
              </p>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setFileContent("");
                  setFormatResult(null);
                  setBankResult(null);
                  setTransactions([]);
                  setError(null);
                }}
              >
                <ArrowLeftIcon />
                {tc("back")}
              </Button>
              <Button onClick={goToPreview} disabled={!selectedAccountId}>
                {tc("next")}
                <ArrowRightIcon />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("preview.title")}</CardTitle>
            <CardDescription>
              {t("preview.description", { count: transactions.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Duplicate summary */}
            <p className="text-sm text-muted-foreground">
              {t("preview.duplicates", { count: duplicateCount })}
            </p>

            {/* Transaction preview table */}
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("preview.columns.date")}</TableHead>
                    <TableHead>{t("preview.columns.description")}</TableHead>
                    <TableHead className="text-right">{t("preview.columns.amount")}</TableHead>
                    <TableHead>{t("preview.columns.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 50).map((tx, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{tx.date.toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-48 truncate text-sm">{tx.description}</TableCell>
                      <TableCell
                        className={`text-right text-sm font-medium ${
                          tx.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.isDuplicate ? "secondary" : "default"}>
                          {tx.isDuplicate ? t("preview.status.duplicate") : t("preview.status.new")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length > 50 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  ... +{transactions.length - 50} more
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("configure")}>
                <ArrowLeftIcon />
                {tc("back")}
              </Button>
              <Button onClick={handleImport} disabled={importing || newCount === 0}>
                {importing ? t("importing.title") : t("steps.import")}
                {!importing && <ArrowRightIcon />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Import result */}
      {step === "import" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-5 text-green-600" />
              <CardTitle>{t("complete.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {importing ? (
              <div className="space-y-3">
                <p className="text-sm">{t("importing.title")}</p>
                <Progress value={importProgress} />
                <p className="text-xs text-muted-foreground">
                  {t("importing.progress", {
                    imported: Math.round((importProgress / 100) * transactions.length),
                    total: transactions.length,
                  })}
                </p>
              </div>
            ) : (
              importResult && (
                <div className="space-y-2">
                  <p className="text-sm">
                    {t("complete.imported", {
                      count: importResult.importedCount,
                    })}
                  </p>
                  {importResult.skippedCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("complete.skipped", {
                        count: importResult.skippedCount,
                      })}
                    </p>
                  )}
                  <Button variant="outline" onClick={() => router.push("/transactions")}>
                    {t("complete.viewTransactions")}
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
