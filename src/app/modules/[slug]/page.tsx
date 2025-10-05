/**
 * Module Detail Page - Fixed Server Component with MDX
 * Properly handles server-side MDX rendering without client/server conflicts
 */

import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import ModuleRenderer from "@/components/modules/ModuleRenderer";
import { validateModuleFrontmatter } from "@/lib/mdx/module-schema";

interface ModulePageProps {
  params: Promise<{ slug: string }>;
}

// Map slug variations to canonical filenames
const SLUG_TO_FILENAME: Record<string, string> = {
  "tanium-platform-foundation": "00-tanium-platform-foundation.mdx",
  "platform-foundation": "00-tanium-platform-foundation.mdx",
  "asking-questions": "01-asking-questions.mdx",
  "refining-questions-targeting": "02-refining-questions-targeting.mdx",
  "refining-questions": "02-refining-questions-targeting.mdx",
  "taking-action-packages-actions": "03-taking-action-packages-actions.mdx",
  "taking-action": "03-taking-action-packages-actions.mdx",
  "navigation-basic-modules": "04-navigation-basic-modules.mdx",
  "navigation": "04-navigation-basic-modules.mdx",
  "reporting-data-export": "05-reporting-data-export.mdx",
  "reporting": "05-reporting-data-export.mdx",
  "microlearning-example": "MICROLEARNING_EXAMPLE.mdx",
  "example-module-microlearning": "MICROLEARNING_EXAMPLE.mdx",
  "MICROLEARNING_EXAMPLE": "MICROLEARNING_EXAMPLE.mdx",
};

async function getModuleContent(slug: string) {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = !!process.env.VERCEL;

  // Debug logging for Vercel
  if (isVercel || isProduction) {
    console.log("[Module] Loading:", {
      slug,
      environment: process.env.NODE_ENV,
      platform: isVercel ? "Vercel" : "Other",
      cwd: process.cwd(),
    });
  }

  try {
    // Get the filename from slug mapping
    const filename = SLUG_TO_FILENAME[slug];
    if (!filename) {
      console.error(`[Module Error] No filename mapping for slug: ${slug}`);
      return null;
    }

    // Try to read from pre-bundled cache (Vercel-compatible)
    // Located in .mdx-cache/ which persists across builds
    const cachePath = path.join(process.cwd(), ".mdx-cache", `${filename}.json`);

    try {
      const cacheContent = await fs.readFile(cachePath, "utf8");
      const bundled = JSON.parse(cacheContent);

      // Validate frontmatter
      const validation = validateModuleFrontmatter(bundled.frontmatter, filename);
      if (!validation.success || !validation.data) {
        console.error(`[Module Error] Invalid cached frontmatter in ${filename}:`, validation.errors);
        return null;
      }

      if (isVercel || isProduction) {
        console.log(`[Module] ✓ Loaded from cache: ${filename}`);
      }

      return {
        frontmatter: validation.data,
        content: bundled.content,
        slug,
        filePath: cachePath,
      };
    } catch (cacheError) {
      // Cache miss - fall back to reading source file (local development)
      if (isVercel) {
        console.error(`[Module Error] Cache miss on Vercel for ${filename}:`, {
          error: cacheError instanceof Error ? cacheError.message : cacheError,
          cachePath,
          expectedFile: `${filename}.json`,
        });
        return null; // No fallback on Vercel - cache should always exist
      }

      console.warn(`[Module Warning] Cache miss, reading source file: ${filename}`);

      // Development fallback: read from source
      const modulePath = path.join(process.cwd(), "src", "content", "modules", filename);

      try {
        await fs.access(modulePath);
      } catch (error) {
        console.error(`[Module Error] Source file not found: ${modulePath}`);
        return null;
      }

      const fileContent = await fs.readFile(modulePath, "utf8");
      const { data: frontmatter, content } = matter(fileContent);

      // Validate frontmatter
      const validation = validateModuleFrontmatter(frontmatter, modulePath);
      if (!validation.success || !validation.data) {
        console.error(`[Module Error] Invalid frontmatter in ${filename}:`, validation.errors);
        return null;
      }

      // Serialize the MDX content
      const mdxSource = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [],
          development: false,
        },
      });

      console.log(`[Module] ✓ Loaded from source: ${filename}`);

      return {
        frontmatter: validation.data,
        content: mdxSource,
        slug,
        filePath: modulePath,
      };
    }
  } catch (error) {
    console.error(`[Module Error] Failed to load module ${slug}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;

  // Get module content
  const moduleData = await getModuleContent(slug);

  if (!moduleData) {
    notFound();
  }

  // Use the existing ModuleRenderer component which handles client-side MDX
  return <ModuleRenderer moduleData={moduleData} />;
}

// Generate static params for all modules
export async function generateStaticParams() {
  return Object.keys(SLUG_TO_FILENAME).map((slug) => ({
    slug,
  }));
}

// Metadata generation
export async function generateMetadata({ params }: ModulePageProps) {
  const { slug } = await params;
  const moduleData = await getModuleContent(slug);

  if (!moduleData) {
    return {
      title: "Module Not Found",
    };
  }

  return {
    title: `${moduleData.frontmatter.title} | Tanium TCO Study`,
    description: moduleData.frontmatter.description || `Study module for ${moduleData.frontmatter.title}`,
  };
}
