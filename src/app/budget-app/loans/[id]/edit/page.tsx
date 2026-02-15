/**
 * Edit Loan Page
 * Form for editing an existing loan
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanForm } from "@/components/budget/loans/LoanForm";
import type { Loan } from "@/types/budget";
import { getLoan } from "@/lib/loans/loan-db";

export default function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoan();
  }, [id]);

  async function loadLoan() {
    try {
      setLoading(true);
      const loanData = await getLoan(id);
      setLoan(loanData || null);
    } catch (error) {
      console.error("Error loading loan:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-500"></div>
          <p className="text-gray-500">Loading loan...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Loan not found</h2>
        <p className="mb-6 text-gray-500">The loan you're trying to edit doesn't exist.</p>
        <Link href="/budget-app/loans">
          <Button>Back to Loans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/budget-app/loans/${loan.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Loan</h1>
          <p className="mt-1 text-slate-400">{loan.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanForm loan={loan} />
        </CardContent>
      </Card>
    </div>
  );
}
