import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    // Background gradients used in budget app
    "bg-slate-950",
    "bg-slate-900",
    "from-slate-900",
    "via-slate-950",
    "to-black",
    "bg-teal-500/10",
    "bg-blue-600/10",
    "blur-[120px]",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    screens: {
      xs: "320px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1440px",
    },
    extend: {
      fontSize: {
        // Seniors-friendly typography scale (18px base)
        xs: ["0.875rem", { lineHeight: "1.25" }], // 14px
        sm: ["1rem", { lineHeight: "1.5" }], // 16px
        base: ["1.125rem", { lineHeight: "1.5" }], // 18px (NEW - up from 16px)
        lg: ["1.25rem", { lineHeight: "1.5" }], // 20px
        xl: ["1.5rem", { lineHeight: "1.5" }], // 24px
        "2xl": ["1.875rem", { lineHeight: "1.25" }], // 30px
        "3xl": ["2.25rem", { lineHeight: "1.25" }], // 36px
        "4xl": ["3rem", { lineHeight: "1.125" }], // 48px
      },
      lineHeight: {
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.75",
        loose: "2",
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      spacing: {
        "page-x": "var(--spacing-page-x)",
        "page-y": "var(--spacing-page-y)",
        section: "var(--spacing-section)",
        subsection: "var(--spacing-subsection)",
        card: "var(--spacing-card-padding)",
        "card-gap": "var(--spacing-card-gap)",
        touch: "var(--spacing-touch-target)",
        "18": "4.5rem", // 72px — icon sidebar width
      },
      minHeight: {
        touch: "44px",
        "touch-comfortable": "48px",
        "touch-seniors": "56px",
      },
      minWidth: {
        touch: "44px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        focus: "var(--shadow-focus)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },
      transitionTimingFunction: {
        default: "var(--easing-default)",
        emphasized: "var(--easing-emphasized)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
        bounce: "var(--easing-bounce)",
      },
      colors: {
        // Budget App Modern Color System
        // Primary Accent: Teal (#14b8a6)
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6", // Primary Brand Color
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Semantic Colors
        success: {
          DEFAULT: "#10b981", // green-500
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // yellow-500
          foreground: "#ffffff",
        },
        error: {
          DEFAULT: "#ef4444", // red-500
          foreground: "#ffffff",
        },

        // Shadcn/UI System Tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        shake: "shake 0.3s ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-rtl")],
};

export default config;
