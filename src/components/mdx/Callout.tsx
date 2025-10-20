import React from 'react';
import { Lightbulb, AlertTriangle, Flask } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutType = 'tip' | 'warning' | 'lab';

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    titleColor: 'text-orange-700 dark:text-orange-400',
  },
  lab: {
    icon: Flask,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
    titleColor: 'text-green-700 dark:text-green-400',
  },
};

export default function Callout({ type, title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        'rounded-lg border-2 p-4 my-4',
        config.borderColor,
        config.bgColor
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1">
          {title && (
            <div className={cn('font-semibold mb-2', config.titleColor)}>
              {title}
            </div>
          )}
          <div className="text-foreground/90 prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
