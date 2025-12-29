/**
 * Navigation Configuration for Budget App
 *
 * Defines primary and secondary navigation sections for adaptive navigation
 * Used by BottomNav, NavRail, Sidebar, and MobileMenu components
 *
 * NOTE: label field contains translation keys (e.g., "nav.dashboard")
 * Components should use next-intl's useTranslations hook to translate these keys
 */

export interface NavigationSection {
  id: string;
  label: string; // Translation key (e.g., "nav.dashboard")
  icon: string;
  route: string;
}

/**
 * Primary Navigation Sections (4 items)
 * These are the main app features, shown prominently in all navigation variants
 */
export const PRIMARY_SECTIONS: NavigationSection[] = [
  {
    id: "dashboard",
    label: "nav.dashboard",
    icon: "LayoutDashboard",
    route: "/budget-app",
  },
  {
    id: "transactions",
    label: "nav.transactions",
    icon: "Receipt",
    route: "/budget-app/transactions",
  },
  {
    id: "budgets",
    label: "nav.budgets",
    icon: "PiggyBank",
    route: "/budget-app/budgets",
  },
  {
    id: "reports",
    label: "nav.reports",
    icon: "ChartBar",
    route: "/budget-app/reports",
  },
];

/**
 * Secondary Navigation Sections (8 items)
 * These are supporting features, shown in hamburger menu (mobile/tablet) or sidebar (desktop)
 */
export const SECONDARY_SECTIONS: NavigationSection[] = [
  {
    id: "accounts",
    label: "nav.accounts",
    icon: "Wallet",
    route: "/budget-app/accounts",
  },
  {
    id: "categories",
    label: "nav.categories",
    icon: "Tag",
    route: "/budget-app/categories",
  },
  {
    id: "goals",
    label: "nav.goals",
    icon: "Target",
    route: "/budget-app/goals",
  },
  {
    id: "import",
    label: "nav.import",
    icon: "Upload",
    route: "/budget-app/import",
  },
  {
    id: "export",
    label: "nav.export",
    icon: "Download",
    route: "/budget-app/export",
  },
  {
    id: "settings",
    label: "nav.settings",
    icon: "Settings",
    route: "/budget-app/settings",
  },
  {
    id: "help",
    label: "nav.help",
    icon: "HelpCircle",
    route: "/budget-app/help",
  },
  {
    id: "about",
    label: "nav.about",
    icon: "Info",
    route: "/budget-app/about",
  },
];

/**
 * Get all navigation sections (primary + secondary)
 */
export function getAllSections(): NavigationSection[] {
  return [...PRIMARY_SECTIONS, ...SECONDARY_SECTIONS];
}

/**
 * Find a navigation section by ID
 */
export function getSectionById(id: string): NavigationSection | undefined {
  return getAllSections().find((section) => section.id === id);
}

/**
 * Check if a route matches a navigation section
 */
export function isRouteActive(currentRoute: string, sectionRoute: string): boolean {
  if (sectionRoute === "/budget-app") {
    return currentRoute === sectionRoute;
  }
  return currentRoute.startsWith(sectionRoute);
}
