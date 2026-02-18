"use client";

/**
 * Profile Edit Dialog
 * Dialog for editing profile name and avatar color
 */

import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Edit } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "@/types/profile";
import { DEFAULT_AVATAR_COLORS, getProfileInitials } from "@/types/profile";
import { cn } from "@/lib/utils";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSuccess?: () => void;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: ProfileEditDialogProps) {
  const tAria = useTranslations("aria");
  const { updateProfile } = useProfile();

  const [name, setName] = useState("");
  const [avatarColor, setAvatarColor] = useState<(typeof DEFAULT_AVATAR_COLORS)[number] | string>(
    DEFAULT_AVATAR_COLORS[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatarColor(profile.avatarColor || DEFAULT_AVATAR_COLORS[0]);
    }
  }, [profile]);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return "Please enter a name for the profile";
    }

    if (name.trim().length > 30) {
      return "Name must be 30 characters or less";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(profile.id, {
        name: name.trim(),
        avatarColor,
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>Update the profile name and avatar color.</DialogDescription>
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
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* Default Profile Badge */}
            {profile.isDefault && (
              <p className="text-sm text-muted-foreground">
                This is the default profile and will be selected on app start.
              </p>
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
