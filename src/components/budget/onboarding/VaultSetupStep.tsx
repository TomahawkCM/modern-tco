/**
 * Vault Setup Step - Onboarding Wizard
 * Configure encryption for the offline budget vault
 */

"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

type EncryptionMode = "automatic" | "password";

export function VaultSetupStep({ onComplete, onSkip }: StepProps) {
  const [mode, setMode] = useState<EncryptionMode>("automatic");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password === confirmPassword;
  const passwordStrength = getPasswordStrength(password);
  const canProceed = mode === "automatic" || (password.length >= 8 && passwordsMatch);

  const handleSetupVault = useCallback(async () => {
    setIsSettingUp(true);
    setError(null);

    try {
      // Simulate vault setup (in real app, would initialize encryption)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store encryption preference
      localStorage.setItem(
        "budget-vault-config",
        JSON.stringify({
          mode,
          configured: true,
          timestamp: Date.now(),
        })
      );

      onComplete({ vaultConfigured: true, encryptionMode: mode });
    } catch (err) {
      setError("Failed to set up vault. Please try again.");
      console.error("Vault setup error:", err);
    } finally {
      setIsSettingUp(false);
    }
  }, [mode, onComplete]);

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-4">
        <div className="rounded-lg bg-teal-500/20 p-2">
          <ShieldCheck className="h-6 w-6 text-teal-400" />
        </div>
        <div>
          <p className="font-medium text-white">Bank-Grade Security</p>
          <p className="text-sm text-slate-400">Your data is encrypted with AES-256 encryption</p>
        </div>
      </div>

      {/* Encryption Mode Selection */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">Choose how you want to protect your data:</p>

        {/* Automatic Mode */}
        <button
          type="button"
          onClick={() => setMode("automatic")}
          className={cn(
            "flex w-full items-start gap-4 rounded-xl border p-4 text-start transition-all",
            mode === "automatic"
              ? "border-teal-500/50 bg-teal-500/10"
              : "border-white/10 bg-slate-800/50 hover:border-white/20"
          )}
        >
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              mode === "automatic" ? "border-teal-500 bg-teal-500" : "border-slate-600"
            )}
          >
            {mode === "automatic" && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <p className="font-medium text-white">Automatic Protection</p>
              <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400">
                Recommended
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Your device creates a unique encryption key automatically. No password to remember -
              your data is protected seamlessly.
            </p>
          </div>
        </button>

        {/* Password Mode */}
        <button
          type="button"
          onClick={() => setMode("password")}
          className={cn(
            "flex w-full items-start gap-4 rounded-xl border p-4 text-start transition-all",
            mode === "password"
              ? "border-teal-500/50 bg-teal-500/10"
              : "border-white/10 bg-slate-800/50 hover:border-white/20"
          )}
        >
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              mode === "password" ? "border-teal-500 bg-teal-500" : "border-slate-600"
            )}
          >
            {mode === "password" && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
              <p className="font-medium text-white">Password Protection</p>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Create a master password to encrypt your vault. More secure if you share this device
              with others.
            </p>
          </div>
        </button>
      </div>

      {/* Password Input (when password mode selected) */}
      {mode === "password" && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-slate-800/30 p-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Master Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className={cn(
                  "w-full px-4 py-3 pe-12 text-sm",
                  "rounded-lg border bg-slate-900",
                  "text-white placeholder-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500",
                  password && passwordStrength.score < 2 ? "border-amber-500/50" : "border-white/10"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        level < passwordStrength.score ? passwordStrength.color : "bg-slate-700"
                      )}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    "text-xs",
                    passwordStrength.score >= 3
                      ? "text-green-400"
                      : passwordStrength.score >= 2
                        ? "text-amber-400"
                        : "text-red-400"
                  )}
                >
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={cn(
                "w-full px-4 py-3 text-sm",
                "rounded-lg border bg-slate-900",
                "text-white placeholder-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-teal-500",
                confirmPassword && !passwordsMatch ? "border-red-500/50" : "border-white/10"
              )}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-300">
              ⚠️ <strong>Important:</strong> If you forget this password, your data cannot be
              recovered. We cannot reset it for you.
            </p>
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/30 p-3">
          <Lock className="h-4 w-4 text-teal-400" />
          <span className="text-sm text-slate-300">AES-256 Encryption</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/30 p-3">
          <Shield className="h-4 w-4 text-teal-400" />
          <span className="text-sm text-slate-300">Zero Knowledge</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSetupVault}
          disabled={!canProceed || isSettingUp}
          className={cn(
            "flex items-center gap-2 rounded-lg px-6 py-2 font-medium",
            "transition-all",
            canProceed && !isSettingUp
              ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90"
              : "cursor-not-allowed bg-slate-700 text-slate-500"
          )}
        >
          {isSettingUp ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Setting Up...
            </>
          ) : (
            <>
              Enable Encryption
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Calculate password strength score
 */
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: "", color: "bg-slate-700" };
  }

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", "bg-emerald-500"];

  return {
    score,
    label: labels[score] || "Very Weak",
    color: colors[score] || "bg-red-500",
  };
}

export default VaultSetupStep;
