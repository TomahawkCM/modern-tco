/**
 * New Loan Page
 * Form for creating a new loan
 */

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanForm } from "@/components/budget/loans/LoanForm";

export default function NewLoanPage() {
  const t = useTranslations("loans");
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("addNewLoan")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanForm />
        </CardContent>
      </Card>
    </div>
  );
}
