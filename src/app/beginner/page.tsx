'use client';

import { BeginnerDashboard } from '@/components/dashboard/BeginnerDashboard';
import { BeginnerLayout } from '@/components/layout/BeginnerLayout';

export default function BeginnerPage() {
  return (
    <BeginnerLayout>
      <BeginnerDashboard />
    </BeginnerLayout>
  );
}
