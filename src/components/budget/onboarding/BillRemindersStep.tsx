/**
 * Bill Reminders Step - Onboarding Wizard
 * Detect recurring transactions and set up bill reminders
 */

"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

// Demo detected recurring bills (would be detected from transaction patterns)
const DETECTED_BILLS = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    dueDay: 15,
    frequency: "monthly" as const,
    confidence: 0.98,
    icon: "🎬",
  },
  {
    id: "2",
    name: "Electric Company",
    amount: 142.50,
    dueDay: 5,
    frequency: "monthly" as const,
    confidence: 0.95,
    icon: "⚡",
  },
  {
    id: "3",
    name: "Internet - Comcast",
    amount: 89.99,
    dueDay: 1,
    frequency: "monthly" as const,
    confidence: 0.97,
    icon: "🌐",
  },
  {
    id: "4",
    name: "Planet Fitness",
    amount: 29.99,
    dueDay: 10,
    frequency: "monthly" as const,
    confidence: 0.92,
    icon: "💪",
  },
  {
    id: "5",
    name: "Car Insurance",
    amount: 156.00,
    dueDay: 20,
    frequency: "monthly" as const,
    confidence: 0.88,
    icon: "🚗",
  },
  {
    id: "6",
    name: "Spotify",
    amount: 10.99,
    dueDay: 22,
    frequency: "monthly" as const,
    confidence: 0.96,
    icon: "🎵",
  },
];

interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  frequency: "weekly" | "monthly" | "yearly";
  enabled: boolean;
  reminderDays: number;
}

export function BillRemindersStep({ onComplete, onSkip }: StepProps) {
  const [bills, setBills] = useState<BillReminder[]>(
    DETECTED_BILLS.map((b) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      dueDay: b.dueDay,
      frequency: b.frequency,
      enabled: true,
      reminderDays: 3,
    }))
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDay, setNewBillDueDay] = useState("1");

  const enabledCount = bills.filter((b) => b.enabled).length;
  const totalMonthly = bills
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.amount, 0);

  const handleToggleBill = useCallback((id: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b
      )
    );
  }, []);

  const handleAddBill = useCallback(() => {
    if (!newBillName.trim() || !newBillAmount) return;

    const newBill: BillReminder = {
      id: `new-${Date.now()}`,
      name: newBillName.trim(),
      amount: parseFloat(newBillAmount) || 0,
      dueDay: parseInt(newBillDueDay) || 1,
      frequency: "monthly",
      enabled: true,
      reminderDays: 3,
    };

    setBills((prev) => [...prev, newBill]);
    setNewBillName("");
    setNewBillAmount("");
    setNewBillDueDay("1");
    setShowAddForm(false);
  }, [newBillName, newBillAmount, newBillDueDay]);

  const handleComplete = useCallback(() => {
    onComplete({ billsDetected: enabledCount });
  }, [onComplete, enabledCount]);

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-400" />
          <p className="text-sm text-slate-400">
            We detected {DETECTED_BILLS.length} recurring bills from your transactions
          </p>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
        {bills.map((bill) => {
          const detected = DETECTED_BILLS.find((d) => d.id === bill.id);

          return (
            <div
              key={bill.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl",
                "bg-slate-800/50 border transition-all",
                bill.enabled
                  ? "border-white/10"
                  : "border-transparent opacity-50"
              )}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => handleToggleBill(bill.id)}
                className={cn(
                  "shrink-0 p-2 rounded-lg transition-colors",
                  bill.enabled
                    ? "bg-teal-500/20 text-teal-400"
                    : "bg-slate-700/50 text-slate-500"
                )}
              >
                {bill.enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>

              {/* Bill Icon */}
              <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-lg">
                {detected?.icon || "📄"}
              </div>

              {/* Bill Details */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {bill.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Due on the {bill.dueDay}{getOrdinalSuffix(bill.dueDay)}
                  </span>
                  {bill.enabled && (
                    <>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>Remind 3 days before</span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-white font-medium">${bill.amount.toFixed(2)}</p>
                <p className="text-xs text-slate-500">/month</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Bill */}
      {showAddForm ? (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Add Custom Bill</p>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Bill Name</label>
              <input
                type="text"
                value={newBillName}
                onChange={(e) => setNewBillName(e.target.value)}
                placeholder="e.g., Phone Bill"
                className={cn(
                  "w-full px-3 py-2 text-sm",
                  "bg-slate-900 border border-white/10 rounded-lg",
                  "text-white placeholder-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500"
                )}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Amount</label>
              <input
                type="number"
                value={newBillAmount}
                onChange={(e) => setNewBillAmount(e.target.value)}
                placeholder="0.00"
                className={cn(
                  "w-full px-3 py-2 text-sm",
                  "bg-slate-900 border border-white/10 rounded-lg",
                  "text-white placeholder-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Due Day</label>
              <select
                value={newBillDueDay}
                onChange={(e) => setNewBillDueDay(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 text-sm",
                  "bg-slate-900 border border-white/10 rounded-lg",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500"
                )}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}{getOrdinalSuffix(day)} of month
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddBill}
              disabled={!newBillName.trim() || !newBillAmount}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium mt-5",
                "transition-colors",
                newBillName.trim() && newBillAmount
                  ? "bg-teal-500 text-white hover:bg-teal-400"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              )}
            >
              Add Bill
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 p-3",
            "border border-dashed border-slate-700 rounded-xl",
            "text-sm text-slate-400 hover:text-white hover:border-slate-600",
            "transition-colors"
          )}
        >
          <Plus className="h-4 w-4" />
          Add Custom Bill
        </button>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
        <div>
          <p className="text-sm text-slate-400">Monthly bills total</p>
          <p className="text-2xl font-bold text-white">${totalMonthly.toFixed(2)}</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">Reminders enabled</p>
          <div className="flex items-center gap-2 justify-end">
            <CheckCircle className="h-5 w-5 text-teal-400" />
            <span className="text-xl font-semibold text-white">{enabledCount}</span>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium",
            "bg-gradient-to-r from-teal-500 to-blue-500 text-white",
            "hover:opacity-90 transition-opacity"
          )}
        >
          <Check className="h-4 w-4" />
          Complete Setup
        </button>
      </div>
    </div>
  );
}

export default BillRemindersStep;
