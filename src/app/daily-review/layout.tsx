"use client";

import { ReviewProvider } from "@/contexts/ReviewContext";

export default function DailyReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReviewProvider>{children}</ReviewProvider>;
}
