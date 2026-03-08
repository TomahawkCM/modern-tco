"use client";

/**
 * SimpleFIN Connection Modal
 *
 * Multi-step modal for connecting bank accounts via SimpleFIN Bridge.
 *
 * Flow:
 * 1. Introduction - Explain what SimpleFIN is
 * 2. Get Token - User gets token from SimpleFIN Bridge
 * 3. Enter Token - User pastes setup token
 * 4. Connect - Claim token and validate connection
 * 5. Link Accounts - Map SimpleFIN accounts to local accounts
 * 6. Success - Show connected accounts
 */

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building2,
  Link2,
  ShieldCheck,
  ArrowRight,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  SimpleFINClient,
  SimpleFINError,
  type SimpleFINAccount,
  type ParsedSimpleFINAccount,
  parseSimpleFINAccountForDisplay,
} from "@/lib/simplefin";

// =============================================================================
// TYPES
// =============================================================================

interface SimpleFINConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localAccounts: { id: string; name: string }[];
  onConnect: (
    accessUrl: string,
    linkedAccounts: Array<{
      simplefinId: string;
      localAccountId: string | null;
      importEnabled: boolean;
    }>
  ) => Promise<void>;
}

type Step =
  | "intro"
  | "get-token"
  | "enter-token"
  | "connecting"
  | "link-accounts"
  | "success"
  | "error";

