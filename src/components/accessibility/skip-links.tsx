"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SkipLinks() {
  const handleSkipToContent = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSkipToNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    const navigation = document.getElementById("main-navigation");
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-[100]",
        "translate-y-[-100%] focus-within:translate-y-0",
        "transition-transform duration-200"
      )}
      aria-label="Skip navigation links"
    >
      <div className="flex gap-2 border-b border-white/20 bg-tanium-primary p-2">
        <Button variant="secondary" size="sm" onClick={handleSkipToContent} className="text-sm">
          Skip to main content
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSkipToNavigation} className="text-sm">
          Skip to navigation
        </Button>
      </div>
    </div>
  );
}
