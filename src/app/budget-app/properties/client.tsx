'use client';

import { GlassCard } from '@/components/budget/ui/GlassCard';
import { getAllProperties, getTotalPropertyValue, calculateEquity, calculateAppreciation } from '@/lib/property/property-calculator';
import { db } from '@/lib/budget-db';
import { Building2, Plus, TrendingUp } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Property, Loan } from '@/types/budget';

export function ClientProperties() {
  const t = useTranslations('budget.property');
  const format = useFormatter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    async function load() {
      const [props, allLoans] = await Promise.all([
        getAllProperties(),
        db.loans.toArray(),
      ]);
      setProperties(props);
      setLoans(allLoans);
      setTotalValue(await getTotalPropertyValue());
    }
    load();
  }, []);

  const fmtCurrency = (v: number) => format.number(v, { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500">
          <Plus className="h-4 w-4" />
          {t('addProperty')}
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-5">
          <p className="text-sm text-slate-400">{t('totalValue')}</p>
          <p className="mt-1 text-3xl font-bold text-white">{fmtCurrency(totalValue)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-slate-400">{t('totalProperties')}</p>
          <p className="mt-1 text-3xl font-bold text-white">{properties.length}</p>
        </GlassCard>
      </div>

      {/* Property Cards */}
      {properties.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="mb-4 h-16 w-16 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-300">{t('noProperties')}</h2>
          <p className="mt-2 text-sm text-slate-500">{t('noPropertiesDescription')}</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => {
            const loan = property.loanId ? loans.find(l => l.id === property.loanId) : undefined;
            const equity = calculateEquity(property, loan);
            const appreciation = calculateAppreciation(property);

            return (
              <GlassCard key={property.id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">{property.name}</h3>
                    {property.address && (
                      <p className="text-xs text-slate-400">{property.address}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-300">
                    {property.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('currentValue')}</span>
                    <span className="font-medium text-white">{fmtCurrency(property.currentValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('equity')}</span>
                    <span className="font-medium text-emerald-400">{fmtCurrency(equity)}</span>
                  </div>
                  {appreciation.annual > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('annualAppreciation')}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400">
                          {appreciation.annual.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
