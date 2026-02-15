"use client";

/**
 * PIN Setup Dialog
 * Dialog for setting or changing a profile's PIN
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, ShieldOff } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "@/types/profile";
import { isPINValid } from "@/lib/pin-auth";

interface PINSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  mode?: "set" | "change" | "remove";
  onSuccess?: () => void;
}

export function PINSetupDialog({
  open,
  onOpenChange,
  profile,
  mode = "set",
  onSuccess,
}: PINSetupDialogProps) {
  const { setPIN, removePIN, unlockProfile, hasPIN } = useProfile();

  const [currentPIN, setCurrentPIN] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"current" | "new">("current");

  // Determine if we need to verify current PIN
  const requiresCurrentPIN = profile?.pinHash && (mode === "change" || mode === "remove");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentPIN("");
      setNewPIN("");
      setConfirmPIN("");
      setError(null);
      setStep(requiresCurrentPIN ? "current" : "new");
    }
  }, [open, requiresCurrentPIN]);

  const handleClose = () => {
    setCurrentPIN("");
    setNewPIN("");
    setConfirmPIN("");
    setError(null);
    onOpenChange(false);
  };

  const validateNewPIN = (): string | null => {
    if (mode === "remove") {
      return null; // No validation needed for removal
    }

    const validation = isPINValid(newPIN);
    if (!validation.valid) {
      return validation.error || "Invalid PIN";
    }

    if (newPIN !== confirmPIN) {
      return "PINs do not match";
    }

    return null;
  };

  const handleVerifyCurrentPIN = async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await unlockProfile(currentPIN);
      if (isValid) {
        if (mode === "remove") {
          // Remove PIN directly after verification
          await removePIN(profile.id);
          handleClose();
          onSuccess?.();
        } else {
          // Move to new PIN step
          setStep("new");
        }
      } else {
        setError("Incorrect current PIN");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPIN = async () => {
    if (!profile) return;

    const validationError = validateNewPIN();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await setPIN(profile.id, newPIN);
      if (success) {
        handleClose();
        onSuccess?.();
      } else {
        setError("Failed to set PIN");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "current" && requiresCurrentPIN) {
      await handleVerifyCurrentPIN();
    } else {
      await handleSetNewPIN();
    }
  };

  if (!profile) return null;

  const title = mode === "remove" ? "Remove PIN" : mode === "change" ? "Change PIN" : "Set PIN";
  const icon = mode === "remove" ? ShieldOff : mode === "change" ? Lock : ShieldCheck;
  const Icon = icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {mode === "remove"
                ? "Remove PIN protection from this profile. Anyone will be able to access it."
                : mode === "change"
                  ? "Change the PIN for this profile."
                  : "Set a PIN to protect this profile from unauthorized access."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Current PIN Step */}
            {step === "current" && requiresCurrentPIN && (
              <div className="grid gap-2">
                <Label htmlFor="current-pin">Current PIN</Label>
                <Input
                  id="current-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={currentPIN}
                  onChange={(e) => setCurrentPIN(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter current PIN"
                  autoFocus
                />
              </div>
            )}

            {/* New PIN Step */}
            {step === "new" && mode !== "remove" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="new-pin">New PIN (4-6 digits)</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={newPIN}
                    onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter new PIN"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-new-pin">Confirm New PIN</Label>
                  <Input
                    id="confirm-new-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={confirmPIN}
                    onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                    placeholder="Confirm new PIN"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a PIN that&apos;s easy to remember but hard to guess. Avoid simple patterns
                  like 1234 or repeated digits.
                </p>
              </>
            )}

            {/* Remove PIN Confirmation */}
            {step === "new" && mode === "remove" && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <p className="text-sm">
                  Are you sure you want to remove PIN protection? This profile will be accessible
                  without any authentication.
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant={mode === "remove" ? "destructive" : "default"}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === "current" && requiresCurrentPIN
                ? mode === "remove"
                  ? "Verify & Remove"
                  : "Continue"
                : mode === "remove"
                  ? "Remove PIN"
                  : "Set PIN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
