import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClientReview } from "./client";

export const metadata: Metadata = {
  title: "Review Transactions | Budget App",
  description: "Review and categorize uncategorized transactions",
};

export default function ReviewPage() {
  return (
    <ErrorBoundary name="Review">
      <ClientReview />
    </ErrorBoundary>
  );
}
