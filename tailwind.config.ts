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
        // Archon cyberpunk color scheme
        archon: {
          // Background gradients - deep dark blues/blacks
          'bg-start': '#0a0a0f',
          'bg-end': '#1a1a2e',
          'bg-card': 'rgba(26, 26, 46, 0.8)',
          'bg-panel': 'rgba(16, 16, 24, 0.9)',
          
          // Primary electric cyan/blue accents
          'cyan-bright': '#00d4ff',
          'cyan-primary': '#0ea5e9',
          'cyan-hover': '#0284c7',
          'blue-electric': '#3b82f6',
          
          // Secondary purple/violet highlights
          'purple-primary': '#8b5cf6',
          'purple-secondary': '#a855f7',
          'purple-hover': '#7c3aed',
          
          // Text colors
          'text-primary': '#ffffff',
          'text-secondary': 'rgba(255, 255, 255, 0.8)',
          'text-muted': 'rgba(255, 255, 255, 0.6)',
          'text-accent': '#00d4ff',
          
          // Border and accent colors
          'border': 'rgba(255, 255, 255, 0.1)',
          'border-bright': 'rgba(0, 212, 255, 0.3)',
          'glass': 'rgba(255, 255, 255, 0.05)',
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
        // Archon cyberpunk gradients
        "archon-bg": "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
        "archon-card": "linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(16, 16, 24, 0.9))",
        "archon-glass": "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.05))",
        "archon-button": "linear-gradient(135deg, #00d4ff, #0ea5e9)",
        "archon-accent": "linear-gradient(135deg, #8b5cf6, #a855f7)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
