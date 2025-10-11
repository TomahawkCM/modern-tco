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
        // Archon cyberpunk color scheme - Aligned with shadcn semantic tokens
        // Use sparingly - prefer semantic tokens (bg-background, text-foreground, etc.)
        archon: {
          // Background gradients - deep dark blues/blacks
          'bg-start': '#09090c', // Matches --background
          'bg-end': '#1a1a20', // Slightly lighter for gradients
          'bg-card': '#121216', // Matches --card
          'bg-panel': '#1a1a20', // Matches --muted

          // Primary electric cyan/blue accents
          'cyan-bright': '#1adfff', // Matches updated --primary
          'cyan-primary': '#66e6ff', // Matches --secondary-foreground
          'cyan-hover': '#0dcbf0', // Slightly darker for hover states
          'blue-electric': '#5badff', // Adjusted for better contrast

          // Secondary purple/violet highlights
          'purple-primary': '#8b5cf6', // Matches --accent
          'purple-secondary': '#a78bfa', // Lighter variant
          'purple-hover': '#7c3aed', // Darker for hover states

          // Text colors - MAP TO SEMANTIC TOKENS
          'text-primary': '#fafafa', // Matches --foreground
          'text-secondary': '#d4d4d8', // 85% opacity equivalent
          'text-muted': '#a6a6a6', // Matches --muted-foreground
          'text-accent': '#1adfff', // Matches --primary

          // Border and accent colors
          'border': '#28282f', // Matches --border
          'border-bright': 'rgba(26, 223, 255, 0.3)', // Primary with transparency
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
        // Archon cyberpunk gradients - Updated for better contrast
        "archon-bg": "linear-gradient(135deg, #09090c 0%, #1a1a20 100%)",
        "archon-card": "linear-gradient(135deg, #121216 0%, #1a1a20 100%)",
        "archon-glass": "linear-gradient(135deg, rgba(26, 223, 255, 0.1), rgba(139, 92, 246, 0.05))",
        "archon-button": "linear-gradient(135deg, #1adfff, #0dcbf0)",
        "archon-accent": "linear-gradient(135deg, #8b5cf6, #a78bfa)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
