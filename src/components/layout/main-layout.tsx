"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { CyberpunkNavBar, type NavItem } from "../CyberpunkNavigation";
import { Cpu, BookOpen, ClipboardCheck, BarChart3, Settings, Menu, Terminal, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGlobalNavActive } from "@/contexts/GlobalNavContext";

interface MainLayoutProps { children: React.ReactNode; asGlobal?: boolean }

// Define TCO-specific navigation items
const tcoNavItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: <Cpu className="h-4 w-4" /> },
  { name: "Study", href: "/modules", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Videos", href: "/videos", icon: <PlayCircle className="h-4 w-4" /> },
  { name: "Labs", href: "/labs", icon: <Terminal className="h-4 w-4" /> },
  { name: "Practice", href: "/practice", icon: <ClipboardCheck className="h-4 w-4" /> },
  { name: "Review", href: "/study/review", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Simulator", href: "/simulator", icon: <Terminal className="h-4 w-4" /> },
  { name: "Analytics", href: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { name: "KB", href: "/kb", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Notes", href: "/notes", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

export function MainLayout({ children, asGlobal = false }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const AnimatedBackground = dynamic(
    () => import("../CyberpunkNavigation").then((m) => m.AnimatedBackground),
    { ssr: false }
  );
  const globalNavActive = useGlobalNavActive();

  // If global nav is already active elsewhere and this isn't the global shell, collapse to passthrough
  if (!asGlobal && globalNavActive) {
    return <>{children}</>;
  }

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Defer particle background for performance and honor reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    // Only render on desktop-sized viewports
    if (!isDesktop) return;
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
    const start = () => setShowBackground(true);
    if (idle) idle(start);
    else setTimeout(start, 200);
  }, [isDesktop]);

  return (
    <div className="relative min-h-screen">
      {/* Particle Background (deferred, desktop-only) */}
      {showBackground && <AnimatedBackground />}
      
      {/* Enhanced Cyberpunk Navigation with Mobile Menu */}
      <div className="relative z-20">
        <CyberpunkNavBar 
          navItems={tcoNavItems}
          brandName="TANIUM TCO"
          onTabChange={(tabName) => {
            console.log(`Navigating to: ${tabName}`);
          }}
        />
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40 md:hidden glass border-white/10 hover:bg-white/10"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Modern Responsive Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen || isDesktop} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content with proper responsive spacing */}
      <main
        id="main-content"
        className={cn(
          "relative z-10 pt-24 px-4 pb-8 transition-all duration-300",
          // Desktop: Add left margin for persistent sidebar
          isDesktop ? "md:ml-64" : "",
          // Mobile: Full width
          "ml-0"
        )}
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <div className="container mx-auto">
          {/* Breadcrumb navigation - transparent to show background */}
          <BreadcrumbNav className="mb-6 p-3" />
          
          {/* Content wrapper - transparent to show background */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
