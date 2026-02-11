import { Metadata } from 'next';
import { ClientNetWorth } from './client';

export const metadata: Metadata = {
  title: 'Net Worth | Budget App',
  description: 'Track your net worth over time',
};

export default function NetWorthPage() {
  return <ClientNetWorth />;
}
