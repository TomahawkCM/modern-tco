import { TCODomain } from "@/types/exam";

/**
 * Mapping from TCODomain enum values to study route URL slugs
 * Used for navigation from modules page to study content
 */
export const DOMAIN_TO_ROUTE_SLUG: Record<TCODomain, string> = {
  [TCODomain.ASKING_QUESTIONS]: "asking-questions",
  [TCODomain.REFINING_QUESTIONS]: "refining-questions",
  [TCODomain.REFINING_TARGETING]: "refining-questions", // Alias maps to same route
  [TCODomain.TAKING_ACTION]: "taking-action",
  [TCODomain.NAVIGATION_MODULES]: "navigation-modules",
  [TCODomain.REPORTING_EXPORT]: "reporting-export",
  // Additional domains with appropriate route mappings
  [TCODomain.SECURITY]: "security",
  [TCODomain.FUNDAMENTALS]: "fundamentals",
  [TCODomain.TROUBLESHOOTING]: "troubleshooting",
};

/**
 * Get the URL slug for a TCO domain to use in study routes
 * @param domain - The TCODomain enum value
 * @returns The corresponding URL slug for the study route
 */
export const getDomainRouteSlug = (domain: TCODomain): string => {
  return DOMAIN_TO_ROUTE_SLUG[domain] || "asking-questions"; // fallback to asking-questions
};
