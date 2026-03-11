"use client";

/**
 * Profile Delete Dialog
 * Confirmation dialog for deleting a profile
 */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, AlertTriangle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "@/types/profile";
import { getProfileInitials } from "@/types/profile";

interface ProfileDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSuccess?: () => void;
}

export function ProfileDeleteDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: ProfileDeleteDialogProps) {
  const t = useTranslations("profileDialog");
  const { deleteProfile, profiles } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteProfile(profile.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorDeleteFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  const isLastProfile = profiles.length === 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t("deleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    style={{ backgroundColor: profile.avatarColor || "#10b981" }}
                    className="text-white"
                  >
                    {getProfileInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{profile.name}</p>
                  {profile.isDefault && (
                    <p className="text-xs text-muted-foreground">{t("defaultProfile")}</p>
                  )}
                </div>
              </div>

              {isLastProfile ? (
                <p className="text-destructive">{t("cannotDeleteOnly")}</p>
              ) : (
                <>
                  <p>{t("permanentWarning")}</p>
                  <p className="font-medium">{t("cannotUndo")}</p>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || isLastProfile}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("deleteButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
