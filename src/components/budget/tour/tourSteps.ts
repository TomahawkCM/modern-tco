/**
 * Guided Tour Steps Configuration
 * Defines the spotlight tour steps for the Budget App using Driver.js
 */

import type { DriveStep } from "driver.js";

/**
 * Tour steps that highlight actual app UI elements
 * Each step spotlights a specific feature and explains its purpose
 */
export const TOUR_STEPS: DriveStep[] = [
  {
    element: "#sidebar-nav",
    popover: {
      title: "Navigation",
      description:
        "Access Transactions, Budgets, Reports, and more from the sidebar. Each section helps you manage a different aspect of your finances.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#dashboard-widgets",
    popover: {
      title: "Your Dashboard",
      description:
        "See your financial overview at a glance. These widgets show spending trends, budget progress, and account balances.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#sidebar-transactions",
    popover: {
      title: "Transactions",
      description:
        "View, add, and categorize all your transactions. Import from your bank or add manually.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#sidebar-budgets",
    popover: {
      title: "Budgets",
      description:
        "Create and track spending budgets by category. Set limits and get alerts when you're close.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#accessibility-toggle",
    popover: {
      title: "Accessibility Options",
      description:
        "Quick access to viewing preferences. Increase font size, enable high contrast, or reduce motion effects.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "#sidebar-settings",
    popover: {
      title: "Settings",
      description:
        "Customize your experience. Configure encryption, manage data, and set up preferences.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#chatbot-button",
    popover: {
      title: "AI Assistant",
      description:
        "Get help anytime! Ask questions about budgeting, get spending insights, or learn how to use features.",
      side: "left",
      align: "end",
    },
  },
];

/**
 * Mobile-optimized tour steps (fewer steps, larger targets)
 */
export const MOBILE_TOUR_STEPS: DriveStep[] = [
  {
    element: "#mobile-nav",
    popover: {
      title: "Navigation",
      description:
        "Tap here to access all sections: Dashboard, Transactions, Budgets, and Reports.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#dashboard-widgets",
    popover: {
      title: "Your Dashboard",
      description: "Your financial overview. Swipe to see more widgets.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#chatbot-button",
    popover: {
      title: "AI Assistant",
      description: "Need help? Tap here to chat with our AI assistant.",
      side: "left",
      align: "end",
    },
  },
];
