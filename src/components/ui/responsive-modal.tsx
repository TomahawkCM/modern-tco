"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ResponsiveModalContextValue {
  isDrawer: boolean;
}

const ResponsiveModalContext = React.createContext<ResponsiveModalContextValue | null>(null);

export function useResponsiveModalContext(): ResponsiveModalContextValue {
  const ctx = React.useContext(ResponsiveModalContext);
  if (!ctx) {
    throw new Error("useResponsiveModalContext must be used within <ResponsiveModal>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

interface ResponsiveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  /** Drawer-only — snap points for the bottom sheet (ignored on desktop) */
  snapPoints?: (number | string)[];
  /** Drawer-only — active snap point (ignored on desktop) */
  activeSnapPoint?: number | string | null;
  /** Drawer-only — setter for active snap point (ignored on desktop) */
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  /** Drawer-only — scale the background when the drawer opens (ignored on desktop) */
  shouldScaleBackground?: boolean;
}

function ResponsiveModal({
  children,
  open,
  onOpenChange,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  shouldScaleBackground,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <ResponsiveModalContext.Provider value={{ isDrawer: false }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={{ isDrawer: true }}>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={setActiveSnapPoint}
        shouldScaleBackground={shouldScaleBackground}
      >
        {children}
      </Drawer>
    </ResponsiveModalContext.Provider>
  );
}
ResponsiveModal.displayName = "ResponsiveModal";

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const ResponsiveModalTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogTrigger>
>(({ ...props }, ref) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerTrigger ref={ref} {...props} />;
  }
  return <DialogTrigger ref={ref} {...props} />;
});
ResponsiveModalTrigger.displayName = "ResponsiveModalTrigger";

// ---------------------------------------------------------------------------
// Close
// ---------------------------------------------------------------------------

const ResponsiveModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof DialogClose>
>(({ ...props }, ref) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerClose ref={ref} {...props} />;
  }
  return <DialogClose ref={ref} {...props} />;
});
ResponsiveModalClose.displayName = "ResponsiveModalClose";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

interface ResponsiveModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Desktop only — hides the close (X) button */
  hideCloseButton?: boolean;
}

const ResponsiveModalContent = React.forwardRef<HTMLDivElement, ResponsiveModalContentProps>(
  ({ className, hideCloseButton, ...props }, ref) => {
    const { isDrawer } = useResponsiveModalContext();

    if (isDrawer) {
      return <DrawerContent ref={ref} className={cn(className)} {...props} />;
    }
    return (
      <DialogContent
        ref={ref}
        className={cn(className)}
        hideCloseButton={hideCloseButton}
        {...props}
      />
    );
  }
);
ResponsiveModalContent.displayName = "ResponsiveModalContent";

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const ResponsiveModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerHeader className={cn(className)} {...props} />;
  }
  return <DialogHeader className={cn(className)} {...props} />;
};
ResponsiveModalHeader.displayName = "ResponsiveModalHeader";

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const ResponsiveModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerFooter className={cn(className)} {...props} />;
  }
  return <DialogFooter className={cn(className)} {...props} />;
};
ResponsiveModalFooter.displayName = "ResponsiveModalFooter";

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

const ResponsiveModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerTitle ref={ref} className={cn(className)} {...props} />;
  }
  return <DialogTitle ref={ref} className={cn(className)} {...props} />;
});
ResponsiveModalTitle.displayName = "ResponsiveModalTitle";

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

const ResponsiveModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { isDrawer } = useResponsiveModalContext();

  if (isDrawer) {
    return <DrawerDescription ref={ref} className={cn(className)} {...props} />;
  }
  return <DialogDescription ref={ref} className={cn(className)} {...props} />;
});
ResponsiveModalDescription.displayName = "ResponsiveModalDescription";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
};
