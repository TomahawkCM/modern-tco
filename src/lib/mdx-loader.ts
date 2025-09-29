/**
 * MDX Content Loader - Dynamic import system for study modules
 * Maps domain slugs to MDX file imports with metadata extraction
 */

// Older versions of @mdx-js/react exported MDXProps; to avoid cross-version issues
// use a flexible component type for MDX modules.

export interface MDXModule {
  default: React.ComponentType<any>;
  metadata?: {
    id: string;
    title: string;
    domainSlug: string;
    difficulty: string;
    estimatedTime: string;
    objectives: string[];
    tags: string[];
    blueprintWeight: number;
    version: number;
    status: string;
    lastUpdated: string;
    assessment?: {
      passThreshold: number;
    };
  };
}

// Domain slug to MDX file mapping
const domainToMDXMap: Record<string, () => Promise<MDXModule>> = {
  "platform-foundation": () => import("@/content/modules/00-tanium-platform-foundation.mdx"),
  "tanium-platform-foundation": () => import("@/content/modules/00-tanium-platform-foundation.mdx"),
  "asking-questions": () => import("@/content/modules/01-asking-questions.mdx"),
  "refining-questions-targeting": () =>
    import("@/content/modules/02-refining-questions-targeting.mdx"),
  "taking-action-packages-actions": () =>
    import("@/content/modules/03-taking-action-packages-actions.mdx"),
  "navigation-basic-modules": () => import("@/content/modules/04-navigation-basic-modules.mdx"),
  "reporting-data-export": () => import("@/content/modules/05-reporting-data-export.mdx"),
};

export async function loadMDXContent(domainSlug: string): Promise<MDXModule | null> {
  const loader = domainToMDXMap[domainSlug];

  if (!loader) {
    console.error(`No MDX loader found for domain: ${domainSlug}`);
    return null;
  }

  try {
    const module = await loader();
    return module;
  } catch (error) {
    console.error(`Failed to load MDX content for ${domainSlug}:`, error);
    return null;
  }
}

export function getMDXMetadata(module: MDXModule) {
  return (
    module.metadata || {
      id: "unknown",
      title: "Unknown Module",
      domainSlug: "unknown",
      difficulty: "Intermediate",
      estimatedTime: "45 min",
      objectives: [],
      tags: [],
      blueprintWeight: 0,
      version: 1,
      status: "draft",
      lastUpdated: new Date().toISOString().split("T")[0],
    }
  );
}

// Available domain slugs for validation
export const AVAILABLE_DOMAINS = Object.keys(domainToMDXMap);
