import { Metadata } from 'next';
import { ClientScenarios } from './client';

export const metadata: Metadata = {
  title: 'What-If Scenarios | Budget App',
  description: 'Model financial scenarios and see the impact',
};

export default function ScenariosPage() {
  return <ClientScenarios />;
}
