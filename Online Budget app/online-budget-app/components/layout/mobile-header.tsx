"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const t = useTranslations("sidebar");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <span className="text-sm font-semibold">{t("brand")}</span>
    </header>
  );
}
