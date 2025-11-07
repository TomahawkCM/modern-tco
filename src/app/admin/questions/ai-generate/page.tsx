import { AdminGuard } from "@/components/auth/AdminGuard";
import { AIGenerationPanel } from "@/components/admin/questions/AIGenerationPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// AI Question Generation - Admin tool for TCO certification questions
export default function AIGeneratePage() {
  return (
    <AdminGuard>
      <div className="container mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questions
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Question Generation</h1>
          <p className="mt-1 text-muted-foreground">
            Generate TCO certification questions using Claude AI
          </p>
        </div>

        <AIGenerationPanel />
      </div>
    </AdminGuard>
  );
}
