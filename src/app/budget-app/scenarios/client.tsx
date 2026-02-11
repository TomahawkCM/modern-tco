'use client';

import { GlassCard } from '@/components/budget/ui/GlassCard';
import { runScenario } from '@/lib/scenarios/scenario-engine';
import type { ScenarioInput, ScenarioResult, FinancialState, ScenarioType } from '@/lib/scenarios/scenario-types';
import { FlaskConical, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';

const SCENARIO_PRESETS: Array<{ type: ScenarioType; icon: string; key: string; inputField: keyof ScenarioInput }> = [
  { type: 'cancel_subscription', icon: '\u{1F4B3}', key: 'cancelSubscription', inputField: 'subscriptionAmount' },
  { type: 'change_income', icon: '\u{1F4B0}', key: 'changeIncome', inputField: 'newMonthlyIncome' },
  { type: 'add_expense', icon: '\u{1F6D2}', key: 'addExpense', inputField: 'newExpenseAmount' },
  { type: 'pay_off_debt', icon: '\u{1F3E6}', key: 'payOffDebt', inputField: 'extraDebtPayment' },
  { type: 'increase_savings_rate', icon: '\u{1F4C8}', key: 'increaseSavings', inputField: 'newSavingsRate' },
];

export function ClientScenarios() {
  const t = useTranslations('budget.scenarios');
  const format = useFormatter();
  const [selectedPreset, setSelectedPreset] = useState<typeof SCENARIO_PRESETS[number] | null>(null);
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const fmtCurrency = (v: number) => format.number(v, { style: 'currency', currency: 'USD' });

  const currentState: FinancialState = {
    monthlyIncome: 5000,
    monthlyExpenses: 3500,
    totalDebt: 15000,
    monthlyDebtPayment: 500,
    monthlySavings: 1500,
    savingsRate: 30,
    healthScore: 72,
  };

  const handleRun = useCallback(() => {
    if (!selectedPreset || !amount) return;
    const input: ScenarioInput = {
      type: selectedPreset.type,
      [selectedPreset.inputField]: parseFloat(amount),
    };
    const scenarioResult = runScenario(input, currentState);
    setResult(scenarioResult);
  }, [selectedPreset, amount, currentState]);

  const cashFlow = (state: FinancialState) => state.monthlyIncome - state.monthlyExpenses;
  const annualSavings = (state: FinancialState) => state.monthlySavings * 12;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-7 w-7 text-violet-400" />
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>
      <p className="text-sm text-slate-400">{t('subtitle')}</p>

      {/* Scenario Type Selection */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIO_PRESETS.map(preset => (
          <GlassCard
            key={preset.type}
            className={`cursor-pointer p-4 transition-all hover:border-violet-500/30 ${
              selectedPreset?.type === preset.type ? 'border-violet-500/50 bg-violet-500/10' : ''
            }`}
            onClick={() => { setSelectedPreset(preset); setResult(null); }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{preset.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{t(`types.${preset.key}.title`)}</p>
                <p className="text-xs text-slate-400">{t(`types.${preset.key}.description`)}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Amount Input */}
      {selectedPreset && (
        <GlassCard className="p-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">{t('amountLabel')}</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              placeholder="0.00"
            />
            <button
              onClick={handleRun}
              disabled={!amount}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {t('run')} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Results */}
      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5">
            <h3 className="mb-3 text-sm font-medium text-slate-400">{t('before')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">{t('monthlyCashFlow')}</span>
                <span className="text-white">{fmtCurrency(cashFlow(result.before))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">{t('annualSavings')}</span>
                <span className="text-white">{fmtCurrency(annualSavings(result.before))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">{t('healthScore')}</span>
                <span className="text-white">{result.before.healthScore}</span>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="border-violet-500/20 p-5">
            <h3 className="mb-3 text-sm font-medium text-violet-400">{t('after')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">{t('monthlyCashFlow')}</span>
                <span className={cashFlow(result.after) > cashFlow(result.before) ? 'text-emerald-400' : 'text-red-400'}>
                  {fmtCurrency(cashFlow(result.after))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">{t('annualSavings')}</span>
                <span className={annualSavings(result.after) > annualSavings(result.before) ? 'text-emerald-400' : 'text-red-400'}>
                  {fmtCurrency(annualSavings(result.after))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">{t('healthScore')}</span>
                <span className={result.after.healthScore > result.before.healthScore ? 'text-emerald-400' : 'text-red-400'}>
                  {result.after.healthScore}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Impact Summary */}
          <GlassCard className="p-5 sm:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-slate-400">{t('impact')}</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {result.impact.monthlyCashFlowChange >= 0
                  ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                  : <TrendingDown className="h-4 w-4 text-red-400" />}
                <span className="text-sm text-slate-300">
                  {fmtCurrency(Math.abs(result.impact.monthlyCashFlowChange))}/mo
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result.impact.annualSavingsChange >= 0
                  ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                  : <TrendingDown className="h-4 w-4 text-red-400" />}
                <span className="text-sm text-slate-300">
                  {fmtCurrency(Math.abs(result.impact.annualSavingsChange))}/yr
                </span>
              </div>
              {result.impact.description && (
                <p className="w-full text-xs text-slate-400">{result.impact.description}</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
