/**
 * MDX Frontmatter Schema Validation
 * Zod schemas for validating MDX module frontmatter
 */

import { z } from "zod";

export const MDXFrontmatterSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  domainSlug: z.enum([
    "platform-foundation",
    "asking-questions",
    "refining-questions-targeting",
    "taking-action-packages-actions",
    "navigation-basic-modules",
    "reporting-data-export",
  ]),
  domainEnum: z.enum([
    "PLATFORM_FOUNDATION",
    "ASKING_QUESTIONS",
    "REFINING_QUESTIONS",
    "TAKING_ACTION",
    "NAVIGATION_MODULES",
    "REPORTING_EXPORT",
  ]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  estimatedTime: z.string().regex(/^\d+\s+(min|mins|minutes?)$/i, 'Format: "45 min"'),
  prerequisites: z.array(z.string()).optional().default([]),
  objectives: z.array(z.string()).min(1, "At least one objective required"),
  tags: z.array(z.string()).min(1, "At least one tag required"),
  blueprintWeight: z.number().min(0).max(1, "Blueprint weight must be 0-1"),
  version: z.number().int().positive("Version must be positive integer"),
  status: z.enum(["draft", "review", "published", "archived"]),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  assessment: z
    .object({
      passThreshold: z.number().min(0).max(1, "Pass threshold must be 0-1"),
    })
    .optional(),
});

export type MDXFrontmatter = z.infer<typeof MDXFrontmatterSchema>;

export const ModuleSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only");

export function validateFrontmatter(frontmatter: unknown): MDXFrontmatter {
  try {
    return MDXFrontmatterSchema.parse(frontmatter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zError = error as z.ZodError<any>;
      const errorMessages = zError.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Invalid frontmatter: ${errorMessages}`);
    }
    throw error;
  }
}

export function validateSlug(slug: string): string {
  try {
    return ModuleSlugSchema.parse(slug);
  } catch (error) {
    throw new Error(`Invalid module slug: ${slug}`);
  }
}

// Schema validation errors with context
export class MDXValidationError extends Error {
  constructor(
    public module: string,
    public validationError: string,
    public suggestion?: string
  ) {
    super(`MDX validation failed for ${module}: ${validationError}`);
    this.name = "MDXValidationError";
  }
}
