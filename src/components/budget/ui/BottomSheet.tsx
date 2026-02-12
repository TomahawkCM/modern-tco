"use client";

import { useCallback } from "react";
import { motion, type PanInfo } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useDeviceClass } from "@/lib/breakpoints";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showDragHandle?: boolean;
}

/**
 * Responsive sheet component that renders as a bottom sheet on mobile
 * and a right-side panel on tablet/desktop.
 *
 * On mobile, supports swipe-down-to-dismiss via framer-motion drag.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxHeight = "90vh",
  showDragHandle = true,
}: BottomSheetProps) {
  const deviceClass = useDeviceClass();
  const isMobile = deviceClass === "phone";

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 100) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile
            ? cn("rounded-t-2xl", `max-h-[${maxHeight}]`)
            : "w-[400px]"
        )}
      >
        {isMobile ? (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex h-full flex-col"
          >
            {showDragHandle && (
              <div
                className="flex justify-center pb-2 pt-1"
                aria-label="Drag down to close"
                data-testid="drag-handle"
              >
                <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
              </div>
            )}
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