interface LinkConfig {
  simplefinId: string;
  localAccountId: string | null;
  importEnabled: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIMPLEFIN_BRIDGE_URL = "https://bridge.simplefin.org/simplefin/create";

// =============================================================================
// COMPONENT
// =============================================================================

export function SimpleFINConnect({
  open,
  onOpenChange,
  localAccounts,
  onConnect,
}: SimpleFINConnectProps) {
  // State
  const locale = useLocale();
  const t = useTranslations("simplefinConnect");
  const [step, setStep] = useState<Step>("intro");
  const [setupToken, setSetupToken] = useState("");
  const [accessUrl, setAccessUrl] = useState("");
  const [accounts, setAccounts] = useState<ParsedSimpleFINAccount[]>([]);
  const [linkConfigs, setLinkConfigs] = useState<Record<string, LinkConfig>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setStep("intro");
        setSetupToken("");
        setAccessUrl("");
        setAccounts([]);
        setLinkConfigs({});
        setError(null);
        setIsLoading(false);
      }
      onOpenChange(open);
    },
    [onOpenChange]
  );

  // Open SimpleFIN Bridge in new tab
  const openSimpleFINBridge = useCallback(() => {
    window.open(SIMPLEFIN_BRIDGE_URL, "_blank", "noopener,noreferrer");
    setStep("enter-token");
  }, []);

  // Claim token and fetch accounts
  const claimToken = useCallback(async () => {
    if (!setupToken.trim()) {
      setError(t("enterTokenError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep("connecting");

    try {
      // Claim the token
      const url = await SimpleFINClient.claimToken(setupToken.trim());
      setAccessUrl(url);

      // Create client and fetch accounts
      const client = new SimpleFINClient({ accessUrl: url });
      const data = await client.getAccounts({ balancesOnly: true });

      if (data.accounts.length === 0) {
        throw new Error(t("noAccountsFound"));
      }

      // Parse accounts for display
      const parsed = data.accounts.map(parseSimpleFINAccountForDisplay);
      setAccounts(parsed);

      // Initialize link configs
      const configs: Record<string, LinkConfig> = {};
      for (const account of parsed) {
        configs[account.id] = {
          simplefinId: account.id,
          localAccountId: null,
          importEnabled: true,
        };
      }
      setLinkConfigs(configs);

      setStep("link-accounts");
    } catch (err) {
      if (err instanceof SimpleFINError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("unexpectedError"));
      }
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }, [setupToken]);

  // Update link config for an account
  const updateLinkConfig = useCallback((accountId: string, updates: Partial<LinkConfig>) => {
    setLinkConfigs((prev) => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...updates },
    }));
  }, []);

  // Complete connection
  const completeConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const linkedAccounts = Object.values(linkConfigs);
      await onConnect(accessUrl, linkedAccounts);
      setStep("success");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("failedToSave"));
      }
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }, [accessUrl, linkConfigs, onConnect]);

  // Render step content
  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t("connectYourBank")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("autoImportDescription")}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{t("securePrivate")}</p>
                  <p className="text-xs text-muted-foreground">{t("securePrivateDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{t("automaticSync")}</p>
                  <p className="text-xs text-muted-foreground">{t("automaticSyncDescription")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">{t("linkToBudget")}</p>
                  <p className="text-xs text-muted-foreground">{t("linkToBudgetDescription")}</p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("subscriptionTitle")}</AlertTitle>
              <AlertDescription>
                {t("subscriptionDescription")}
                <a
                  href="https://bridge.simplefin.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {t("learnMore")} <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button onClick={() => setStep("get-token")} className="w-full">
              {t("getStarted")}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </div>
        );

      case "get-token":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("step1Title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("step1Description")}</p>
            </div>

            <div className="space-y-4">
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>{t("instruction1")}</li>
                <li>{t("instruction2")}</li>
                <li>{t("instruction3")}</li>
                <li>{t("instruction4")}</li>
                <li>{t("instruction5")}</li>
              </ol>

              <Button onClick={openSimpleFINBridge} className="w-full">
                {t("openBridge")}
                <ExternalLink className="ms-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {t("alreadyHaveToken")}{" "}
              <button
                onClick={() => setStep("enter-token")}
                className="text-primary hover:underline"
              >
                {t("enterItHere")}
              </button>
            </p>
          </div>
        );

      case "enter-token":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("step2Title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("step2Description")}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-token">{t("setupToken")}</Label>
                <div className="relative">
                  <Input
                    id="setup-token"
                    placeholder="aHR0cHM6Ly9icmlkZ2Uuc2..."
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="pe-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setSetupToken(text);
                      } catch {
                        // Clipboard access denied
                      }
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("tokenHint")}</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={claimToken}
                disabled={!setupToken.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("connecting")}
                  </>
                ) : (
                  <>
                    {t("connect")}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setStep("get-token")} className="w-full">
              {t("back")}
            </Button>
          </div>
        );

      case "connecting":
        return (
          <div className="space-y-6 py-8">
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{t("connectingTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("fetchingAccounts")}</p>
              </div>
            </div>
            <Progress value={33} className="w-full" />
          </div>
        );

      case "link-accounts":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("step3Title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("step3Description")}</p>
            </div>

            <div className="max-h-[300px] space-y-4 overflow-y-auto">
              {accounts.map((account) => {
                const config = linkConfigs[account.id];
                return (
                  <div key={account.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.institution}</p>
                      </div>
                      <div className="text-end">
                        <p className="font-medium">
                          {account.currency}{" "}
                          {account.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("asOf", { date: account.balanceDate.toLocaleDateString(locale) })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`import-${account.id}`}
                          checked={config?.importEnabled ?? true}
                          onCheckedChange={(checked) =>
                            updateLinkConfig(account.id, {
                              importEnabled: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor={`import-${account.id}`} className="text-sm">
                          {t("importTransactions")}
                        </Label>
                      </div>
                    </div>

                    {config?.importEnabled && localAccounts.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">{t("importTo")}</Label>
                        <Select
                          value={config?.localAccountId || "new"}
                          onValueChange={(value) =>
                            updateLinkConfig(account.id, {
                              localAccountId: value === "new" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectAccount")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{t("createNewAccount")}</SelectItem>
                            {localAccounts.map((local) => (
                              <SelectItem key={local.id} value={local.id}>
                                {local.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={completeConnection} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  {t("completeSetup")}
                  <CheckCircle className="ms-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t("connectionSuccessful")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("accountsConnected", { count: accounts.length })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{account.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{account.institution}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">{t("syncDescription")}</p>

            <Button onClick={() => handleOpenChange(false)} className="w-full">
              {t("done")}
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t("connectionFailed")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error || t("genericError")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={() => setStep("enter-token")} className="w-full">
                {t("tryAgain")}
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full">
                {t("cancel")}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("dialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

export default SimpleFINConnect;
