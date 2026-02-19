import type { Metadata } from "next";
import { MorePageClient } from "./MorePageClient";

export const metadata: Metadata = {
  title: "More | Budget App",
  description: "Access all Budget App features and tools",
};

export default function MorePage() {
  return <MorePageClient />;
}
