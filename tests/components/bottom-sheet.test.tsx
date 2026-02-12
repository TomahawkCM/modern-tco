import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "@/components/budget/ui/BottomSheet";

// Mock useDeviceClass to control mobile vs desktop behavior
const mockUseDeviceClass = vi.fn<() => "phone" | "tablet" | "desktop" | null>();
vi.mock("@/lib/breakpoints", () => ({
  useDeviceClass: () => mockUseDeviceClass(),
}));

// Mock framer-motion to avoid drag complexity in unit tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
      // Strip framer-motion-specific props before passing to DOM
      const {
        drag,
        dragConstraints,
        dragElastic,
        onDragEnd,
        ...htmlProps
      } = props;
      return <div data-testid="motion-div" {...htmlProps}>{children}</div>;
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

    // The Sheet component renders a close button (the Cross2Icon) with sr-only "Close" text
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
