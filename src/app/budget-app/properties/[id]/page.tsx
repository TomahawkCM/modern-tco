import { Metadata } from 'next';
import { ClientPropertyDetail } from './client';

export const metadata: Metadata = {
  title: 'Property Details | Budget App',
  description: 'View property details, equity, and appreciation',
};

export default function PropertyDetailPage() {
  return <ClientPropertyDetail />;
}
