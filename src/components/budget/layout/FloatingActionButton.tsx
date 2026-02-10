"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed z-40 rounded-full shadow-lg",
        "w-14 h-14",
        "md:hidden",
        "bg-primary hover:bg-primary/90",
        "active:scale-95 transition-transform",
        className,
      )}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        insetInlineEnd: "16px",
      }}
      aria-label="Add transaction"
    >
      <Plus size={24} />
    </Button>
  );
}
