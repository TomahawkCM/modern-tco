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
      setError("Please enter your SimpleFIN setup token");
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
        throw new Error(
          "No accounts found. Please ensure you have connected bank accounts in SimpleFIN Bridge."
        );
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
        setError("An unexpected error occurred");
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
        setError("Failed to save connection");
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
                <h3 className="text-lg font-semibold">Connect Your Bank</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Automatically import transactions from your bank accounts
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Secure & Private</p>
                  <p className="text-xs text-muted-foreground">
                    SimpleFIN never sees your login credentials. You control access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Automatic Sync</p>
                  <p className="text-xs text-muted-foreground">
                    Transactions sync daily. Manual import anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Link to Budget</p>
                  <p className="text-xs text-muted-foreground">
                    Map bank accounts to your budget accounts.
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>SimpleFIN Bridge Subscription</AlertTitle>
              <AlertDescription>
                SimpleFIN costs $1.50/month for up to 25 bank connections.
                <a
                  href="https://bridge.simplefin.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Learn more <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button onClick={() => setStep("get-token")} className="w-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case "get-token":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Step 1: Get Setup Token</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create or sign into your SimpleFIN account
              </p>
            </div>

            <div className="space-y-4">
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Click the button below to open SimpleFIN Bridge</li>
                <li>Sign in or create an account</li>
                <li>Connect your bank accounts</li>
                <li>Copy the Setup Token provided</li>
                <li>Return here and paste the token</li>
              </ol>

              <Button onClick={openSimpleFINBridge} className="w-full">
                Open SimpleFIN Bridge
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Already have a token?{" "}
              <button
                onClick={() => setStep("enter-token")}
                className="text-primary hover:underline"
              >
                Enter it here
              </button>
            </p>
          </div>
        );

      case "enter-token":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Step 2: Enter Setup Token</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste the token from SimpleFIN Bridge
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-token">Setup Token</Label>
                <div className="relative">
                  <Input
                    id="setup-token"
                    placeholder="aHR0cHM6Ly9icmlkZ2Uuc2..."
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
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
                <p className="text-xs text-muted-foreground">
                  The token is a long string starting with letters and numbers
                </p>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setStep("get-token")} className="w-full">
              Back
            </Button>
          </div>
        );

      case "connecting":
        return (
          <div className="space-y-6 py-8">
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Connecting...</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fetching your bank accounts from SimpleFIN
                </p>
              </div>
            </div>
            <Progress value={33} className="w-full" />
          </div>
        );

      case "link-accounts":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Step 3: Link Accounts</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose which accounts to sync and where to import transactions
              </p>
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
                      <div className="text-right">
                        <p className="font-medium">
                          {account.currency}{" "}
                          {account.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          as of {account.balanceDate.toLocaleDateString()}
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
                          Import transactions
                        </Label>
                      </div>
                    </div>

                    {config?.importEnabled && localAccounts.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Import to:</Label>
                        <Select
                          value={config?.localAccountId || "new"}
                          onValueChange={(value) =>
                            updateLinkConfig(account.id, {
                              localAccountId: value === "new" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Create new account</SelectItem>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="ml-2 h-4 w-4" />
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
                <h3 className="text-lg font-semibold">Connection Successful!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
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

            <p className="text-center text-sm text-muted-foreground">
              Your transactions will be automatically synced daily. You can also sync manually from
              the Import page.
            </p>

            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Done
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
                <h3 className="text-lg font-semibold">Connection Failed</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error || "An error occurred while connecting"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={() => setStep("enter-token")} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full">
                Cancel
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
            Connect Bank Account
          </DialogTitle>
          <DialogDescription>Link your bank accounts via SimpleFIN Bridge</DialogDescription>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

export default SimpleFINConnect;
