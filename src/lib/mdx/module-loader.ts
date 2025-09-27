import fs from "fs";
import { glob } from "glob";
import matter from "gray-matter";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import {
  SLUG_TO_DOMAIN_ENUM,
  validateModuleFrontmatter,
  type ModuleFrontmatter,
  type ModuleValidationResult,
} from "./module-schema";

/**
 * Complete module data structure
 */
export interface ModuleData {
  frontmatter: ModuleFrontmatter;
  content: MDXRemoteSerializeResult;
  slug: string;
  filePath: string;
}

/**
 * Module discovery and loading errors
 */
export class ModuleLoadError extends Error {
  constructor(
    message: string,
    public filePath?: string,
    public validationErrors?: ModuleValidationResult["errors"]
  ) {
    super(message);
    this.name = "ModuleLoadError";
  }
}

/**
 * Content discovery configuration
 */
const MODULES_DIR = path.join(process.cwd(), "src", "content", "modules");
// Use POSIX-style glob so it works cross-platform (Windows/macOS/Linux)
const MODULES_GLOB = "src/content/modules/*.mdx";

/**
 * Discover all module files using glob patterns
 */
export async function discoverModuleFiles(): Promise<string[]> {
  try {
    const files = await glob(MODULES_GLOB, { windowsPathsNoEscape: true });
    return files.sort(); // Ensure consistent ordering
  } catch (error) {
    throw new ModuleLoadError(
      `Failed to discover module files: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate slug from filename
 */
export function generateSlugFromFilename(filePath: string): string {
  const filename = path.basename(filePath, ".mdx");
  // Remove leading numbers and hyphens (e.g., "01-asking-questions" -> "asking-questions")
  return filename.replace(/^\d+-/, "");
}

/**
 * Load and parse a single module file
 */
export async function loadModuleFile(filePath: string): Promise<ModuleData> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ModuleLoadError(`Module file not found: ${filePath}`, filePath);
    }

    // Read and parse the file
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter, content: rawContent } = matter(fileContents);

    // Validate frontmatter
    const validation = validateModuleFrontmatter(frontmatter, filePath);
    if (!validation.success) {
      throw new ModuleLoadError(`Invalid frontmatter in ${filePath}`, filePath, validation.errors);
    }

    // Generate slug from filename
    const slug = generateSlugFromFilename(filePath);

    // Verify slug matches domain
    const expectedDomainEnum = SLUG_TO_DOMAIN_ENUM[slug];
    if (expectedDomainEnum && validation.data!.domainEnum !== expectedDomainEnum) {
      throw new ModuleLoadError(
        `Slug "${slug}" doesn't match domainEnum "${validation.data!.domainEnum}" in ${filePath}`,
        filePath
      );
    }

    // Serialize MDX content
    const mdxContent = await serialize(rawContent, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    });

    return {
      frontmatter: validation.data!,
      content: mdxContent,
      slug,
      filePath,
    };
  } catch (error) {
    if (error instanceof ModuleLoadError) {
      throw error;
    }

    throw new ModuleLoadError(
      `Failed to load module ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
      filePath
    );
  }
}

/**
 * Load all modules with error handling and duplicate detection
 */
export async function loadAllModules(): Promise<{
  modules: ModuleData[];
  errors: ModuleLoadError[];
}> {
  let files: string[] = [];
  try {
    files = await discoverModuleFiles();
  } catch (error) {
    return { modules: [], errors: [new ModuleLoadError(String(error))] };
  }
  const modules: ModuleData[] = [];
  const errors: ModuleLoadError[] = [];
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();

  for (const filePath of files) {
    try {
      const moduleData = await loadModuleFile(filePath);

      // Check for duplicate slugs
      if (seenSlugs.has(moduleData.slug)) {
        errors.push(
          new ModuleLoadError(`Duplicate slug "${moduleData.slug}" found in ${filePath}`, filePath)
        );
        continue;
      }

      // Check for duplicate IDs
      if (seenIds.has(moduleData.frontmatter.id)) {
        errors.push(
          new ModuleLoadError(
            `Duplicate ID "${moduleData.frontmatter.id}" found in ${filePath}`,
            filePath
          )
        );
        continue;
      }

      seenSlugs.add(moduleData.slug);
      seenIds.add(moduleData.frontmatter.id);
      modules.push(moduleData);
    } catch (error) {
      if (error instanceof ModuleLoadError) {
        errors.push(error);
      } else {
        errors.push(
          new ModuleLoadError(
            `Unexpected error loading ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
            filePath
          )
        );
      }
    }
  }

  return { modules, errors };
}

/**
 * Load a specific module by slug
 */
export async function loadModuleBySlug(slug: string): Promise<ModuleData | null> {
  let files: string[] = [];
  try {
    files = await discoverModuleFiles();
  } catch (error) {
    console.warn("Module discovery failed:", error);
    return null;
  }

  for (const filePath of files) {
    try {
      // Get metadata to check domainSlug without full parsing
      const metadata = await getModuleMetadata(filePath);
      if (metadata && metadata.frontmatter.domainSlug === slug) {
        return await loadModuleFile(filePath);
      }
    } catch (error) {
      console.error(`Failed to check module metadata for ${filePath}:`, error);
      continue;
    }
  }

  console.warn(`Module not found for slug: ${slug}`);
  return null;
}

/**
 * Get module metadata only (without parsing MDX content)
 */
export async function getModuleMetadata(filePath: string): Promise<{
  frontmatter: ModuleFrontmatter;
  slug: string;
  filePath: string;
} | null> {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter } = matter(fileContents);

    const validation = validateModuleFrontmatter(frontmatter, filePath);
    if (!validation.success) {
      console.error(`Invalid frontmatter in ${filePath}:`, validation.errors);
      return null;
    }

    const slug = generateSlugFromFilename(filePath);

    return {
      frontmatter: validation.data!,
      slug,
      filePath,
    };
  } catch (error) {
    console.error(`Failed to get metadata for ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all module metadata without parsing MDX content (faster for lists)
 */
export async function getAllModuleMetadata(): Promise<
  {
    frontmatter: ModuleFrontmatter;
    slug: string;
    filePath: string;
  }[]
> {
  let files: string[] = [];
  try {
    files = await discoverModuleFiles();
  } catch (error) {
    console.warn("Module discovery failed:", error);
    return [];
  }
  const metadata = [];

  for (const filePath of files) {
    const meta = await getModuleMetadata(filePath);
    if (meta) {
      metadata.push(meta);
    }
  }

  return metadata;
}
