"use client";

import { useState, useEffect, useCallback } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface Passkey {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
}

export function PasskeyManagement() {
  const t = useTranslations("settings.passkeys");
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPasskeys = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_passkeys")
      .select("id, credential_id, device_name, created_at")
      .order("created_at", { ascending: false });
    setPasskeys((data as Passkey[]) ?? []);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  async function handleRegister() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1. Get registration options from server
      const optionsRes = await fetch("/api/auth/passkey/register-options");
      const optionsJSON = await optionsRes.json();

      if (!optionsRes.ok) {
        throw new Error(optionsJSON.error || "Failed to get options");
      }

      // 2. Start registration with the authenticator
      const attResp = await startRegistration({ optionsJSON });

      // 3. Send response to server for verification
      const verifyRes = await fetch("/api/auth/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...attResp,
          deviceName: deviceName || "Passkey",
        }),
      });

      const verifyJSON = await verifyRes.json();

      if (verifyJSON.verified) {
        setSuccess(t("registerSuccess"));
        setDeviceName("");
        fetchPasskeys();
      } else {
        throw new Error(verifyJSON.error || "Registration failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "InvalidStateError") {
          setError(t("alreadyRegistered"));
        } else if (err.name === "NotAllowedError") {
          setError(t("cancelled"));
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("user_passkeys").delete().eq("id", id);
    fetchPasskeys();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        {/* Existing passkeys */}
        {passkeys.length > 0 && (
          <div className="space-y-2">
            {passkeys.map((pk) => (
              <div key={pk.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{pk.device_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("addedOn", {
                      date: new Date(pk.created_at).toLocaleDateString(),
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(pk.id)}>
                  {t("remove")}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Register new passkey */}
        <div className="flex gap-2">
          <Input
            placeholder={t("deviceNamePlaceholder")}
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="max-w-[200px]"
          />
          <Button onClick={handleRegister} disabled={loading}>
            {loading ? t("registering") : t("addPasskey")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
