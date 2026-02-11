import { Metadata } from 'next';
import { ClientEvents } from './client';

export const metadata: Metadata = {
  title: 'Event Budgets | Budget App',
  description: 'Manage event and project budgets',
};

export default function EventsPage() {
  return <ClientEvents />;
}
