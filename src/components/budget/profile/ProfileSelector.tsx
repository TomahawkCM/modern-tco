"use client";

/**
 * Profile Selector Component
 * Dropdown in header for switching between profiles
 */

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Plus, Lock, Unlock, Settings, Users } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { getProfileInitials } from "@/types/profile";
import { isFeatureEnabled } from "@/config/features";
import { ProfileCreateDialog } from "./ProfileCreateDialog";
import { PINEntryDialog } from "./PINEntryDialog";
import { cn } from "@/lib/utils";

interface ProfileSelectorProps {
  className?: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
  /** Compact mode - only show avatar, hide name and chevron */
  compact?: boolean;
}

export function ProfileSelector({
  className,
  showSettings = false,
  onSettingsClick,
  compact = false,
}: ProfileSelectorProps) {
  const { profiles, currentProfile, isLocked, switchProfile, hasPIN, lockProfile } = useProfile();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);

  // Don't render if multi-profiles feature is disabled
  if (!isFeatureEnabled("multiProfiles")) {
    return null;
  }

  const handleProfileSelect = async (profileId: string) => {
    if (profileId === currentProfile?.id && !isLocked) {
      return; // Already on this profile and unlocked
    }

    const needsUnlock = hasPIN(profileId);
    if (needsUnlock) {
      setPendingProfileId(profileId);
      await switchProfile(profileId);
      setShowPINDialog(true);
    } else {
      await switchProfile(profileId);
    }
  };

  const handlePINSuccess = () => {
    setShowPINDialog(false);
    setPendingProfileId(null);
  };

  const handlePINCancel = () => {
    setShowPINDialog(false);
    setPendingProfileId(null);
    // Stay on current profile (already handled by context)
  };

  const handleLockClick = () => {
    lockProfile();
    setShowPINDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("flex items-center gap-2 px-2", className)}>
            <Avatar className="h-8 w-8">
              <AvatarFallback
                style={{
                  backgroundColor: currentProfile?.avatarColor || "#10b981",
                }}
                className="text-sm font-medium text-white"
              >
                {currentProfile ? getProfileInitials(currentProfile.name) : "?"}
              </AvatarFallback>
            </Avatar>
            {!compact && (
              <>
                <span className="max-w-[100px] truncate text-sm font-medium">
                  {currentProfile?.name || "Select Profile"}
                </span>
                {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </>
            )}
            {compact && isLocked && (
              <Lock className="absolute -bottom-1 -end-1 h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profiles
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleProfileSelect(profile.id)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback
                  style={{ backgroundColor: profile.avatarColor || "#10b981" }}
                  className="text-xs text-white"
                >
                  {getProfileInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{profile.name}</span>
              {profile.pinHash && <Lock className="h-3 w-3 text-muted-foreground" />}
              {profile.id === currentProfile?.id && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowCreateDialog(true)} className="cursor-pointer">
            <Plus className="me-2 h-4 w-4" />
            Add Profile
          </DropdownMenuItem>

          {currentProfile?.pinHash && !isLocked && (
            <DropdownMenuItem onClick={handleLockClick} className="cursor-pointer">
              <Lock className="me-2 h-4 w-4" />
              Lock Profile
            </DropdownMenuItem>
          )}

          {showSettings && onSettingsClick && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                <Settings className="me-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileCreateDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <PINEntryDialog
        open={showPINDialog}
        onOpenChange={setShowPINDialog}
        onSuccess={handlePINSuccess}
        onCancel={handlePINCancel}
        profileName={currentProfile?.name || ""}
      />
    </>
  );
}
