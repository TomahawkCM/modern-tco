import { ExamOnlyProviders } from "@/app/heavy-providers";

/**
 * Assessments Route Layout
 *
 * Wraps assessment pages with ExamOnlyProviders.
 */
export default function AssessmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExamOnlyProviders>{children}</ExamOnlyProviders>;
}
