import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { QuestionEditor } from "@/components/admin/questions/QuestionEditor";

export const metadata: Metadata = {
  title: "New Question | Admin",
  description: "Create a new TCO certification question",
};

export default function NewQuestionPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <QuestionEditor />
      </div>
    </AdminGuard>
  );
}
