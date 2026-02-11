'use client';

import { GlassCard } from '@/components/budget/ui/GlassCard';
import { calculateCurrentNetWorth } from '@/lib/net-worth/calculator';
import { Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import type { WidgetConfig } from '../types';

interface NetWorthMiniWidgetProps {
  config: WidgetConfig;
}

export function NetWorthMiniWidget({ config }: NetWorthMiniWidgetProps) {
  const t = useTranslations('dashboard.widgets.netWorthMini');
  const format = useFormatter();
  const [data, setData] = useState<{ netWorth: number; assets: number; liabilities: number } | null>(null);

  useEffect(() => {
    calculateCurrentNetWorth().then(result => {
      setData({
        netWorth: result.netWorth,
        assets: result.assets.total,
        liabilities: result.liabilities.total,
      });
    });
  }, []);

  const spanClass =
    config.size === 'large' ? 'md:col-span-2 lg:col-span-4'
    : config.size === 'medium' ? 'md:col-span-2' : '';

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-cyan-500/20 p-2">
              <Landmark className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
          </div>
          <NextLink
            href="/budget-app/net-worth"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t('viewDetails')}
          </NextLink>
        </div>

        {data ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-3xl font-bold text-white">
              {format.number(data.netWorth, { style: 'currency', currency: 'USD' })}
            </p>
            <div className="mt-3 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-slate-400">{t('assets')}:</span>
                <span className="text-emerald-400">
                  {format.number(data.assets, { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <span className="text-slate-400">{t('liabilities')}:</span>
                <span className="text-red-400">
                  {format.number(data.liabilities, { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-32 animate-pulse rounded bg-slate-700" />
          </div>
        )}
      </GlassCard>
    </div>
  );
}
