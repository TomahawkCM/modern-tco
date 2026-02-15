import { PrivacyProvider, usePrivacy } from "@/contexts/PrivacyContext";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

// Test component that exposes context values
function TestConsumer() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  return (
    <div>
      <span data-testid="privacy-status">{isPrivacyMode ? "on" : "off"}</span>
      <button data-testid="toggle-btn" onClick={togglePrivacyMode}>
        Toggle
      </button>
    </div>
  );
}

describe("PrivacyContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to privacy mode OFF", () => {
    render(
      <PrivacyProvider>
        <TestConsumer />
      </PrivacyProvider>
    );

    expect(screen.getByTestId("privacy-status").textContent).toBe("off");
  });

  it("toggle switches privacy mode ON", () => {
    render(
      <PrivacyProvider>
        <TestConsumer />
      </PrivacyProvider>
    );

    expect(screen.getByTestId("privacy-status").textContent).toBe("off");

    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("privacy-status").textContent).toBe("on");
  });

  it("persists to localStorage", () => {
    render(
      <PrivacyProvider>
        <TestConsumer />
      </PrivacyProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(localStorage.getItem("budget-privacy-mode")).toBe("true");
  });

  it("throws error when usePrivacy is used outside PrivacyProvider", () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("usePrivacy must be used within a PrivacyProvider");

    consoleSpy.mockRestore();
  });

  it("loads persisted value from localStorage on mount", () => {
    localStorage.setItem("budget-privacy-mode", "true");

    render(
      <PrivacyProvider>
        <TestConsumer />
      </PrivacyProvider>
    );

    expect(screen.getByTestId("privacy-status").textContent).toBe("on");
  });
});
