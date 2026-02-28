import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "@/components/budget/ui/BottomSheet";

// Mock next-intl useTranslations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock useDeviceClass to control mobile vs desktop behavior
const mockUseDeviceClass = vi.fn<() => "phone" | "tablet" | "desktop" | null>();
vi.mock("@/lib/breakpoints", () => ({
  useDeviceClass: () => mockUseDeviceClass(),
}));

// Mock @radix-ui/react-dialog to avoid portal/animation issues in jsdom
// We use a context to thread onOpenChange from Root down to Close.
vi.mock("@radix-ui/react-dialog", () => {
  const React = require("react");
  const DialogCtx = React.createContext<((open: boolean) => void) | null>(null);

  return {
    Root: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open: boolean;
      onOpenChange?: (open: boolean) => void;
    }) =>
      open
        ? React.createElement(
            DialogCtx.Provider,
            { value: onOpenChange || null },
            React.createElement("div", { "data-testid": "sheet-root" }, children)
          )
        : null,
    Portal: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "sheet-portal" }, children),
    Overlay: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement("div", { ref, ...props }, children)
    ),
    Content: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement("div", { ref, role: "dialog", ...props }, children)
    ),
    Close: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const onOpenChange = React.useContext(DialogCtx);
      return React.createElement(
        "button",
        {
          ref,
          type: "button",
          ...props,
          onClick: (e: any) => {
            props.onClick?.(e);
            onOpenChange?.(false);
          },
        },
        children
      );
    }),
    Title: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement("h2", { ref, ...props }, children)
    ),
    Description: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement("p", { ref, ...props }, children)
    ),
    Trigger: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement("button", { ref, ...props }, children)
    ),
  };
});

// Mock framer-motion to avoid drag complexity in unit tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
      // Strip framer-motion-specific props before passing to DOM
      const { drag, dragConstraints, dragElastic, onDragEnd, ...htmlProps } = props;
      return (
        <div data-testid="motion-div" {...htmlProps}>
          {children}
        </div>
      );
    },
  },
}));

describe("BottomSheet", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Test Sheet Title",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceClass.mockReturnValue("phone");
  });

  it("renders with title text", () => {
    render(
      <BottomSheet {...defaultProps}>
        <p>Sheet content</p>
      </BottomSheet>
    );

    expect(screen.getByText("Test Sheet Title")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when Sheet triggers close", () => {
    const onOpenChange = vi.fn();

    render(
      <BottomSheet {...defaultProps} onOpenChange={onOpenChange}>
        <p>Content</p>
      </BottomSheet>
    );

    // The Sheet component renders a close button with sr-only "Close" text
    const closeButton = screen.getByRole("button", { name: /close/i });
    closeButton.click();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders drag handle when showDragHandle is true (default)", () => {
    render(
      <BottomSheet {...defaultProps}>
        <p>Content</p>
      </BottomSheet>
    );

    expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
  });

  it("does not render drag handle when showDragHandle is false", () => {
    render(
      <BottomSheet {...defaultProps} showDragHandle={false}>
        <p>Content</p>
      </BottomSheet>
    );

    expect(screen.queryByTestId("drag-handle")).not.toBeInTheDocument();
  });

  it("renders children inside the sheet", () => {
    render(
      <BottomSheet {...defaultProps}>
        <p>Child content here</p>
      </BottomSheet>
    );

    expect(screen.getByText("Child content here")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <BottomSheet {...defaultProps} description="A helpful description">
        <p>Content</p>
      </BottomSheet>
    );

    expect(screen.getByText("A helpful description")).toBeInTheDocument();
  });

  it("does not render drag handle on desktop", () => {
    mockUseDeviceClass.mockReturnValue("desktop");

    render(
      <BottomSheet {...defaultProps}>
        <p>Content</p>
      </BottomSheet>
    );

    expect(screen.queryByTestId("drag-handle")).not.toBeInTheDocument();
  });

  it("does not render drag handle on tablet", () => {
    mockUseDeviceClass.mockReturnValue("tablet");

    render(
      <BottomSheet {...defaultProps}>
        <p>Content</p>
      </BottomSheet>
    );

    expect(screen.queryByTestId("drag-handle")).not.toBeInTheDocument();
  });
});
