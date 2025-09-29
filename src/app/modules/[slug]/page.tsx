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
};

async function getModuleContent(slug: string) {
  try {
    // Get the filename from slug mapping
    const filename = SLUG_TO_FILENAME[slug];
    if (!filename) {
      return null;
    }

    // Construct the full path
    const modulePath = path.join(process.cwd(), "src", "content", "modules", filename);

    // Check if file exists
    try {
      await fs.access(modulePath);
    } catch {
      return null;
    }

    // Read the file
    const fileContent = await fs.readFile(modulePath, "utf8");

    // Parse frontmatter and content
    const { data: frontmatter, content } = matter(fileContent);

    // Validate frontmatter
    const validation = validateModuleFrontmatter(frontmatter, modulePath);
    if (!validation.success || !validation.data) {
      console.error(`Invalid frontmatter in ${filename}:`, validation.errors);
      return null;
    }

    // Serialize the MDX content for client-side hydration
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    });

    return {
      frontmatter: validation.data,
      content: mdxSource,
      slug,
      filePath: modulePath,
    };
  } catch (error) {
    console.error(`Error loading module ${slug}:`, error);
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