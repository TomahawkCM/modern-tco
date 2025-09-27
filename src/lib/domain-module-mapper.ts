/**
 * Central Domain-Module Mapping Utility
 * Unified mapping system for cross-linking domains and modules
 */

import { TCODomain } from "@/types/exam";

// Domain slug to module slug mapping
export const DOMAIN_TO_MODULES: Record<string, string[]> = {
  "asking-questions": ["asking-questions"],
  "refining-questions-targeting": ["refining-questions-targeting"],
  "taking-action-packages-actions": ["taking-action-packages-actions"],
  "navigation-basic-modules": ["navigation-basic-modules"],
  "reporting-data-export": ["reporting-data-export"],
};

// Module slug to domain slug mapping (reverse lookup)
export const MODULE_TO_DOMAIN: Record<string, string> = {
  "asking-questions": "asking-questions",
  "refining-questions-targeting": "refining-questions-targeting",
  "taking-action-packages-actions": "taking-action-packages-actions",
  "navigation-basic-modules": "navigation-basic-modules",
  "reporting-data-export": "reporting-data-export",
};

// Domain enum to slug mapping
export const DOMAIN_ENUM_TO_SLUG: Record<string, string> = {
  ASKING_QUESTIONS: "asking-questions",
  REFINING_QUESTIONS: "refining-questions-targeting",
  TAKING_ACTION: "taking-action-packages-actions",
  NAVIGATION_MODULES: "navigation-basic-modules",
  REPORTING_EXPORT: "reporting-data-export",
};

// Domain slug to enum mapping (reverse)
export const DOMAIN_SLUG_TO_ENUM: Record<string, string> = {
  "asking-questions": "ASKING_QUESTIONS",
  "refining-questions-targeting": "REFINING_QUESTIONS",
  "taking-action-packages-actions": "TAKING_ACTION",
  "navigation-basic-modules": "NAVIGATION_MODULES",
  "reporting-data-export": "REPORTING_EXPORT",
};

// Domain display names
export const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  "asking-questions": "Asking Questions",
  "refining-questions-targeting": "Refining Questions & Targeting",
  "taking-action-packages-actions": "Taking Action",
  "navigation-basic-modules": "Navigation & Basic Modules",
  "reporting-data-export": "Reporting & Data Export",
};

// Domain route slugs (for existing domain pages)
export const DOMAIN_ROUTE_SLUGS: Record<string, string> = {
  "asking-questions": "domain1-asking-questions",
  "refining-questions-targeting": "domain2-refining-questions",
  "taking-action-packages-actions": "domain3-taking-action",
  "navigation-basic-modules": "domain4-navigation-modules",
  "reporting-data-export": "domain5-reporting-data-export",
};

// Utility functions
export function getModulesForDomain(domainSlug: string): string[] {
  return DOMAIN_TO_MODULES[domainSlug] || [];
}

export function getDomainForModule(moduleSlug: string): string | null {
  return MODULE_TO_DOMAIN[moduleSlug] || null;
}

export function getDomainDisplayName(domainSlug: string): string {
  return DOMAIN_DISPLAY_NAMES[domainSlug] || domainSlug;
}

export function getDomainRouteSlug(domainSlug: string): string {
  return DOMAIN_ROUTE_SLUGS[domainSlug] || domainSlug;
}

export function getDomainEnum(domainSlug: string): string | null {
  return DOMAIN_SLUG_TO_ENUM[domainSlug] || null;
}

export function getDomainSlugFromEnum(domainEnum: string): string | null {
  return DOMAIN_ENUM_TO_SLUG[domainEnum] || null;
}

// Validation functions
export function isValidDomainSlug(slug: string): boolean {
  return Object.keys(DOMAIN_TO_MODULES).includes(slug);
}

export function isValidModuleSlug(slug: string): boolean {
  return Object.keys(MODULE_TO_DOMAIN).includes(slug);
}

// Get all available domains
export function getAllDomains(): string[] {
  return Object.keys(DOMAIN_TO_MODULES);
}

// Get all available modules
export function getAllModules(): string[] {
  return Object.keys(MODULE_TO_DOMAIN);
}

// Cross-reference validation
export function validateDomainModuleMapping(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check that every domain has valid modules
  for (const [domain, modules] of Object.entries(DOMAIN_TO_MODULES)) {
    for (const module of modules) {
      if (!MODULE_TO_DOMAIN[module]) {
        errors.push(`Module '${module}' in domain '${domain}' not found in reverse mapping`);
      }
    }
  }

  // Check that every module maps back correctly
  for (const [module, domain] of Object.entries(MODULE_TO_DOMAIN)) {
    if (!DOMAIN_TO_MODULES[domain]?.includes(module)) {
      errors.push(
        `Module '${module}' maps to domain '${domain}' but domain doesn't include module`
      );
    }
  }

  // Check enum consistency
  for (const domainSlug of Object.keys(DOMAIN_TO_MODULES)) {
    const domainEnum = DOMAIN_SLUG_TO_ENUM[domainSlug];
    if (!domainEnum) {
      errors.push(`Domain slug '${domainSlug}' missing enum mapping`);
      continue;
    }

    if (DOMAIN_ENUM_TO_SLUG[domainEnum] !== domainSlug) {
      errors.push(`Enum mapping inconsistency for domain '${domainSlug}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
