"use client";

import { BeginnerLayout } from "@/components/layout/BeginnerLayout";
import { BeginnerDashboard } from "@/components/dashboard/BeginnerDashboard";

export default function BeginnerPage() {
  return (
    <BeginnerLayout>
      <BeginnerDashboard />
    </BeginnerLayout>
  );
}