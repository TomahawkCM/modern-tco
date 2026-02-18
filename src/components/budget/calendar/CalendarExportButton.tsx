"use client";

/**
 * CalendarExportButton Component
 * Dropdown button for exporting subscriptions to calendar
 */

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ExternalLink, FileText } from "lucide-react";
import type { Subscription } from "@/types/budget";
import {
  downloadSubscriptionICS,
  downloadMultipleSubscriptionsICS,
} from "@/lib/calendar/ics-generator";
import {
  openSubscriptionGoogleCalendar,
  openSubscriptionOutlookCalendar,
} from "@/lib/calendar/google-calendar-url";
import { CalendarExportDialog } from "./CalendarExportDialog";
import { useTranslations } from "next-intl";

interface CalendarExportButtonProps {
  /** Single subscription to export */
  subscription?: Subscription;
  /** Multiple subscriptions to export */
  subscriptions?: Subscription[];
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Show text label */
  showLabel?: boolean;
  className?: string;
}

export function CalendarExportButton({
  subscription,
  subscriptions,
  variant = "outline",
  size = "sm",
  showLabel = true,
  className,
}: CalendarExportButtonProps) {
  const t = useTranslations("calendarExport");
  const [showDialog, setShowDialog] = useState(false);

  // If we have a single subscription, show quick actions
  if (subscription && !subscriptions) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Calendar className="h-4 w-4" />
            {showLabel && <span className="ms-2">{t("addToCalendar")}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => downloadSubscriptionICS(subscription)}
            className="cursor-pointer"
          >
            <Download className="me-2 h-4 w-4" />
            {t("downloadICS")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => openSubscriptionGoogleCalendar(subscription)}
            className="cursor-pointer"
          >
            <ExternalLink className="me-2 h-4 w-4" />
            {t("googleCalendar")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openSubscriptionOutlookCalendar(subscription)}
            className="cursor-pointer"
          >
            <ExternalLink className="me-2 h-4 w-4" />
            {t("outlookCalendar")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If we have multiple subscriptions, show dialog option
  if (subscriptions && subscriptions.length > 0) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={variant} size={size} className={className}>
              <Calendar className="h-4 w-4" />
              {showLabel && <span className="ms-2">{t("exportToCalendar")}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => downloadMultipleSubscriptionsICS(subscriptions)}
              className="cursor-pointer"
            >
              <Download className="me-2 h-4 w-4" />
              {t("downloadAllICS")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDialog(true)} className="cursor-pointer">
              <FileText className="me-2 h-4 w-4" />
              {t("selectSubscriptions")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CalendarExportDialog
          subscriptions={subscriptions}
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
        />
      </>
    );
  }

  // No subscriptions
  return null;
}
