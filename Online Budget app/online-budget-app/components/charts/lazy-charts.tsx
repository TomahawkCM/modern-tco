"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded recharts components.
 * Using dynamic imports with ssr: false since recharts uses browser APIs.
 */

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
);

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
);

// Re-export commonly used recharts primitives (these are lightweight and don't need lazy loading)
export {
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
