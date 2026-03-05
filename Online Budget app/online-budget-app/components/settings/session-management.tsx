"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOutIcon, ShieldAlertIcon } from "lucide-react";
import { signOutAllDevices } from "@/app/(auth)/actions";

interface SessionManagementProps {
  userEmail: string;
  lastLoginAt: string | null;
}

export function SessionManagement({ userEmail, lastLoginAt }: SessionManagementProps) {
  const [confirming, setConfirming] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const handleLogoutAll = async () => {
    setConfirming(false);
    await signOutAllDevices();
    router.push("/login");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlertIcon className="h-5 w-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium">{userEmail}</span>
          </div>
          {lastLoginAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last login</span>
              <span>{new Date(lastLoginAt).toLocaleString(locale)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          {confirming ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This will sign you out on all devices. You will need to log in again.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleLogoutAll}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Confirm logout all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out of all devices
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
