'use client';

/**
 * SnoozeMenu Component
 * Dropdown menu for snoozing notifications
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { type SnoozeDuration, SNOOZE_DURATIONS } from '@/types/notifications';
import { useTranslations } from 'next-intl';

interface SnoozeMenuProps {
  onSnooze: (duration: SnoozeDuration) => void;
  className?: string;
  /** Render as icon-only button */
  iconOnly?: boolean;
}

export function SnoozeMenu({ onSnooze, className, iconOnly = false }: SnoozeMenuProps) {
  const t = useTranslations('notifications');

  const snoozeOptions: { duration: SnoozeDuration; label: string }[] = [
    { duration: '1_hour', label: t('snoozeOptions.1hour') },
    { duration: '3_hours', label: t('snoozeOptions.3hours') },
    { duration: '1_day', label: t('snoozeOptions.1day') },
    { duration: '3_days', label: t('snoozeOptions.3days') },
    { duration: '1_week', label: t('snoozeOptions.1week') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={iconOnly ? 'icon' : 'sm'}
          className={className}
          aria-label={t('snooze')}
        >
          <Clock className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">{t('snooze')}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {snoozeOptions.map(({ duration, label }) => (
          <DropdownMenuItem
            key={duration}
            onClick={() => onSnooze(duration)}
            className="cursor-pointer"
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
