"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { CyberpunkNavBar, type NavItem } from "../CyberpunkNavigationFixed";
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
  // Debug mode disabled - using full layout
  const ENABLE_DEBUG_MODE = false;

  if (ENABLE_DEBUG_MODE) {
    console.log('[MainLayout] Running in DEBUG mode - simple layout');
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Simple test header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-900 text-white p-4">
          <h1 className="text-xl font-bold">TANIUM TCO - DEBUG MODE</h1>
          <p className="text-sm">If you see this, the basic layout is working</p>
        </div>

        {/* Simple sidebar */}
        <div className="fixed left-0 top-16 bottom-0 w-64 bg-gray-800 text-white p-4">
          <h2 className="font-bold mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-blue-400">Dashboard</a></li>
            <li><a href="/study" className="hover:text-blue-400">Study</a></li>
            <li><a href="/practice" className="hover:text-blue-400">Practice</a></li>
          </ul>
        </div>

        {/* Main content */}
        <div className="pl-64 pt-16">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    );
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const AnimatedBackground = dynamic(
    () => import("../CyberpunkNavigationFixed").then((m) => m.AnimatedBackground),
    { ssr: false, loading: () => null }
  );
  const globalNavActive = useGlobalNavActive();

  // If global nav is already active elsewhere and this isn't the global shell, collapse to passthrough
  // DEBUG: Log when this happens
  // TEMPORARILY DISABLED TO DEBUG RENDERING ISSUE
  /*
  if (!asGlobal && globalNavActive) {
    console.log('[MainLayout] Bypassing layout - asGlobal:', asGlobal, 'globalNavActive:', globalNavActive);
    return <>{children}</>;
  }
  */
  console.log('[MainLayout] Rendering full layout - asGlobal:', asGlobal, 'globalNavActive:', globalNavActive);

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
      {/* Particle Background (deferred, desktop-only) - Set to background layer */}
      {showBackground && <div className="fixed inset-0 z-0"><AnimatedBackground /></div>}

      {/* Enhanced Cyberpunk Navigation with Mobile Menu - Higher z-index */}
      <ErrorBoundary name="CyberpunkNavBar">
        <div className="relative z-30">
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
      </ErrorBoundary>

      {/* Modern Responsive Sidebar - Ensure proper z-index */}
      <ErrorBoundary name="Sidebar">
        <div className="relative z-40">
          <Sidebar
            isOpen={sidebarOpen || isDesktop}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </ErrorBoundary>

      {/* Main content with proper responsive spacing - Higher than background */}
      <main
        id="main-content"
        className={cn(
          "relative z-20 pt-24 px-4 pb-8 transition-all duration-300",
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
            <ErrorBoundary name="MainContent">
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
