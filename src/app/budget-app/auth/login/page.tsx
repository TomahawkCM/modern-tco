"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BudgetLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");

  // Redirect if already logged in?
  // We'll let the layout/guard handle that typically, but good to have here too maybe.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      // Check if email is verified? Supabase handles this usually by denying login if configured to "Confirm email".
      // Depending on config, user might log in but we can check if they verified.

      router.push("/budget-app");
    } catch (err: any) {
      setError(err.message || t("login.defaultError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">{t("login.title")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t("login.emailLabel")}</label>
          <Input
            type="email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">{t("login.passwordLabel")}</label>
            <Link
              href="/budget-app/auth/forgot-password"
              className="text-xs text-teal-400 hover:text-teal-300"
            >
              {t("login.forgotPassword")}
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {t("login.signInButton")}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        {t("login.noAccount")}{" "}
        <Link
          href="/budget-app/auth/signup"
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          {t("login.startFreeTrial")}
        </Link>
      </div>
    </div>
  );
}
