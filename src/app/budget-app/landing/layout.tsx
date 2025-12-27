import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BudgetPro - Master Your Finances",
  description:
    "Experience financial clarity like never before. Real-time analytics, smart categorization, and anomaly detection.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
