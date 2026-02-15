import { AdminGuard } from "@/components/auth/AdminGuard";
import { QuestionEditor } from "@/components/admin/questions/QuestionEditor";

interface EditQuestionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params;

  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <QuestionEditor questionId={id} />
      </div>
    </AdminGuard>
  );
}
