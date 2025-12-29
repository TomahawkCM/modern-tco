/**
 * Navigation Configuration for Budget App
 *
 * Defines primary and secondary navigation sections for adaptive navigation
 * Used by BottomNav, NavRail, Sidebar, and MobileMenu components
 */

export interface NavigationSection {
  id: string;
  label: string;
  icon: string;
  route: string;
}

/**
 * Primary Navigation Sections (4 items)
 * These are the main app features, shown prominently in all navigation variants
 */
export const PRIMARY_SECTIONS: NavigationSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/budget-app',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'Receipt',
    route: '/budget-app/transactions',
  },
  {
    id: 'budgets',
    label: 'Budgets',
    icon: 'PiggyBank',
    route: '/budget-app/budgets',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'ChartBar',
    route: '/budget-app/reports',
  },
];

/**
 * Secondary Navigation Sections (8 items)
 * These are supporting features, shown in hamburger menu (mobile/tablet) or sidebar (desktop)
 */
export const SECONDARY_SECTIONS: NavigationSection[] = [
  {
    id: 'accounts',
    label: 'Accounts',
    icon: 'Wallet',
    route: '/budget-app/accounts',
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: 'Tag',
    route: '/budget-app/categories',
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: 'Target',
    route: '/budget-app/goals',
  },
  {
    id: 'import',
    label: 'Import',
    icon: 'Upload',
    route: '/budget-app/import',
  },
  {
    id: 'export',
    label: 'Export',
    icon: 'Download',
    route: '/budget-app/export',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/budget-app/settings',
  },
  {
    id: 'help',
    label: 'Help',
    icon: 'HelpCircle',
    route: '/budget-app/help',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'Info',
    route: '/budget-app/about',
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
  if (sectionRoute === '/budget-app') {
    return currentRoute === sectionRoute;
  }
  return currentRoute.startsWith(sectionRoute);
}
