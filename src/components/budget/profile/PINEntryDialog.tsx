"use client";

/**
 * PIN Entry Dialog
 * Dialog for entering PIN to unlock a profile
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, AlertCircle, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { getProfileInitials } from "@/types/profile";
import { cn } from "@/lib/utils";

interface PINEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel?: () => void;
  profileName?: string;
}

export function PINEntryDialog({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
  profileName,
}: PINEntryDialogProps) {
  const {
    currentProfile,
    isLocked,
    error: contextError,
    unlockProfile,
    getLockoutRemaining,
  } = useProfile();

  const [pin, setPIN] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setPIN("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Update lockout countdown
  useEffect(() => {
    const remaining = getLockoutRemaining();
    setLockoutSeconds(remaining);

    if (remaining > 0) {
      const timer = setInterval(() => {
        const newRemaining = getLockoutRemaining();
        setLockoutSeconds(newRemaining);
        if (newRemaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [getLockoutRemaining, contextError]);

  const handlePINChange = (value: string) => {
    // Only allow digits
    const cleanValue = value.replace(/\D/g, "").slice(0, 6);
    setPIN(cleanValue);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (pin.length < 4 || lockoutSeconds > 0) return;

    const success = await unlockProfile(pin);

    if (success) {
      setPIN("");
      onSuccess();
    } else {
      // Shake animation on failure
      setIsShaking(true);
      setPIN("");
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length >= 4) {
      handleSubmit();
    }
  };

  const handleCancel = () => {
    setPIN("");
    onCancel?.();
  };

  const displayName = profileName || currentProfile?.name || "Profile";
  const avatarColor = currentProfile?.avatarColor || "#10b981";

  return (
    <Dialog
      open={open && isLocked}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[350px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback
                style={{ backgroundColor: avatarColor }}
                className="text-2xl font-medium text-white"
              >
                {getProfileInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Unlock {displayName}
          </DialogTitle>
          <DialogDescription>Enter your PIN to access this profile</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div className={cn("relative transition-transform", isShaking && "animate-shake")}>
            <Input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => handlePINChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter PIN"
              disabled={lockoutSeconds > 0}
              className="h-14 text-center text-2xl tracking-widest"
              autoComplete="off"
            />
            {pin.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute end-2 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={() => setPIN("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* PIN Dots Indicator */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-3 w-3 rounded-full transition-colors",
                  i < pin.length ? "bg-primary" : "border border-border bg-muted"
                )}
              />
            ))}
          </div>

          {/* Error/Lockout Message */}
          {(contextError || lockoutSeconds > 0) && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                {lockoutSeconds > 0 ? `Try again in ${lockoutSeconds} seconds` : contextError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={pin.length < 4 || lockoutSeconds > 0}>
            Unlock
          </Button>

          {/* Cancel Link */}
          {onCancel && (
            <Button type="button" variant="ghost" className="w-full" onClick={handleCancel}>
              Use Different Profile
            </Button>
          )}
        </form>
      </DialogContent>

      {/* Add shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </Dialog>
  );
}
