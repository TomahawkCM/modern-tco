"use client";

/**
 * NotificationSettingsPanel Component
 * Manage notification preferences, permissions, quiet hours, and email settings
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Calendar,
  AlertCircle,
  Target,
  Moon,
  Send,
  Shield,
  ShieldCheck,
  ShieldOff,
  Info,
  Mail,
  MailCheck,
  Loader2,
} from "lucide-react";
import { useNotificationsOptional } from "@/contexts/NotificationContext";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isPushSupported, getPushPermissionState } from "@/lib/notifications/notification-settings";

// Generate a random unsubscribe token
function generateUnsubscribeToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function NotificationSettingsPanel() {
  const t = useTranslations("notificationSettings");
  const context = useNotificationsOptional();
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<"success" | "error" | null>(null);

  // If context is not available, show a message
  if (!context) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("notAvailable")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { settings, updateSettings, requestPermission, sendTestNotification } = context;

  const pushSupported = isPushSupported();
  const permissionState = getPushPermissionState();

  const handleMasterToggle = (enabled: boolean) => {
    updateSettings({ masterEnabled: enabled });
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    updateSettings({ quietHoursEnabled: enabled });
  };

  const handleQuietHoursStart = (value: string) => {
    updateSettings({ quietHoursStart: value });
  };

  const handleQuietHoursEnd = (value: string) => {
    updateSettings({ quietHoursEnd: value });
  };

  const handleDefaultReminderDays = (value: string) => {
    const days = parseInt(value, 10);
    if (!isNaN(days) && days >= 0 && days <= 30) {
      updateSettings({ defaultReminderDays: days });
    }
  };

  const handleEmailToggle = (enabled: boolean) => {
    // Generate unsubscribe token if enabling for the first time
    if (enabled && !settings.emailUnsubscribeToken) {
      updateSettings({
        emailEnabled: enabled,
        emailUnsubscribeToken: generateUnsubscribeToken(),
      });
    } else {
      updateSettings({ emailEnabled: enabled });
    }
  };

  const handleEmailAddressChange = (value: string) => {
    updateSettings({ emailAddress: value });
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendTestEmail = async () => {
    if (!settings.emailEnabled || !settings.emailAddress || !isValidEmail(settings.emailAddress)) {
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailStatus(null);

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test",
          props: {
            to: settings.emailAddress,
            unsubscribeToken: settings.emailUnsubscribeToken,
            baseUrl: window.location.origin,
          },
        }),
      });

      const data = await response.json();
      setTestEmailStatus(data.success ? "success" : "error");
    } catch {
      setTestEmailStatus("error");
    } finally {
      setIsSendingTestEmail(false);
      // Clear status after 5 seconds
      setTimeout(() => setTestEmailStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.masterEnabled ? (
                <Bell className="h-5 w-5 text-teal-400" />
              ) : (
                <BellOff className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <CardTitle>{t("masterToggle.title")}</CardTitle>
                <CardDescription>{t("masterToggle.description")}</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.masterEnabled}
              onCheckedChange={handleMasterToggle}
              aria-label={t("masterToggle.title")}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Push Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permissionState === "granted" ? (
              <ShieldCheck className="h-5 w-5 text-green-400" />
            ) : permissionState === "denied" ? (
              <ShieldOff className="h-5 w-5 text-red-400" />
            ) : (
              <Shield className="h-5 w-5 text-slate-400" />
            )}
            {t("pushPermission.title")}
          </CardTitle>
          <CardDescription>{t("pushPermission.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  permissionState === "granted"
                    ? "default"
                    : permissionState === "denied"
                      ? "destructive"
                      : "secondary"
                }
              >
                {t(`pushPermission.states.${permissionState}`)}
              </Badge>
              {!pushSupported && (
                <span className="text-xs text-slate-500">{t("pushPermission.notSupported")}</span>
              )}
            </div>
            {pushSupported && permissionState === "default" && (
              <Button onClick={requestPermission} size="sm">
                {t("pushPermission.enable")}
              </Button>
            )}
            {permissionState === "denied" && (
              <span className="text-xs text-slate-500">{t("pushPermission.deniedHint")}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.emailEnabled ? (
                <MailCheck className="h-5 w-5 text-teal-400" />
              ) : (
                <Mail className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <CardTitle>{t("emailNotifications.title")}</CardTitle>
                <CardDescription>{t("emailNotifications.description")}</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={handleEmailToggle}
              aria-label={t("emailNotifications.title")}
            />
          </div>
        </CardHeader>
        {settings.emailEnabled && (
          <CardContent className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="emailAddress">{t("emailNotifications.emailAddress")}</Label>
              <Input
                id="emailAddress"
                type="email"
                value={settings.emailAddress}
                onChange={(e) => handleEmailAddressChange(e.target.value)}
                placeholder="your@email.com"
                className={cn(
                  settings.emailAddress && !isValidEmail(settings.emailAddress) && "border-red-500"
                )}
              />
              {settings.emailAddress && !isValidEmail(settings.emailAddress) && (
                <p className="text-xs text-red-500">{t("emailNotifications.invalidEmail")}</p>
              )}
            </div>

            <Separator />

            {/* Email Notification Types */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-slate-400">
                {t("emailNotifications.types")}
              </Label>

              {/* Bill Reminders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">{t("notificationTypes.billReminders.title")}</span>
                </div>
                <Switch
                  checked={settings.emailBillReminders}
                  onCheckedChange={(v) => updateSettings({ emailBillReminders: v })}
                  aria-label={t("notificationTypes.billReminders.title")}
                />
              </div>

              {/* Budget Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">{t("notificationTypes.budgetAlerts.title")}</span>
                </div>
                <Switch
                  checked={settings.emailBudgetAlerts}
                  onCheckedChange={(v) => updateSettings({ emailBudgetAlerts: v })}
                  aria-label={t("notificationTypes.budgetAlerts.title")}
                />
              </div>

              {/* Goal Milestones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  <span className="text-sm">{t("notificationTypes.goalMilestones.title")}</span>
                </div>
                <Switch
                  checked={settings.emailGoalMilestones}
                  onCheckedChange={(v) => updateSettings({ emailGoalMilestones: v })}
                  aria-label={t("notificationTypes.goalMilestones.title")}
                />
              </div>
            </div>

            <Separator />

            {/* Test Email */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("emailNotifications.testEmail")}</p>
                <p className="text-xs text-slate-500">
                  {t("emailNotifications.testEmailDescription")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {testEmailStatus === "success" && (
                  <Badge variant="default" className="bg-green-500/20 text-green-400">
                    {t("emailNotifications.testEmailSent")}
                  </Badge>
                )}
                {testEmailStatus === "error" && (
                  <Badge variant="destructive">{t("emailNotifications.testEmailFailed")}</Badge>
                )}
                <Button
                  onClick={handleSendTestEmail}
                  disabled={
                    isSendingTestEmail ||
                    !settings.emailAddress ||
                    !isValidEmail(settings.emailAddress)
                  }
                  size="sm"
                  variant="outline"
                >
                  {isSendingTestEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="ml-2">{t("emailNotifications.sendTest")}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notification Types */}
      <Card className={cn(!settings.masterEnabled && "opacity-50")}>
        <CardHeader>
          <CardTitle>{t("notificationTypes.title")}</CardTitle>
          <CardDescription>{t("notificationTypes.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bill Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <Label>{t("notificationTypes.billReminders.title")}</Label>
                <p className="text-xs text-slate-500">
                  {t("notificationTypes.billReminders.description")}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.billReminders}
              onCheckedChange={(v) => updateSettings({ billReminders: v })}
              disabled={!settings.masterEnabled}
              aria-label={t("notificationTypes.billReminders.title")}
            />
          </div>

          <Separator />

          {/* Budget Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <div>
                <Label>{t("notificationTypes.budgetAlerts.title")}</Label>
                <p className="text-xs text-slate-500">
                  {t("notificationTypes.budgetAlerts.description")}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.budgetAlerts}
              onCheckedChange={(v) => updateSettings({ budgetAlerts: v })}
              disabled={!settings.masterEnabled}
              aria-label={t("notificationTypes.budgetAlerts.title")}
            />
          </div>

          <Separator />

          {/* Goal Milestones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-400" />
              <div>
                <Label>{t("notificationTypes.goalMilestones.title")}</Label>
                <p className="text-xs text-slate-500">
                  {t("notificationTypes.goalMilestones.description")}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.goalMilestones}
              onCheckedChange={(v) => updateSettings({ goalMilestones: v })}
              disabled={!settings.masterEnabled}
              aria-label={t("notificationTypes.goalMilestones.title")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className={cn(!settings.masterEnabled && "opacity-50")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-indigo-400" />
              <div>
                <CardTitle>{t("quietHours.title")}</CardTitle>
                <CardDescription>{t("quietHours.description")}</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={handleQuietHoursToggle}
              disabled={!settings.masterEnabled}
              aria-label={t("quietHours.title")}
            />
          </div>
        </CardHeader>
        {settings.quietHoursEnabled && (
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="quietStart" className="text-xs text-slate-400">
                  {t("quietHours.start")}
                </Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleQuietHoursStart(e.target.value)}
                  disabled={!settings.masterEnabled}
                  className="mt-1"
                />
              </div>
              <span className="pt-5 text-slate-500">—</span>
              <div className="flex-1">
                <Label htmlFor="quietEnd" className="text-xs text-slate-400">
                  {t("quietHours.end")}
                </Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleQuietHoursEnd(e.target.value)}
                  disabled={!settings.masterEnabled}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Default Reminder Days */}
      <Card className={cn(!settings.masterEnabled && "opacity-50")}>
        <CardHeader>
          <CardTitle>{t("reminderDays.title")}</CardTitle>
          <CardDescription>{t("reminderDays.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={30}
              value={settings.defaultReminderDays}
              onChange={(e) => handleDefaultReminderDays(e.target.value)}
              disabled={!settings.masterEnabled}
              className="w-24"
            />
            <span className="text-sm text-slate-400">{t("reminderDays.daysBeforeDue")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card className={cn(!settings.masterEnabled && "opacity-50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {t("testNotification.title")}
          </CardTitle>
          <CardDescription>{t("testNotification.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={sendTestNotification}
            disabled={!settings.masterEnabled}
            variant="outline"
          >
            <Send className="mr-2 h-4 w-4" />
            {t("testNotification.button")}
          </Button>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
          <div className="space-y-1 text-sm text-slate-400">
            <p>{t("infoBox.storedLocally")}</p>
            <p>{t("infoBox.pushExplanation")}</p>
            <p>{t("infoBox.emailExplanation")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
