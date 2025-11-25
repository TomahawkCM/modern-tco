import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
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
        // Archon cyberpunk color scheme - Updated to archon.png blue palette
        // Use sparingly - prefer semantic tokens (bg-background, text-foreground, etc.)
        archon: {
          // Background gradients - deep dark neutrals and blue-grays
          "bg-start": "#0a0a0a", // Matches updated --background
          "bg-end": "#1a1f2e", // Blue-gray gradient end
          "bg-card": "#1a1f2e", // Matches updated --card (blue-gray)
          "bg-panel": "#181d28", // Matches --muted

          // Primary standard blue accents (replaces electric cyan)
          "blue-primary": "#3b82f6", // Matches updated --primary (Tailwind blue-500)
          "blue-bright": "#60a5fa", // Lighter blue for hover states
          "blue-hover": "#2563eb", // Darker blue for hover states (blue-600)
          "blue-electric": "#3b82f6", // Consistent with primary

          // New accent colors from archon.png
          "orange-stats": "#f97316", // Orange for stats/numbers (Tailwind orange-500)
          "green-status": "#22c55e", // Green for Active/success (Tailwind green-500)

          // Secondary purple/violet highlights (unchanged)
          "purple-primary": "#8b5cf6", // Matches --accent
          "purple-secondary": "#a78bfa", // Lighter variant
          "purple-hover": "#7c3aed", // Darker for hover states

          // Text colors - MAP TO SEMANTIC TOKENS
          "text-primary": "#fafafa", // Matches --foreground
          "text-secondary": "#d4d4d8", // 85% opacity equivalent
          "text-muted": "#a6a6a6", // Matches --muted-foreground
          "text-accent": "#3b82f6", // Matches updated --primary

          // Border and accent colors
          border: "#292f3d", // Matches updated --border (blue-gray)
          "border-bright": "rgba(59, 130, 246, 0.3)", // Blue primary with transparency
          glass: "rgba(255, 255, 255, 0.05)", // Glass morphism effect
        },
        tanium: {
          primary: "#1a365d",
          secondary: "#2d3748",
          accent: "#3182ce",
          success: "#38a169",
          warning: "#d69e2e",
          error: "#e53e3e",
          dark: "#1a202c",
          light: "#f7fafc",
        },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "typing-bounce": {
          "0%, 60%, 100%": {
            transform: "translateY(0)",
            opacity: "0.7",
          },
          "30%": {
            transform: "translateY(-10px)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "typing-bounce": "typing-bounce 1.4s infinite ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
        "tanium-gradient": "linear-gradient(135deg, #1a365d, #3182ce)",
        // Archon cyberpunk gradients - Updated to archon.png blue palette
        "archon-bg": "linear-gradient(135deg, #0a0a0a 0%, #1a1f2e 100%)",
        "archon-card": "linear-gradient(135deg, #1a1f2e 0%, #181d28 100%)",
        "archon-glass":
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))",
        "archon-button": "linear-gradient(135deg, #3b82f6, #2563eb)",
        "archon-accent": "linear-gradient(135deg, #8b5cf6, #a78bfa)",

        // Budget App Modern Gradients
        "budget-dark": "linear-gradient(to bottom right, #0f172a, #1e293b)",
        "budget-card":
          "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        "budget-accent": "linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)", // Teal to Sky Blue
        "budget-income": "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", // Green
        "budget-expense": "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", // Red
        "budget-mesh":
          "radial-gradient(at 0% 0%, rgba(45, 212, 191, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
