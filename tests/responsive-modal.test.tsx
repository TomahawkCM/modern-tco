import { render, screen, renderHook, fireEvent } from "@testing-library/react";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
  useResponsiveModalContext,
} from "@/components/ui/responsive-modal";

// ---------------------------------------------------------------------------
// matchMedia mock helper
// ---------------------------------------------------------------------------

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ResponsiveModal", () => {
  describe("on desktop (min-width: 768px matches)", () => {
    beforeEach(() => mockMatchMedia(true));

    it("renders Dialog variant when open", () => {
      render(
        <ResponsiveModal open onOpenChange={() => {}}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Test Title</ResponsiveModalTitle>
              <ResponsiveModalDescription>Test description</ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <p>Body content</p>
            <ResponsiveModalFooter>
              <ResponsiveModalClose>Close</ResponsiveModalClose>
            </ResponsiveModalFooter>
          </ResponsiveModalContent>
        </ResponsiveModal>
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
      expect(screen.getByText("Body content")).toBeInTheDocument();
    });

    it("renders trigger that opens the dialog", () => {
      const onOpenChange = vi.fn();

      render(
        <ResponsiveModal onOpenChange={onOpenChange}>
          <ResponsiveModalTrigger asChild>
            <button>Open</button>
          </ResponsiveModalTrigger>
          <ResponsiveModalContent>
            <ResponsiveModalTitle>Dialog</ResponsiveModalTitle>
          </ResponsiveModalContent>
        </ResponsiveModal>
      );

      fireEvent.click(screen.getByText("Open"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("on mobile (min-width: 768px does not match)", () => {
    beforeEach(() => mockMatchMedia(false));

    it("renders Drawer variant when open", () => {
      render(
        <ResponsiveModal open onOpenChange={() => {}}>
          <ResponsiveModalContent>
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Mobile Title</ResponsiveModalTitle>
              <ResponsiveModalDescription>Mobile description</ResponsiveModalDescription>
            </ResponsiveModalHeader>
          </ResponsiveModalContent>
        </ResponsiveModal>
      );

      expect(screen.getByText("Mobile Title")).toBeInTheDocument();
      expect(screen.getByText("Mobile description")).toBeInTheDocument();
    });
  });

  describe("useResponsiveModalContext", () => {
    it("returns isDrawer: false on desktop", () => {
      mockMatchMedia(true);

      const { result } = renderHook(() => useResponsiveModalContext(), {
        wrapper: ({ children }) => (
          <ResponsiveModal open onOpenChange={() => {}}>
            {children}
          </ResponsiveModal>
        ),
      });

      expect(result.current.isDrawer).toBe(false);
    });

    it("returns isDrawer: true on mobile", () => {
      mockMatchMedia(false);

      const { result } = renderHook(() => useResponsiveModalContext(), {
        wrapper: ({ children }) => (
          <ResponsiveModal open onOpenChange={() => {}}>
            {children}
          </ResponsiveModal>
        ),
      });

      expect(result.current.isDrawer).toBe(true);
    });

    it("throws when used outside ResponsiveModal", () => {
      // Suppress console.error for the expected error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useResponsiveModalContext());
      }).toThrow("useResponsiveModalContext must be used within <ResponsiveModal>");

      consoleSpy.mockRestore();
    });
  });
});
