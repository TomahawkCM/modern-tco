"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { useStudySession } from "@/contexts/StudySessionContext";
import { StudyProgressPanel } from "@/components/study/StudyProgressPanel";
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
  ChevronDown,
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
  const studySession = useStudySession();
  const [expandedItems, setExpandedItems] = useState<string[]>(["study", "domains"]);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isStudyProgressExpanded, setIsStudyProgressExpanded] = useState(true);

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
                "focus-visible:ring-archon-cyan-primary inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
                "text-archon-text-secondary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright hover:border-archon-cyan-bright hover:border-l-2",
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
            "focus-visible:ring-archon-cyan-primary inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
            level > 0 && "ml-6 w-[calc(100%-1.5rem)]",
            isActive &&
              "from-archon-cyan-primary/20 to-archon-purple-primary/10 text-archon-cyan-bright border-archon-cyan-bright border-l-2 bg-gradient-to-r shadow-[0_0_15px_rgba(0,212,255,0.2)]",
            !isActive &&
              "text-archon-text-secondary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright hover:border-archon-cyan-bright/50 hover:border-l-2"
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
    <div className="from-archon-bg-panel/95 to-archon-bg-start/95 flex h-full flex-col bg-gradient-to-b">
      {/* Profile section - Fixed at top */}
      <div className="flex-shrink-0 p-4">
        <div className="glass-card border-archon-border-bright cyber-border rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="from-archon-cyan-bright to-archon-cyan-primary flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-archon-text-primary archon-text-glow text-sm font-medium">
                Study Progress
              </p>
              <div className="text-archon-text-secondary flex items-center space-x-2 text-xs">
                <Trophy className="h-3 w-3 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                <span>Level 3 Learner</span>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-3">
            <div className="text-archon-text-secondary mb-1 flex justify-between text-xs">
              <span>Overall Progress</span>
              <div className="flex items-center gap-1">
                <span className="text-archon-cyan-bright text-sm font-medium">62%</span>
              </div>
            </div>
            <div className="bg-archon-cyan-primary/20 border-archon-cyan-bright/30 relative h-2 w-full overflow-hidden rounded-full border">
              <div
                className="from-archon-cyan-bright to-archon-cyan-primary progress-glow h-full bg-gradient-to-r transition-all"
                style={{ width: "62%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="scrollbar-thin scrollbar-thumb-archon-cyan-primary/30 scrollbar-track-transparent flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">{navigationItems.map((item) => renderNavItem(item))}</div>

        <hr className="bg-archon-border-bright/30 my-4 h-[1px] w-full shrink-0" />

        {/* Study Progress - Only show when actively studying a module */}
        {studySession && (
          <div className="mb-4">
            <Collapsible open={isStudyProgressExpanded} onOpenChange={setIsStudyProgressExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-2 py-2 text-left text-sm font-medium transition-all duration-200",
                    "text-archon-text-secondary hover:bg-archon-cyan-primary/10 hover:text-archon-cyan-bright"
                  )}
                >
                  <span className="text-archon-cyan-bright text-xs font-semibold">
                    CURRENT MODULE
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform",
                      isStudyProgressExpanded && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <StudyProgressPanel />
              </CollapsibleContent>
            </Collapsible>
            <hr className="bg-archon-border-bright/30 my-4 h-[1px] w-full shrink-0" />
          </div>
        )}

        {/* Domain Progress Summary */}
        <div className="space-y-3">
          <h3 className="text-archon-text-accent flex items-center gap-2 px-2 text-sm font-medium">
            <div className="bg-archon-cyan-bright h-[2px] w-2 rounded-full"></div>
            Domain Progress
          </h3>
          {domainProgress.map((domain) => (
            <div key={domain.name} className="group space-y-1 px-2">
              <div className="text-archon-text-secondary group-hover:text-archon-cyan-bright flex justify-between text-xs transition-colors">
                <span className="truncate">{domain.name}</span>
                <span className="font-medium">{domain.progress}%</span>
              </div>
              <div className="bg-archon-cyan-primary/20 border-archon-border/50 relative h-1.5 w-full overflow-hidden rounded-full border">
                <div
                  className="from-archon-purple-primary to-archon-cyan-primary h-full bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${domain.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Study streak */}
        <div className="glass-card border-archon-border-bright/30 hover:border-archon-cyan-bright/50 mt-4 rounded-lg p-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-md bg-orange-500/20 p-1.5">
                <Clock className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              </div>
              <span className="text-archon-text-primary text-sm font-medium">Study Streak</span>
            </div>
            <Badge className="from-archon-cyan-primary to-archon-purple-primary border-archon-cyan-bright/30 bg-gradient-to-r text-xs text-white">
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
        <div className="border-archon-border-bright/30 from-archon-bg-panel/98 to-archon-bg-start/98 h-full rounded-r-xl border-r bg-gradient-to-b shadow-[0_0_30px_rgba(0,212,255,0.1)] backdrop-blur-xl">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sheet Navigation - Overlay */}
      <Sheet
        open={isOpen && typeof window !== "undefined" && window.innerWidth < 768}
        onOpenChange={onClose}
      >
        <SheetContent
          side="left"
          className="border-archon-border-bright/30 from-archon-bg-panel/98 to-archon-bg-start/98 w-64 bg-gradient-to-b p-0 backdrop-blur-xl"
        >
          <SheetHeader className="border-archon-border/30 border-b p-4 pb-0">
            <SheetTitle className="text-archon-text-primary archon-text-glow text-left font-bold">
              Navigation
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-4rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
