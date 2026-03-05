"use client";

import {
  LazyBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";

interface SignupChartProps {
  data: { date: string; count: number }[];
}

export function AdminSignupChart({ data }: SignupChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5), // "MM-DD"
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LazyBarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          labelFormatter={(label) => `Date: ${label}`}
          formatter={(value: number | undefined) => [value ?? 0, "Signups"]}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </LazyBarChart>
    </ResponsiveContainer>
  );
}
