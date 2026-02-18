import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: Map<string, (e: MediaQueryListEvent) => void>;
  /** Stores the mock object returned for each query so we can assert on the same instance */
  let mediaQueryInstances: Map<string, ReturnType<typeof window.matchMedia>>;

  beforeEach(() => {
    listeners = new Map();
    mediaQueryInstances = new Map();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        // Return the same instance for repeated calls with the same query
        const existing = mediaQueryInstances.get(query);
        if (existing) return existing;

        const instance = {
          matches: query === "(min-width: 768px)", // desktop by default
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
            listeners.set(query, handler);
          }),
          removeEventListener: vi.fn(
            (_event: string, _handler: (e: MediaQueryListEvent) => void) => {
              listeners.delete(query);
            }
          ),
          dispatchEvent: vi.fn(),
        };
        mediaQueryInstances.set(query, instance as unknown as MediaQueryList);
        return instance;
      }),
    });
  });

  it("returns the current match state", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false for non-matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1200px)"));
    expect(result.current).toBe(false);
  });

  it("updates when media query changes", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);

    // Simulate viewport shrinking below 768px
    act(() => {
      const handler = listeners.get("(min-width: 768px)");
      handler?.({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    unmount();

    const matchMediaMock = window.matchMedia("(min-width: 768px)");
    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("re-subscribes when query changes", () => {
    const { rerender } = renderHook(({ query }: { query: string }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 768px)" },
    });

    rerender({ query: "(min-width: 1024px)" });

    // Should have subscribed to the new query
    expect(listeners.has("(min-width: 1024px)")).toBe(true);
  });
});
