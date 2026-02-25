"use client";

import { StudyProgressPanel } from "@/components/study/StudyProgressPanel";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsAdmin } from "@/contexts/AuthContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { useStudySession } from "@/contexts/StudySessionContext";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Beaker,
  BookMarked,
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  FlaskConical,
  Home,
  Layers,
  Monitor,
  Plus,
  Settings,
  Shield,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
  Upload,
  User,
  Video,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
// Force layout refresh

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
  const isAdmin = useIsAdmin();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["study", "domains"]);
  const [activeItem, setActiveItem] = React.useState("dashboard");
  const [isStudyProgressExpanded, setIsStudyProgressExpanded] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      id: "lab-companion",
      label: "Lab Companion",
      icon: Beaker,
      href: "/lab-companion",
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
      id: "flashcards",
      label: "Flashcards",
      icon: Brain,
      badge: "NEW",
      href: "/flashcards",
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
      id: "budget",
      label: "Budget App",
      icon: Wallet,
      href: "/budget-app",
    },
    {
      id: "online-budget",
      label: "Online Budget",
      icon: Wallet,
      badge: "ONLINE",
      href: process.env.NEXT_PUBLIC_ONLINE_BUDGET_URL || "http://localhost:3001",
    },
    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: Shield,
            badge: "ADMIN",
            items: [
              {
                id: "question-bank",
                label: "Question Bank",
                icon: FileText,
                href: "/admin/questions",
              },
              {
                id: "create-question",
                label: "Create Question",
                icon: Plus,
                href: "/admin/questions/new",
              },
              {
                id: "bulk-import",
                label: "Bulk Import",
                icon: Upload,
                href: "/admin/questions/bulk-import",
              },
              {
                id: "ai-generate",
                label: "AI Generate",
                icon: Sparkles,
                href: "/admin/questions/ai-generate",
              },
            ],
          },
        ]
      : []),
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
        if (item.href.startsWith("http")) {
          window.open(item.href, "_blank");
        } else {
          void router.push(item.href);
        }
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
                "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                "text-muted-foreground hover:border-l-2 hover:border-primary hover:bg-primary/10 hover:text-primary",
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
            "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
            level > 0 && "ml-6 w-[calc(100%-1.5rem)]",
            isActive &&
              "border-l-2 border-primary bg-gradient-to-r from-primary/20 to-accent/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]",
            !isActive &&
              "text-muted-foreground hover:border-l-2 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
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
    <div className="flex h-full flex-col border-r bg-card">
      {/* Profile section - Fixed at top */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="rounded-lg border bg-secondary/50 p-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Study Progress</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Trophy className="h-3 w-3 text-warning" />
                <span>Level 3 Learner</span>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span className="font-medium text-primary">62%</span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={62}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall study progress: 62% complete"
            >
              <div className="h-full bg-primary transition-all" style={{ width: "62%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">{navigationItems.map((item) => renderNavItem(item))}</div>

        <div className="mx-2 my-4 h-px bg-border" />

        {/* Study Progress - Only show when actively studying a module */}
        {studySession && (
          <div className="mb-4 px-2">
            <Collapsible open={isStudyProgressExpanded} onOpenChange={setIsStudyProgressExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-xs font-semibold text-primary">CURRENT MODULE</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isStudyProgressExpanded && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <StudyProgressPanel />
              </CollapsibleContent>
            </Collapsible>
            <div className="my-4 h-px bg-border" />
          </div>
        )}

        {/* Domain Progress Summary */}
        <div className="space-y-4 px-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Domain Progress
          </h3>
          {domainProgress.map((domain) => (
            <div key={domain.name} className="group space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                <span className="truncate pr-2">{domain.name}</span>
                <span className="font-medium">{domain.progress}%</span>
              </div>
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={domain.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${domain.name} domain progress: ${domain.progress}%`}
              >
                <div
                  className="h-full bg-primary/80 transition-all duration-500"
                  style={{ width: `${domain.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Study streak */}
        <div className="mx-2 mt-6 rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Study Streak</span>
            </div>
            <Badge variant="secondary" className="font-mono">
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
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out",
          "hidden md:block", // Show on desktop
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sheet Navigation - Overlay */}
      <Sheet open={isOpen && isMobile} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 border-r p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-4rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
