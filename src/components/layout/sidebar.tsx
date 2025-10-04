"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import {
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Target,
  Trophy,
  Clock,
  User,
  Shield,
  Server,
  Wrench,
  Layers,
  AlertTriangle,
  ChevronRight,
  Home,
  Zap,
  FlaskConical,
  Video,
  Calendar,
  Monitor,
  BookMarked,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  items?: NavItem[];
  href?: string;
}

export function Sidebar({ isOpen = true, onClose, className }: SidebarProps) {
  const router = useRouter();
  const { getTotalIncorrectCount } = useIncorrectAnswers();
  const [expandedItems, setExpandedItems] = useState<string[]>(["study", "domains"]);
  const [activeItem, setActiveItem] = useState("dashboard");

  // Get the actual incorrect answers count
  const incorrectAnswersCount = getTotalIncorrectCount();

  const navigationItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      id: "study",
      label: "Study",
      icon: BookOpen,
      items: [
        { id: "learning-modules", label: "Learning Modules", icon: BookOpen, href: "/modules" },
        { id: "practice-mode", label: "Practice Mode", icon: Target, href: "/practice" },
        { id: "mock-exam", label: "Mock Exam", icon: FileText, href: "/mock" },
        {
          id: "review-questions",
          label: "Review",
          icon: AlertTriangle,
          badge: incorrectAnswersCount > 0 ? incorrectAnswersCount.toString() : undefined,
          href: "/review",
        },
      ],
    },
    {
      id: "videos",
      label: "Videos",
      icon: Video,
      href: "/videos",
    },
    {
      id: "domains",
      label: "TCO Domains",
      icon: Layers,
      items: [
        {
          id: "asking-questions",
          label: "Asking Questions",
          icon: BookOpen,
          href: "/domains/asking-questions",
        },
        {
          id: "refining-questions",
          label: "Refining Questions",
          icon: Target,
          href: "/domains/refining-targeting",
        },
        { id: "taking-action", label: "Taking Action", icon: Zap, href: "/domains/taking-action" },
        {
          id: "navigation-modules",
          label: "Navigation and Basic Module Functions",
          icon: Layers,
          href: "/domains/navigation-modules",
        },
        {
          id: "reporting-export",
          label: "Report Generation and Data Export",
          icon: BarChart3,
          href: "/domains/reporting-export",
        },
      ],
    },
    {
      id: "labs",
      label: "Interactive Labs",
      icon: FlaskConical,
      badge: "NEW",
      href: "/labs",
    },
    {
      id: "simulator",
      label: "Simulator",
      icon: Monitor,
      href: "/simulator",
    },
    {
      id: "daily-review",
      label: "Daily Review",
      icon: Calendar,
      href: "/daily-review",
    },
    {
      id: "kb",
      label: "KB",
      icon: BookMarked,
      href: "/kb",
    },
    {
      id: "notes",
      label: "Notes",
      icon: StickyNote,
      href: "/notes",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleItemClick = (item: NavItem) => {
    if (item.items) {
      toggleExpanded(item.id);
    } else {
      setActiveItem(item.id);
      if (item.href) {
        router.push(item.href);
      }
      if (onClose) onClose();
    }
  };

  // Domain progress (mock data)
  const domainProgress = [
    { name: "Asking Questions", progress: 85, total: 45 },
    { name: "Refining Questions", progress: 72, total: 38 },
    { name: "Taking Action", progress: 68, total: 52 },
    { name: "Navigation and Basic Module Functions", progress: 45, total: 41 },
    { name: "Report Generation and Data Export", progress: 38, total: 35 },
  ];

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;
    const hasChildren = item.items && item.items.length > 0;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archon-cyan-primary disabled:pointer-events-none disabled:opacity-50",
                "text-archon-text-secondary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright hover:border-l-2 hover:border-archon-cyan-bright",
                level > 0 && "ml-6 w-[calc(100%-1.5rem)]"
              )}
            >
              <Icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight
                className={cn("ml-auto h-4 w-4 transition-transform", isExpanded && "rotate-90")}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-1">
            {item.items!.map((subItem) => renderNavItem(subItem, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <div key={item.id}>
        <button
          className={cn(
            "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archon-cyan-primary disabled:pointer-events-none disabled:opacity-50",
            level > 0 && "ml-6 w-[calc(100%-1.5rem)]",
            isActive && "bg-gradient-to-r from-archon-cyan-primary/20 to-archon-purple-primary/10 text-archon-cyan-bright border-l-2 border-archon-cyan-bright shadow-[0_0_15px_rgba(0,212,255,0.2)]",
            !isActive && "text-archon-text-secondary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright hover:border-l-2 hover:border-archon-cyan-bright/50"
          )}
          onClick={() => handleItemClick(item)}
        >
          <Icon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </button>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-archon-bg-panel/95 to-archon-bg-start/95">
      {/* Profile section - Fixed at top */}
      <div className="p-4 flex-shrink-0">
        <div className="glass-card rounded-lg p-3 border-archon-border-bright cyber-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-archon-cyan-bright to-archon-cyan-primary shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-archon-text-primary archon-text-glow">Study Progress</p>
              <div className="flex items-center space-x-2 text-xs text-archon-text-secondary">
                <Trophy className="h-3 w-3 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                <span>Level 3 Learner</span>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-archon-text-secondary">
              <span>Overall Progress</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-archon-cyan-bright">62%</span>
              </div>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-archon-cyan-primary/20 border border-archon-cyan-bright/30">
              <div
                className="h-full bg-gradient-to-r from-archon-cyan-bright to-archon-cyan-primary transition-all progress-glow"
                style={{ width: '62%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-archon-cyan-primary/30 scrollbar-track-transparent">
        <div className="space-y-2">{navigationItems.map((item) => renderNavItem(item))}</div>

        <hr className="my-4 h-[1px] w-full shrink-0 bg-archon-border-bright/30" />

        {/* Domain Progress Summary */}
        <div className="space-y-3">
          <h3 className="px-2 text-sm font-medium text-archon-text-accent flex items-center gap-2">
            <div className="h-[2px] w-2 bg-archon-cyan-bright rounded-full"></div>
            Domain Progress
          </h3>
          {domainProgress.map((domain) => (
            <div key={domain.name} className="space-y-1 px-2 group">
              <div className="flex justify-between text-xs text-archon-text-secondary group-hover:text-archon-cyan-bright transition-colors">
                <span className="truncate">{domain.name}</span>
                <span className="font-medium">{domain.progress}%</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-archon-cyan-primary/20 border border-archon-border/50">
                <div
                  className="h-full bg-gradient-to-r from-archon-purple-primary to-archon-cyan-primary transition-all duration-500"
                  style={{ width: `${domain.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Study streak */}
        <div className="glass-card mt-4 rounded-lg p-3 border-archon-border-bright/30 hover:border-archon-cyan-bright/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-500/20 rounded-md">
                <Clock className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              </div>
              <span className="text-sm text-archon-text-primary font-medium">Study Streak</span>
            </div>
            <Badge className="text-xs bg-gradient-to-r from-archon-cyan-primary to-archon-purple-primary border-archon-cyan-bright/30 text-white">
              7 days
            </Badge>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Persistent */}
      <aside
        id="main-navigation"
        className={cn(
          // Offset below top nav bar (~6rem) and match remaining viewport height
          "fixed left-0 top-24 z-40 h-[calc(100vh-6rem)] w-64 transition-transform duration-300 ease-in-out",
          "hidden md:block", // Show on desktop
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <div className="h-full border-r border-archon-border-bright/30 backdrop-blur-xl rounded-r-xl shadow-[0_0_30px_rgba(0,212,255,0.1)] bg-gradient-to-b from-archon-bg-panel/98 to-archon-bg-start/98">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sheet Navigation - Overlay */}
      <Sheet open={isOpen && typeof window !== 'undefined' && window.innerWidth < 768} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 border-archon-border-bright/30 backdrop-blur-xl p-0 bg-gradient-to-b from-archon-bg-panel/98 to-archon-bg-start/98">
          <SheetHeader className="p-4 pb-0 border-b border-archon-border/30">
            <SheetTitle className="text-archon-text-primary text-left font-bold archon-text-glow">Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-4rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
