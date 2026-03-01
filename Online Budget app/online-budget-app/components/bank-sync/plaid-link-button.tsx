"use client";

import { useState, useCallback, useEffect } from "react";
import { usePlaidLink, type PlaidLinkOnSuccess } from "react-plaid-link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LinkIcon, Loader2Icon, AlertCircleIcon } from "lucide-react";

interface PlaidLinkButtonProps {
  /** Called after a bank is successfully connected. */
  onSuccess?: (bankId: string) => void;
  /** Called when the user exits Plaid Link without connecting. */
  onExit?: () => void;
  /** Optional institution_id to associate with the connection. */
  institutionId?: string;
}

export function PlaidLinkButton({
  onSuccess: onSuccessCallback,
  onExit: onExitCallback,
  institutionId,
}: PlaidLinkButtonProps) {
  const t = useTranslations("bankSync");

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token from our API
  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plaid/link-token", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create link token");
      }

      const data = (await response.json()) as { link_token: string };
      setLinkToken(data.link_token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to bank";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle successful Plaid Link connection
  const handleSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            institution_id: institutionId ?? null,
          }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to exchange token");
        }

        const data = (await response.json()) as { id: string };
        onSuccessCallback?.(data.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect bank";
        setError(message);
      } finally {
        setLoading(false);
        setLinkToken(null);
      }
    },
    [institutionId, onSuccessCallback]
  );

  // Handle Plaid Link exit
  const handleExit = useCallback(() => {
    setLinkToken(null);
    onExitCallback?.();
  }, [onExitCallback]);

  // usePlaidLink hook
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  });

  // Automatically open Plaid Link when token becomes ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  // Handle button click: fetch token if not ready, or open if ready
  const handleClick = useCallback(async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  }, [linkToken, ready, open, fetchLinkToken]);

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={loading} variant="outline">
        {loading ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LinkIcon className="mr-2 h-4 w-4" />
        )}
        {loading ? t("connecting") : t("connectBank")}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
