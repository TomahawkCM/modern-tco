import { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientNetWorth } from './client';

export const metadata: Metadata = {
  title: 'Net Worth | Budget App',
  description: 'Track your net worth over time',
};

export default function NetWorthPage() {
  return (
    <ErrorBoundary name="NetWorth">
      <ClientNetWorth />
    </ErrorBoundary>
  );
}
