import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { BulkImporter } from "@/components/admin/questions/BulkImporter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bulk Import Questions | Admin",
  description: "Import multiple TCO certification questions at once from CSV or JSON files",
};

export default function BulkImportPage() {
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
          <h1 className="text-3xl font-bold text-foreground">Bulk Import Questions</h1>
          <p className="mt-1 text-muted-foreground">
            Import multiple questions at once from CSV or JSON files
          </p>
        </div>

        <BulkImporter />
      </div>
    </AdminGuard>
  );
}
