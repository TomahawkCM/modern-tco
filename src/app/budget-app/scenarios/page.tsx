import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClientScenarios } from "./client";

export const metadata: Metadata = {
  title: "What-If Scenarios | Budget App",
  description: "Model financial scenarios and see the impact",
};

export default function ScenariosPage() {
  return (
    <ErrorBoundary name="Scenarios">
      <ClientScenarios />
    </ErrorBoundary>
  );
}
