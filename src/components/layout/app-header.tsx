"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Menu,
  Search,
  Settings,
  User,
  BookOpen,
  FileText,
  BarChart3,
  Trophy,
  Clock,
  Target,
  Sparkles,
  Brain,
  Wallet,
} from "lucide-react";

// Dynamically import AIAssistant to avoid SSR issues
const AIAssistant = dynamic(() => import("@/components/ai/AIAssistant"), {
  ssr: false,
});
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { LargeTextToggle } from "@/components/accessibility/large-text-toggle";
import { HighContrastToggle } from "@/components/accessibility/high-contrast-toggle";
import { useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface AppHeaderProps {
  onMenuClick?: () => void;
  currentScore?: number;
  studyStreak?: number;
}

export function AppHeader({ onMenuClick, currentScore = 0, studyStreak = 0 }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const router = useRouter();

  // Memoize tooltip content to prevent re-creation on every render
  const settingsTooltipContent = (
    <div className="space-y-2">
      <div className="font-medium">Settings & Preferences</div>
      <div className="text-sm text-muted-foreground">Customize your exam experience:</div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>• Theme and appearance settings</li>
        <li>• Study mode preferences</li>
        <li>• Notification settings</li>
        <li>• Performance tracking options</li>
      </ul>
    </div>
  );

  const handleSearch = () => {
    setSearchOpen(!searchOpen);
    console.log("Toggle search");
  };

  const handleCommand = (path: string) => {
    setCommandOpen(false);
    try {
      router.push(path);
    } catch {}
  };

  // Global keyboard shortcuts:
  // - Ctrl/Cmd+K: Open Command Palette (Tanium-like quick navigation)
  // - Ctrl/Cmd+Shift+K: Open AI Assistant
  // - Escape: Close open dialogs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      const isCmdShiftK = isCmdK && e.shiftKey;

      if (isCmdShiftK) {
        // Cmd+Shift+K opens AI Assistant
        e.preventDefault();
        setAiAssistantOpen(true);
      } else if (isCmdK) {
        // Cmd+K opens Command Palette
        e.preventDefault();
        setCommandOpen(true);
      }

      if (e.key === "Escape") {
        setCommandOpen(false);
        setAiAssistantOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="glass sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-foreground hover:bg-white/10 md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-tanium-accent flex h-8 w-8 items-center justify-center rounded-lg">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">TCO Exam</h1>
                <p className="text-xs text-muted-foreground">Tanium Certified Operator</p>
              </div>
            </div>
          </div>

          {/* Budget App Link */}
          <Button
            variant="ghost"
            size="sm"
            className="glass ml-4 border border-white/10 text-foreground hover:bg-white/10"
            onClick={() => router.push("/budget-app")}
            aria-label="Budget App"
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </Button>

          {/* Center - Search/Command */}
          <div className="flex flex-1 justify-center px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="glass w-full max-w-sm justify-start border-white/20 text-foreground hover:bg-white/10"
                onClick={() => router.push("/search")}
                aria-label="Open question search"
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Search questions...</span>
                <span className="sm:hidden">Search...</span>
              </Button>

              {/* AI Assistant Button */}
              <Button
                variant="outline"
                size="icon"
                className="glass text-tanium-accent hover:bg-tanium-accent/10 hover:border-tanium-accent/50 border-white/20"
                onClick={() => setAiAssistantOpen(true)}
                aria-label="Open AI Study Assistant (Cmd+Shift+K)"
                title="AI Study Assistant (Cmd+Shift+K)"
              >
                <Brain className="h-5 w-5" />
                <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 text-amber-400" />
              </Button>
            </div>
          </div>

          {/* Right side - Stats and settings */}
          <div className="flex items-center space-x-3">
            {/* Study streak */}
            <div className="glass hidden items-center space-x-2 rounded-lg px-3 py-1.5 md:flex">
              <Clock className="h-4 w-4 text-orange-400" />
              <div className="text-sm">
                <span className="font-medium text-foreground">{studyStreak}</span>
                <span className="ml-1 text-muted-foreground">day streak</span>
              </div>
              {/* <ExamTooltip type="mode" context="Consecutive days of study activity" /> */}
            </div>

            {/* Current score */}
            <div className="glass hidden items-center space-x-2 rounded-lg px-3 py-1.5 sm:flex">
              <Trophy className="h-4 w-4 text-[#f97316]" />
              <div className="text-sm">
                <span className="font-medium text-foreground">{currentScore}%</span>
                <span className="ml-1 text-muted-foreground">avg</span>
              </div>
              {/* <QuickTips.Score score={currentScore} /> - Component removed for now */}
            </div>

            {/* Accessibility toggles */}
            <div className="pointer-events-auto relative z-50 flex items-center gap-2">
              <HighContrastToggle />
              <LargeTextToggle />
            </div>

            {/* Settings */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-white/10"
                onClick={() => router.push("/settings")}
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <HelpTooltip content={settingsTooltipContent} />
            </div>

            {/* Profile */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Command Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Study">
            <CommandItem onSelect={() => handleCommand("/modules")}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Learning Modules</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/practice")}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Practice Questions</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/mock")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Mock Exam</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/review")}>
              <Target className="mr-2 h-4 w-4" />
              <span>Review Mistakes</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Analytics">
            <CommandItem onSelect={() => handleCommand("/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Performance Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/progress")}>
              <Trophy className="mr-2 h-4 w-4" />
              <span>Progress Tracking</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Domains">
            <CommandItem onSelect={() => handleCommand("/domains/asking-questions")}>
              <span>Asking Questions</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/domains/refining-targeting")}>
              <span>Refining Questions</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/domains/taking-action")}>
              <span>Taking Action</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/domains/navigation-modules")}>
              <span>Navigation & Modules</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/domains/reporting-export")}>
              <span>Reporting & Export</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* AI Study Assistant */}
      <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </>
  );
}
