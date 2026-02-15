import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClientEvents } from "./client";

export const metadata: Metadata = {
  title: "Event Budgets | Budget App",
  description: "Manage event and project budgets",
};

export default function EventsPage() {
  return (
    <ErrorBoundary name="Events">
      <ClientEvents />
    </ErrorBoundary>
  );
}
