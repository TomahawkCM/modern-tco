import { Metadata } from 'next';
import { ClientProperties } from './client';

export const metadata: Metadata = {
  title: 'Properties | Budget App',
  description: 'Track your real estate portfolio',
};

export default function PropertiesPage() {
  return <ClientProperties />;
}
