import { Suspense } from "react";
import TransactionsPageClient from "./TransactionsPageClient";

/**
 * Transactions Page Server Wrapper
 * Provides dynamic rendering and Suspense boundary for useSearchParams
 */

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = "force-dynamic";

// Loading fallback component
function TransactionsLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading transactions...</p>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsLoading />}>
      <TransactionsPageClient />
    </Suspense>
  );
}
