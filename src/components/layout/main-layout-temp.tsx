"use client";

import { useState } from "react";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { CyberpunkNavBar, AnimatedBackground, type NavItem } from "../CyberpunkNavigation";
import { Cpu, BookOpen, ClipboardCheck, BarChart3, Settings } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Define TCO-specific navigation items
const tcoNavItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: <Cpu className="h-4 w-4" /> },
  { name: "Study", href: "/study", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Practice", href: "/practice", icon: <ClipboardCheck className="h-4 w-4" /> },
  { name: "Analytics", href: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { name: "Notes", href: "/notes", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' }}>
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Cyberpunk Navigation */}
      <CyberpunkNavBar 
        navItems={tcoNavItems}
        brandName="TANIUM TCO"
        onTabChange={(tabName) => {
          console.log(`Navigating to: ${tabName}`);
          // TODO: Add actual navigation logic
        }}
      />

      {/* Legacy Sidebar - Hidden but kept for gradual migration */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} className="hidden" />

      {/* Main content with cyberpunk styling */}
      <main
        id="main-content"
        className="relative z-10 min-h-[calc(100vh-4rem)] pt-24 px-4"
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
