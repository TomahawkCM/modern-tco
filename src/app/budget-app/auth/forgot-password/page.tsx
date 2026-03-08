"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const t = useTranslations("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("forgotPassword.defaultError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20">
            <CheckCircle2 className="h-6 w-6 text-teal-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {t("forgotPassword.checkEmailTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t("forgotPassword.resetLinkSent", { email })}
          </p>
          <p className="mt-4 text-xs text-slate-500">{t("forgotPassword.checkSpam")}</p>
        </div>

        <div className="text-center">
          <Link
            href="/budget-app/auth/login"
            className="text-sm font-medium text-teal-400 hover:text-teal-300"
          >
            {t("forgotPassword.backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{t("forgotPassword.title")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            {t("forgotPassword.emailLabel")}
          </label>
          <Input
            type="email"
            placeholder={t("forgotPassword.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {t("forgotPassword.sendResetLink")}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        {t("forgotPassword.rememberPassword")}{" "}
        <Link
          href="/budget-app/auth/login"
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          {t("forgotPassword.signInLink")}
        </Link>
      </div>
    </div>
  );
}
