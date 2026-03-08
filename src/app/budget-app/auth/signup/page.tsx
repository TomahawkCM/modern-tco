"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function BudgetSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const t = useTranslations("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("signup.passwordsMismatch"));
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError(t("signup.passwordTooShort"));
      setIsSubmitting(false);
      return;
    }

    try {
      const firstName = fullName.split(" ")[0] || "User";
      const lastName = fullName.split(" ").slice(1).join(" ") || "";

      const { error: signUpError } = await signUp(email, password, {
        firstName,
        lastName,
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("signup.defaultError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-white">{t("signup.verifyEmailTitle")}</h2>
        <p className="mb-8 text-slate-400">
          {t("signup.verifyEmailSent", { email })} {t("signup.verifyEmailActivate")}
        </p>
        <Link href="/budget-app/auth/login">
          <Button
            variant="outline"
            className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white"
          >
            {t("signup.returnToLogin")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{t("signup.title")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("signup.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t("signup.fullNameLabel")}</label>
          <Input
            type="text"
            placeholder={t("signup.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t("signup.emailLabel")}</label>
          <Input
            type="email"
            placeholder={t("signup.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t("signup.passwordLabel")}</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("signup.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
              required
              disabled={isSubmitting}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            {t("signup.confirmPasswordLabel")}
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("signup.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
              required
              disabled={isSubmitting}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-500 text-white hover:bg-teal-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("signup.createAccountButton")}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        {t("signup.hasAccount")}{" "}
        <Link
          href="/budget-app/auth/login"
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          {t("signup.signInLink")}
        </Link>
      </div>
    </div>
  );
}
