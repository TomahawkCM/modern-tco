import { AdminGuard } from '@/components/auth/AdminGuard';
import { QuestionEditor } from '@/components/admin/questions/QuestionEditor';

export default function NewQuestionPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <QuestionEditor />
      </div>
    </AdminGuard>
  );
}
