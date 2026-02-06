'use client';

/**
 * CalendarExportDialog Component
 * Dialog for selecting subscriptions to export to calendar
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Calendar,
  Download,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';
import type { Subscription } from '@/types/budget';
import type { CalendarProvider } from '@/types/notifications';
import { downloadMultipleSubscriptionsICS } from '@/lib/calendar/ics-generator';
import {
  openSubscriptionGoogleCalendar,
  openSubscriptionOutlookCalendar,
} from '@/lib/calendar/google-calendar-url';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CalendarExportDialogProps {
  subscriptions: Subscription[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportMethod = 'ics' | 'google' | 'outlook';

export function CalendarExportDialog({
  subscriptions,
  isOpen,
  onClose,
}: CalendarExportDialogProps) {
  const t = useTranslations('calendarExport');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(subscriptions.map((s) => s.id))
  );
  const [exportMethod, setExportMethod] = useState<ExportMethod>('ics');
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.size === subscriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscriptions.map((s) => s.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExport = async () => {
    const selectedSubscriptions = subscriptions.filter((s) =>
      selectedIds.has(s.id)
    );

    if (selectedSubscriptions.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      if (exportMethod === 'ics') {
        downloadMultipleSubscriptionsICS(selectedSubscriptions);
        onClose();
      } else if (exportMethod === 'google') {
        // Open each subscription in Google Calendar
        // Note: Opening multiple tabs might be blocked by popup blockers
        for (const sub of selectedSubscriptions) {
          openSubscriptionGoogleCalendar(sub);
          // Small delay between opens
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        onClose();
      } else if (exportMethod === 'outlook') {
        for (const sub of selectedSubscriptions) {
          openSubscriptionOutlookCalendar(sub);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        onClose();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === subscriptions.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('dialog.title')}
          </DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('dialog.exportMethod')}
            </Label>
            <RadioGroup
              value={exportMethod}
              onValueChange={(v) => setExportMethod(v as ExportMethod)}
              className="grid grid-cols-3 gap-2"
            >
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors',
                  exportMethod === 'ics'
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
                onClick={() => setExportMethod('ics')}
              >
                <RadioGroupItem value="ics" id="ics" className="sr-only" />
                <Download className="h-4 w-4" />
                <Label htmlFor="ics" className="cursor-pointer text-xs">
                  ICS
                </Label>
              </div>
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors',
                  exportMethod === 'google'
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
                onClick={() => setExportMethod('google')}
              >
                <RadioGroupItem
                  value="google"
                  id="google"
                  className="sr-only"
                />
                <ExternalLink className="h-4 w-4" />
                <Label htmlFor="google" className="cursor-pointer text-xs">
                  Google
                </Label>
              </div>
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors',
                  exportMethod === 'outlook'
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
                onClick={() => setExportMethod('outlook')}
              >
                <RadioGroupItem
                  value="outlook"
                  id="outlook"
                  className="sr-only"
                />
                <ExternalLink className="h-4 w-4" />
                <Label htmlFor="outlook" className="cursor-pointer text-xs">
                  Outlook
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subscription Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {t('dialog.selectSubscriptions')}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                {isAllSelected ? t('dialog.deselectAll') : t('dialog.selectAll')}
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                    selectedIds.has(subscription.id)
                      ? 'bg-white/5'
                      : 'hover:bg-white/5'
                  )}
                  onClick={() => handleToggle(subscription.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(subscription.id)}
                    onCheckedChange={() => handleToggle(subscription.id)}
                    aria-label={`Select ${subscription.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {subscription.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {subscription.currency || '$'}
                      {subscription.amount.toFixed(2)} / {subscription.billingCycle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('dialog.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedCount === 0 || isExporting}
            className="flex-1"
          >
            {isExporting ? (
              t('dialog.exporting')
            ) : (
              <>
                {exportMethod === 'ics' ? (
                  <Download className="mr-2 h-4 w-4" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {t('dialog.export', { count: selectedCount })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
