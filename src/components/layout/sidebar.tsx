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
                "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-white/5 hover:text-white",
                level > 0 && "ml-6 w-[calc(100%-1.5rem)]",
                "text-gray-300"
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
            "inline-flex h-9 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            level > 0 && "ml-6 w-[calc(100%-1.5rem)]",
            isActive && "bg-white/10 text-white",
            !isActive && "text-gray-300 hover:bg-white/5 hover:text-white"
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
    <div className="flex h-full flex-col">
      {/* Profile section - Fixed at top */}
      <div className="p-4 flex-shrink-0">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tanium-accent">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Study Progress</p>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Trophy className="h-3 w-3 text-yellow-400" />
                <span>Level 3 Learner</span>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-300">
              <span>Overall Progress</span>
              <div className="flex items-center gap-1">
                <span>62%</span>
                <span className="text-sm font-medium">62%</span>
              </div>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - 62}%)` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="space-y-2">{navigationItems.map((item) => renderNavItem(item))}</div>

        <hr className="my-4 h-[1px] w-full shrink-0 bg-border bg-white/10" />

        {/* Domain Progress Summary */}
        <div className="space-y-3">
          <h3 className="px-2 text-sm font-medium text-gray-300">Domain Progress</h3>
          {domainProgress.map((domain) => (
            <div key={domain.name} className="space-y-1">
              <div className="flex justify-between px-2 text-xs text-gray-300">
                <span className="truncate">{domain.name}</span>
                <span>{domain.progress}%</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                <div
                  className="h-full w-full flex-1 bg-primary transition-all"
                  style={{ transform: `translateX(-${100 - (domain.progress || 0)}%)` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Study streak */}
        <div className="glass mt-4 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-white">Study Streak</span>
            </div>
            <Badge variant="secondary" className="text-xs">
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
          "fixed left-0 top-24 z-10 h-[calc(100vh-6rem)] w-64 transition-transform duration-300 ease-in-out",
          "hidden md:block", // Show on desktop
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <div className="glass h-full border-r border-white/10 backdrop-blur-md rounded-r-xl">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sheet Navigation - Overlay */}
      <Sheet open={isOpen && typeof window !== 'undefined' && window.innerWidth < 768} onOpenChange={onClose}>
        <SheetContent side="left" className="glass w-64 border-white/10 backdrop-blur-md p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-white text-left">Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-4rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
