"use client";

import { useRouter } from "next/navigation";
import { LoanForm } from "@/components/loans/loan-form";

interface NewLoanPageProps {
  currency: string;
}

export function NewLoanPage({ currency }: NewLoanPageProps) {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/loans");
    }
  };

  return <LoanForm onSubmit={handleSubmit} defaultCurrency={currency} />;
}
