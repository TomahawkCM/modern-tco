"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  const tAria = useTranslations("aria");
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed z-40 rounded-full shadow-lg",
        "h-14 w-14",
        "md:hidden",
        "bg-primary hover:bg-primary/90",
        "transition-transform active:scale-95",
        className
      )}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        insetInlineEnd: "16px",
      }}
      aria-label={tAria("addTransaction")}
    >
      <Plus size={24} />
    </Button>
  );
}
