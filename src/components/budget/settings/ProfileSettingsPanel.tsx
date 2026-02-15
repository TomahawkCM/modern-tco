"use client";

/**
 * Profile Settings Panel
 * Manage profiles, PINs, and profile-related settings
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldOff,
  Crown,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { getProfileInitials } from "@/types/profile";
import { isFeatureEnabled } from "@/config/features";
import {
  ProfileCreateDialog,
  ProfileEditDialog,
  ProfileDeleteDialog,
  PINSetupDialog,
} from "@/components/budget/profile";
import type { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

export function ProfileSettingsPanel() {
  const { profiles, currentProfile, hasPIN } = useProfile();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const [pinSetupProfile, setPinSetupProfile] = useState<Profile | null>(null);
  const [pinSetupMode, setPinSetupMode] = useState<"set" | "change" | "remove">("set");

  if (!isFeatureEnabled("multiProfiles")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Multi-profile support is not enabled.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handlePINAction = (profile: Profile, mode: "set" | "change" | "remove") => {
    setPinSetupProfile(profile);
    setPinSetupMode(mode);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage family member profiles and PIN protection</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.map((profile) => {
            const isCurrentProfile = profile.id === currentProfile?.id;
            const profileHasPIN = hasPIN(profile.id);

            return (
              <div
                key={profile.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4",
                  isCurrentProfile && "border-primary/50 bg-muted/50"
                )}
              >
                {/* Profile Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      style={{ backgroundColor: profile.avatarColor || "#10b981" }}
                      className="text-lg text-white"
                    >
                      {getProfileInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{profile.name}</span>
                      {profile.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="mr-1 h-3 w-3" />
                          Default
                        </Badge>
                      )}
                      {isCurrentProfile && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {profileHasPIN ? (
                        <>
                          <Lock className="h-3 w-3" />
                          PIN protected
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3" />
                          No PIN
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* PIN Actions */}
                  {isFeatureEnabled("pinAuthentication") && (
                    <>
                      {profileHasPIN ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePINAction(profile, "change")}
                          >
                            <Lock className="mr-1 h-4 w-4" />
                            Change PIN
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePINAction(profile, "remove")}
                          >
                            <ShieldOff className="mr-1 h-4 w-4" />
                            Remove PIN
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePINAction(profile, "set")}
                        >
                          <ShieldCheck className="mr-1 h-4 w-4" />
                          Set PIN
                        </Button>
                      )}
                    </>
                  )}

                  <Separator orientation="vertical" className="h-6" />

                  {/* Edit/Delete */}
                  <Button variant="ghost" size="icon" onClick={() => setEditingProfile(profile)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingProfile(profile)}
                    disabled={profiles.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Info about profiles */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">About Profiles</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Each profile can have its own private budgets</li>
              <li>• Shared budgets are visible to all profiles</li>
              <li>• PIN protection keeps profile data secure</li>
              <li>• The default profile is selected on app start</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProfileCreateDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <ProfileEditDialog
        open={!!editingProfile}
        onOpenChange={(open) => !open && setEditingProfile(null)}
        profile={editingProfile}
      />

      <ProfileDeleteDialog
        open={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
        profile={deletingProfile}
      />

      <PINSetupDialog
        open={!!pinSetupProfile}
        onOpenChange={(open) => !open && setPinSetupProfile(null)}
        profile={pinSetupProfile}
        mode={pinSetupMode}
      />
    </>
  );
}
