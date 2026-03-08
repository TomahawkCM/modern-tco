"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const t = useTranslations("auth");

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // A valid password reset flow will have a session with aal1 (from the email link)
      setIsValidSession(!!session);
    };
    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("resetPassword.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.passwordsMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;
      setSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/budget-app/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || t("resetPassword.defaultError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{t("resetPassword.invalidLinkTitle")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("resetPassword.invalidLinkDescription")}</p>
        </div>

        <div className="text-center">
          <Link href="/budget-app/auth/forgot-password">
            <Button className="bg-teal-500 text-white hover:bg-teal-400">
              {t("resetPassword.requestNewLink")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20">
            <CheckCircle2 className="h-6 w-6 text-teal-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">{t("resetPassword.successTitle")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("resetPassword.successDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{t("resetPassword.title")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("resetPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            {t("resetPassword.newPasswordLabel")}
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            required
            disabled={isSubmitting}
            minLength={8}
          />
          <p className="text-xs text-slate-500">{t("resetPassword.passwordHint")}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            {t("resetPassword.confirmPasswordLabel")}
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            required
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-500 text-white hover:bg-teal-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("resetPassword.resetButton")}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
