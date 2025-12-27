"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  asGlobal?: boolean;
}

function MainLayoutComponent({ children, asGlobal = false }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleSidebarOpen = useCallback(() => setSidebarOpen(true), []);

  const mainClassName = useMemo(
    () =>
      cn(
        "relative z-20 pt-20 px-4 pb-8 transition-all duration-300",
        isDesktop ? "md:ml-64" : "ml-0"
      ),
    [isDesktop]
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (pathname?.startsWith("/budget-app")) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSidebarOpen}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="ml-4 text-lg font-semibold">Tanium TCO</span>
      </div>

      {/* Sidebar */}
      <ErrorBoundary name="Sidebar">
        <div className="relative z-40">
          <Sidebar isOpen={sidebarOpen || isDesktop} onClose={handleSidebarClose} />
        </div>
      </ErrorBoundary>

      {/* Main content */}
      <main
        id="main-content"
        className={mainClassName}
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <div className="container mx-auto max-w-7xl">
          <BreadcrumbNav className="mb-6" />

          <ErrorBoundary name="MainContent">{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export const MainLayout = memo(MainLayoutComponent);
