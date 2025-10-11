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
      colors: {
        // Archon cyberpunk color scheme - Updated to archon.png blue palette
        // Use sparingly - prefer semantic tokens (bg-background, text-foreground, etc.)
        archon: {
          // Background gradients - deep dark neutrals and blue-grays
          'bg-start': '#0a0a0a', // Matches updated --background
          'bg-end': '#1a1f2e', // Blue-gray gradient end
          'bg-card': '#1a1f2e', // Matches updated --card (blue-gray)
          'bg-panel': '#181d28', // Matches --muted

          // Primary standard blue accents (replaces electric cyan)
          'blue-primary': '#3b82f6', // Matches updated --primary (Tailwind blue-500)
          'blue-bright': '#60a5fa', // Lighter blue for hover states
          'blue-hover': '#2563eb', // Darker blue for hover states (blue-600)
          'blue-electric': '#3b82f6', // Consistent with primary

          // New accent colors from archon.png
          'orange-stats': '#f97316', // Orange for stats/numbers (Tailwind orange-500)
          'green-status': '#22c55e', // Green for Active/success (Tailwind green-500)

          // Secondary purple/violet highlights (unchanged)
          'purple-primary': '#8b5cf6', // Matches --accent
          'purple-secondary': '#a78bfa', // Lighter variant
          'purple-hover': '#7c3aed', // Darker for hover states

          // Text colors - MAP TO SEMANTIC TOKENS
          'text-primary': '#fafafa', // Matches --foreground
          'text-secondary': '#d4d4d8', // 85% opacity equivalent
          'text-muted': '#a6a6a6', // Matches --muted-foreground
          'text-accent': '#3b82f6', // Matches updated --primary

          // Border and accent colors
          'border': '#292f3d', // Matches updated --border (blue-gray)
          'border-bright': 'rgba(59, 130, 246, 0.3)', // Blue primary with transparency
          'glass': 'rgba(255, 255, 255, 0.05)', // Glass morphism effect
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
        "archon-glass": "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))",
        "archon-button": "linear-gradient(135deg, #3b82f6, #2563eb)",
        "archon-accent": "linear-gradient(135deg, #8b5cf6, #a78bfa)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
