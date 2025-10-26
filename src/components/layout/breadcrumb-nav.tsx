"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavProps {
  className?: string;
}

// Define page titles and structure
const pageMap: Record<string, { title: string; parent?: string }> = {
  "/": { title: "Dashboard" },
  "/dashboard": { title: "Dashboard" },
  "/study": { title: "Study Modules" },
  "/practice": { title: "Practice Mode" },
  "/mock-exam": { title: "Mock Exam" },
  "/analytics": { title: "Analytics" },
  "/settings": { title: "Settings" },
  "/profile": { title: "Profile" },
  "/labs": { title: "Interactive Labs" },
  "/domains": { title: "TCO Domains" },
  "/domains/asking-questions": { title: "Asking Questions", parent: "/domains" },
  "/domains/refining-questions": { title: "Refining Questions", parent: "/domains" },
  "/domains/taking-action": { title: "Taking Action", parent: "/domains" },
  "/domains/navigation-modules": { title: "Navigation & Modules", parent: "/domains" },
  "/domains/reporting-export": { title: "Reporting & Export", parent: "/domains" },
  "/modules": { title: "Learning Modules", parent: "/study" },
  "/review": { title: "Review Questions", parent: "/study" },
};

export function BreadcrumbNav({ className }: BreadcrumbNavProps) {
  const pathname = usePathname() || "";

  if (pathname === "/" || pathname === "/dashboard") {
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: Array<{ title: string; href: string; isLast: boolean }> = [];

  // Always start with home
  breadcrumbItems.push({
    title: "Dashboard",
    href: "/dashboard",
    isLast: false,
  });

  // Build breadcrumb items based on current path
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const pageInfo = pageMap[currentPath];

    if (pageInfo) {
      breadcrumbItems.push({
        title: pageInfo.title,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    } else {
      // Fallback for undefined paths
      const title = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbItems.push({
        title,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    }
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  {index === 0 && <Home className="h-4 w-4" />}
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {index === 0 && <Home className="h-4 w-4" />}
                    {item.title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
