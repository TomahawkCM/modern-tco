'use client';

/**
 * Spending Heat Map Component (Phase 4)
 * Task 4.3.2: Add spending heat map
 * 
 * 7x4-5 grid showing spending intensity by day of week
 */

import { useState } from 'react';
import type { Transaction } from '@/types/budget';

interface SpendingHeatMapProps {
  transactions: Transaction[];
  month?: Date; // Defaults to current month
}

interface DayData {
  date: Date;
  amount: number;
  transactionCount: number;
}

export function SpendingHeatMap({ transactions, month = new Date() }: SpendingHeatMapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Get first day of month and total days
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Calculate spending per day
  const dailySpending = new Map<string, DayData>();
  
  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    if (
      txDate.getMonth() === month.getMonth() &&
      txDate.getFullYear() === month.getFullYear() &&
      tx.amount < 0 // Only expenses
    ) {
      const dateKey = txDate.toISOString().split('T')[0];
      const existing = dailySpending.get(dateKey) || {
        date: txDate,
        amount: 0,
        transactionCount: 0,
      };
      
      existing.amount += Math.abs(tx.amount);
      existing.transactionCount += 1;
      dailySpending.set(dateKey, existing);
    }
  });

  // Find max spending for color scale
  const maxSpending = Math.max(...Array.from(dailySpending.values()).map(d => d.amount), 1);

  // Build calendar grid (week rows)
  const weeks: (DayData | null)[][] = [];
  let currentWeek: (DayData | null)[] = [];

  // Fill first week with empty cells (Sunday start)
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = dailySpending.get(dateKey) || { date, amount: 0, transactionCount: 0 };
    
    currentWeek.push(dayData);

    // Start new week on Saturday night (day 6)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill last week with empty cells
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get color intensity based on spending
  function getIntensityColor(amount: number): string {
    if (amount === 0) return 'bg-gray-100';
    
    const intensity = amount / maxSpending;
    
    if (intensity >= 0.75) return 'bg-teal-700';
    if (intensity >= 0.5) return 'bg-teal-500';
    if (intensity >= 0.25) return 'bg-teal-300';
    return 'bg-teal-100';
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Heat Map Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Spending Heat Map
          </h3>
          <div className="text-sm text-gray-600">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="aspect-square"
                    />
                  );
                }

                const colorClass = getIntensityColor(day.amount);

                return (
                  <div
                    key={day.date.toISOString()}
                    className={`aspect-square ${colorClass} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all relative group`}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span className="text-xs font-medium text-gray-800">
                      {day.date.getDate()}
                    </span>
                    
                    {/* Tooltip */}
                    {hoveredDay === day && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                        <div className="font-semibold">
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="mt-2">
                          ${day.amount.toFixed(2)} spent
                        </div>
                        <div className="text-gray-300">
                          {day.transactionCount} transaction{day.transactionCount !== 1 ? 's' : ''}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-gray-600">Less spending</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="w-4 h-4 bg-teal-100 rounded" />
            <div className="w-4 h-4 bg-teal-300 rounded" />
            <div className="w-4 h-4 bg-teal-500 rounded" />
            <div className="w-4 h-4 bg-teal-700 rounded" />
          </div>
          <div className="text-xs text-gray-600">More spending</div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-600">Total Spent</div>
            <div className="text-lg font-bold text-gray-900">
              ${Array.from(dailySpending.values()).reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Busiest Day</div>
            <div className="text-lg font-bold text-gray-900">
              {(() => {
                const busiest = Array.from(dailySpending.values()).reduce((max, d) => 
                  d.amount > max.amount ? d : max
                , { date: new Date(), amount: 0, transactionCount: 0 });
                return busiest.amount > 0 
                  ? dayNames[busiest.date.getDay()] 
                  : '-';
              })()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Avg Per Day</div>
            <div className="text-lg font-bold text-gray-900">
              ${(Array.from(dailySpending.values()).reduce((sum, d) => sum + d.amount, 0) / daysInMonth).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

