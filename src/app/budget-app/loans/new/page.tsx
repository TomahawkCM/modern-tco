/**
 * New Loan Page
 * Form for creating a new loan
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanForm } from "@/components/budget/loans/LoanForm";

export default function NewLoanPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Loan</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanForm />
        </CardContent>
      </Card>
    </div>
  );
}
