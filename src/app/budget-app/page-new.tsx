"use client";

/**
 * Budget App Dashboard - Modern 2025 Design
 * Card-based layout with interactive charts and progressive disclosure
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Plus,
  Upload,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { db, initializeDefaultCategories } from "@/lib/budget-db";
import type { Transaction, Account, Budget, Category } from "@/types/budget";
