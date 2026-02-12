import { FinancialValue } from "@/components/budget/FinancialValue";
import { PrivacyProvider, usePrivacy } from "@/contexts/PrivacyContext";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";

// Helper to render with PrivacyProvider
function renderWithPrivacy(ui: React.ReactElement) {
  return render(<PrivacyProvider>{ui}</PrivacyProvider>);
}

// Helper component that enables privacy mode before rendering FinancialValue
function PrivacyEnabledWrapper({ children }: { children: React.ReactNode }) {
  const { setPrivacyMode } = usePrivacy();
  // Enable privacy on first render
  React.useEffect(() => {
    setPrivacyMode(true);
  }, [setPrivacyMode]);
  return <>{children}</>;
}

import React from "react";

describe("FinancialValue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows clear text when privacy mode is off", () => {
    renderWithPrivacy(
      <FinancialValue>
        <span data-testid="amount">$1,234.56</span>
      </FinancialValue>
    );

    const amount = screen.getByTestId("amount");
    expect(amount).toBeVisible();
    expect(amount.textContent).toBe("$1,234.56");

    // The wrapper span should NOT have blur-md class
    const wrapper = amount.parentElement;
    expect(wrapper).not.toHaveClass("blur-md");
  });

  it("shows blurred text when privacy mode is on", () => {
    // Pre-set localStorage so privacy mode is on from the start
    localStorage.setItem("budget-privacy-mode", "true");

    render(
      <PrivacyProvider>
        <FinancialValue data-testid="wrapper">
          <span data-testid="amount">$1,234.56</span>
        </FinancialValue>
      </PrivacyProvider>
    );

    const amount = screen.getByTestId("amount");
    const wrapper = amount.parentElement;
    expect(wrapper).toHaveClass("blur-md");
    expect(wrapper).toHaveClass("select-none");
  });

  it("sets aria-hidden=true when blurred", () => {
    localStorage.setItem("budget-privacy-mode", "true");

    render(
      <PrivacyProvider>
        <FinancialValue>
          <span data-testid="amount">$1,234.56</span>
        </FinancialValue>
      </PrivacyProvider>
    );

    const amount = screen.getByTestId("amount");
    const wrapper = amount.parentElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("does not set aria-hidden when privacy mode is off", () => {
    renderWithPrivacy(
      <FinancialValue>
        <span data-testid="amount">$1,234.56</span>
      </FinancialValue>
    );

    const amount = screen.getByTestId("amount");
    const wrapper = amount.parentElement;
    expect(wrapper).not.toHaveAttribute("aria-hidden");
  });

  it("renders with custom element type via 'as' prop", () => {
    renderWithPrivacy(
      <FinancialValue as="div">
        <span data-testid="amount">$1,234.56</span>
      </FinancialValue>
    );

    const amount = screen.getByTestId("amount");
    expect(amount.parentElement?.tagName).toBe("DIV");
  });

  it("applies custom className", () => {
    renderWithPrivacy(
      <FinancialValue className="text-green-500">
        <span data-testid="amount">$1,234.56</span>
      </FinancialValue>
    );

    const amount = screen.getByTestId("amount");
    const wrapper = amount.parentElement;
    expect(wrapper).toHaveClass("text-green-500");
  });
});
