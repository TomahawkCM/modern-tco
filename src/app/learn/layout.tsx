import type { ReactNode } from "react";
import SideNav from "@/components/SideNav";

export const metadata = {
  title: "Learn | Tanium TCO",
};

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <div className="md:grid md:grid-cols-[16rem,1fr] md:gap-6">
        <div className="mb-4 md:mb-0">
          <SideNav />
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

