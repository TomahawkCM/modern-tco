/**
 * Content Discovery System
 * Glob-based discovery and metadata aggregation for MDX modules
 */

import fs from "fs/promises";
import path from "path";
import { type MDXFrontmatter, validateFrontmatter, MDXValidationError } from "./mdx-schema";

export interface ModuleMetadata extends MDXFrontmatter {
  slug: string;
  filePath: string;
  contentLength?: number;
  readingTime?: number;
}

export interface ContentDiscoveryResult {
  modules: ModuleMetadata[];
  errors: MDXValidationError[];
  totalModules: number;
  validModules: number;
}

const MODULES_DIR = path.join(process.cwd(), "src/content/modules");
const CONTENT_PATTERN = /\.mdx?$/;

// Extract frontmatter from MDX content
function extractFrontmatter(content: string): unknown {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("No frontmatter found");
  }

  const frontmatterYaml = frontmatterMatch[1];

  // Simple YAML parser for our specific frontmatter structure
  const lines = frontmatterYaml.split("\n");
  const result: any = {};
  let currentKey = "";
  let isArray = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("- ")) {
      // Array item
      if (isArray && currentKey) {
        if (!Array.isArray(result[currentKey])) {
          result[currentKey] = [];
        }
        result[currentKey].push(trimmed.substring(2).trim());
      }
    } else if (trimmed.includes(":")) {
      // Key-value pair
      const [key, ...valueParts] = trimmed.split(":");
      const value = valueParts.join(":").trim();

      currentKey = key.trim();
      isArray = false;

      if (value === "") {
        // This might start an array
        isArray = true;
        result[currentKey] = [];
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // Inline array
        const arrayContent = value.slice(1, -1);
        result[currentKey] = arrayContent.split(",").map((item) => item.trim());
      } else if (value === "true" || value === "false") {
        result[currentKey] = value === "true";
      } else if (!isNaN(Number(value))) {
        result[currentKey] = Number(value);
      } else {
        result[currentKey] = value.replace(/['"]/g, "");
      }
    }
  }

  return result;
}

// Calculate reading time based on content length
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Get module slug from filename
function getSlugFromFilename(filename: string): string {
  return filename
    .replace(/^\d+-/, "") // Remove number prefix
    .replace(/\.mdx?$/, "") // Remove extension
    .toLowerCase();
}

export async function discoverModules(): Promise<ContentDiscoveryResult> {
  const modules: ModuleMetadata[] = [];
  const errors: MDXValidationError[] = [];

  try {
    const files = await fs.readdir(MODULES_DIR);
    const mdxFiles = files.filter((file) => CONTENT_PATTERN.test(file));

    for (const file of mdxFiles) {
      const filePath = path.join(MODULES_DIR, file);
      const slug = getSlugFromFilename(file);

      try {
        const content = await fs.readFile(filePath, "utf-8");
        const frontmatter = extractFrontmatter(content);
        const validatedFrontmatter = validateFrontmatter(frontmatter);

        const metadata: ModuleMetadata = {
          ...validatedFrontmatter,
          slug,
          filePath,
          contentLength: content.length,
          readingTime: calculateReadingTime(content),
        };

        modules.push(metadata);
      } catch (error) {
        const validationError = new MDXValidationError(
          file,
          error instanceof Error ? error.message : String(error),
          `Check frontmatter format in ${file}`
        );
        errors.push(validationError);
      }
    }
  } catch (error) {
    const discoveryError = new MDXValidationError(
      "content-discovery",
      `Failed to read modules directory: ${error}`,
      "Ensure src/content/modules directory exists"
    );
    errors.push(discoveryError);
  }

  return {
    modules: modules.sort((a, b) => a.title.localeCompare(b.title)),
    errors,
    totalModules: modules.length + errors.length,
    validModules: modules.length,
  };
}

// Get module by slug
export async function getModuleBySlug(slug: string): Promise<ModuleMetadata | null> {
  const { modules } = await discoverModules();
  return modules.find((module) => module.slug === slug) || null;
}

// Get modules by domain
export async function getModulesByDomain(domainSlug: string): Promise<ModuleMetadata[]> {
  const { modules } = await discoverModules();
  return modules.filter((module) => module.domainSlug === domainSlug);
}

// Validate all modules (for CI/CD)
export async function validateAllModules(): Promise<{
  valid: boolean;
  errors: MDXValidationError[];
  summary: string;
}> {
  const { modules, errors, totalModules, validModules } = await discoverModules();

  const valid = errors.length === 0;
  const summary = `Validated ${totalModules} modules: ${validModules} valid, ${errors.length} errors`;

  return { valid, errors, summary };
}
