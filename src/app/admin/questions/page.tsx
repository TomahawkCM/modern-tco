import { Metadata } from 'next';
import AdminQuestionsPage from './questions-client';

export const metadata: Metadata = {
  title: 'Questions | Admin',
  description: 'Manage TCO certification questions',
};

export default function QuestionsPage() {
  return <AdminQuestionsPage />;
}