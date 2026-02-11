import { Metadata } from 'next';
import { ClientReview } from './client';

export const metadata: Metadata = {
  title: 'Review Transactions | Budget App',
  description: 'Review and categorize uncategorized transactions',
};

export default function ReviewPage() {
  return <ClientReview />;
}
