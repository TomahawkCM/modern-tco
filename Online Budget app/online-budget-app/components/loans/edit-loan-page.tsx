"use client";

import { useRouter } from "next/navigation";
import { LoanForm } from "@/components/loans/loan-form";

interface LoanRow {
  id: string;
  user_id: string;
  name: string;
  loan_type: string;
  original_balance_minor: number;
  current_balance_minor: number;
  interest_rate: number;
  minimum_payment_minor: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface EditLoanPageProps {
  loan: LoanRow;
}

export function EditLoanPage({ loan }: EditLoanPageProps) {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/loans/${loan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/loans/${loan.id}`);
    }
  };

  return <LoanForm initialData={loan} onSubmit={handleSubmit} isEdit />;
}
