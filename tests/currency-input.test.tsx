import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyInput } from "@/components/ui/currency-input";

// Mock next-intl useLocale
vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
}));

describe("CurrencyInput", () => {
  it("renders with USD currency symbol by default", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders with EUR currency symbol", () => {
    render(<CurrencyInput value={0} onChange={() => {}} currency="EUR" />);
    expect(screen.getByText("€")).toBeInTheDocument();
  });

  it("renders with JPY currency symbol", () => {
    render(<CurrencyInput value={0} onChange={() => {}} currency="JPY" locale="ja-JP" />);
    // Intl.NumberFormat may produce full-width ¥ (U+FFE5) or half-width ¥ (U+00A5)
    const symbol = screen.getByText((text) => text === "¥" || text === "￥");
    expect(symbol).toBeInTheDocument();
  });

  it("formats value on blur", () => {
    render(<CurrencyInput value={1234.56} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    // When not focused, display is formatted
    expect(input).toHaveValue("1,234.56");
  });

  it("shows raw value on focus", () => {
    render(<CurrencyInput value={1234.56} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    expect(input).toHaveValue("1234.56");
  });

  it("calls onChange with parsed numeric value", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "42.50" } });
    expect(onChange).toHaveBeenCalledWith(42.5);
  });

  it("respects min constraint", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} min={10} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("respects max constraint", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} max={100} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "150" } });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("blocks negative input when allowNegative is false (default)", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "-50" } });
    // onChange should not be called because negative is blocked
    expect(onChange).not.toHaveBeenCalled();
  });

  it("allows negative input when allowNegative is true", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} allowNegative />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "-50" } });
    expect(onChange).toHaveBeenCalledWith(-50);
  });

  it("hides currency symbol when showCurrency is false", () => {
    render(<CurrencyInput value={100} onChange={() => {}} showCurrency={false} />);
    expect(screen.queryByText("$")).not.toBeInTheDocument();
  });

  it('renders error message with role="alert"', () => {
    render(<CurrencyInput value={0} onChange={() => {}} error="Amount is required" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Amount is required");
  });

  it("renders label when provided", () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Amount" />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders helper text when provided and no error", () => {
    render(<CurrencyInput value={0} onChange={() => {}} helperText="Enter the total" />);
    expect(screen.getByText("Enter the total")).toBeInTheDocument();
  });

  it("hides helper text when error is present", () => {
    render(
      <CurrencyInput value={0} onChange={() => {}} helperText="Enter the total" error="Required" />
    );
    expect(screen.queryByText("Enter the total")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<CurrencyInput value={0} onChange={() => {}} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-invalid when error is present", () => {
    render(<CurrencyInput value={0} onChange={() => {}} error="Bad" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("rounds to zero decimals for zero-decimal currencies (JPY)", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} currency="JPY" locale="ja-JP" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1234" } });
    expect(onChange).toHaveBeenCalledWith(1234);
  });

  it("shows required indicator when required and label provided", () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Amount" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
