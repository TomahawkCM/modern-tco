"use client";

/**
 * Profile Create Dialog
 * Dialog for creating a new profile with optional PIN
 */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Lock, User } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { DEFAULT_AVATAR_COLORS, getProfileInitials } from "@/types/profile";
import { isPINValid } from "@/lib/pin-auth";
import { isFeatureEnabled } from "@/config/features";
import { cn } from "@/lib/utils";

interface ProfileCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (profileId: string) => void;
}

export function ProfileCreateDialog({ open, onOpenChange, onSuccess }: ProfileCreateDialogProps) {
  const tAria = useTranslations("aria");
  const { createProfile } = useProfile();

  const [name, setName] = useState("");
  const [avatarColor, setAvatarColor] = useState<(typeof DEFAULT_AVATAR_COLORS)[number]>(
    DEFAULT_AVATAR_COLORS[0]
  );
  const [usePIN, setUsePIN] = useState(false);
  const [pin, setPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAvatarColor(DEFAULT_AVATAR_COLORS[0]);
    setUsePIN(false);
    setPIN("");
    setConfirmPIN("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return "Please enter a name for the profile";
    }

    if (name.trim().length > 30) {
      return "Name must be 30 characters or less";
    }

    if (usePIN) {
      const pinValidation = isPINValid(pin);
      if (!pinValidation.valid) {
        return pinValidation.error || "Invalid PIN";
      }

      if (pin !== confirmPIN) {
        return "PINs do not match";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = await createProfile(name.trim(), usePIN ? pin : undefined, avatarColor);

      handleClose();
      onSuccess?.(profile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Create Profile
            </DialogTitle>
            <DialogDescription>
              Add a new profile for a family member. Each profile can have its own private budgets.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Avatar Preview & Color Selection */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarFallback
                  style={{ backgroundColor: avatarColor }}
                  className="text-2xl font-medium text-white"
                >
                  {name ? getProfileInitials(name) : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                {DEFAULT_AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={cn(
                      "h-6 w-6 rounded-full transition-all",
                      avatarColor === color
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={tAria("selectColor", { color })}
                  />
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* PIN Toggle */}
            {isFeatureEnabled("pinAuthentication") && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="use-pin">Protect with PIN</Label>
                  </div>
                  <Switch id="use-pin" checked={usePIN} onCheckedChange={setUsePIN} />
                </div>

                {/* PIN Inputs */}
                {usePIN && (
                  <div className="grid gap-3 rounded-lg border bg-muted/50 p-3">
                    <div className="grid gap-2">
                      <Label htmlFor="pin">PIN (4-6 digits)</Label>
                      <Input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPIN(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter PIN"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-pin">Confirm PIN</Label>
                      <Input
                        id="confirm-pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={confirmPIN}
                        onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                        placeholder="Confirm PIN"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PIN protects access to this profile. Choose something memorable but not too
                      simple.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Error Display */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Create Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
