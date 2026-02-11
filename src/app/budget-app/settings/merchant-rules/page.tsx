import { Metadata } from 'next';
import { ClientMerchantRules } from './client';

export const metadata: Metadata = {
  title: 'Merchant Rules | Budget App',
  description: 'Manage auto-categorization rules for merchants',
};

export default function MerchantRulesPage() {
  return <ClientMerchantRules />;
}
