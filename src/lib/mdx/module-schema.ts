import { z } from "zod";

/**
 * Zod schema for module frontmatter validation
 * Based on the Core Study Modules Plan requirements
 */

export const ModuleFrontmatterSchema = z.object({
  // Core identification
  id: z.string().min(1, "Module ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  domainSlug: z.string().min(1, "Domain slug is required"),
  domainEnum: z.enum([
    "ASKING_QUESTIONS",
    "REFINING_QUESTIONS",
    "TAKING_ACTION",
    "NAVIGATION_MODULES",
    "REPORTING_EXPORT",
    // Allow foundation/prerequisite module in the same pipeline
    "PLATFORM_FOUNDATION",
  ]),

  // Learning metadata
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estimatedTime: z
    .string()
    .regex(
      /^\d+(?:\.\d+)?\s*(min|minutes|hour|hours|h)$/i,
      "Estimated time must be like '45 min', '90 minutes', or '3 hours'"
    ),
  prerequisites: z.array(z.string()).optional().default([]),
  learningObjectives: z.array(z.string()).optional().default([]),
  objectives: z.array(z.string()).optional().default([]),

  // Content organization
  tags: z.array(z.string()).optional().default([]),
  blueprintWeight: z
    .number()
    .min(0)
    .max(100, "Blueprint weight must be between 0 and 100")
    .optional(),
  version: z.union([z.number().positive(), z.string()]).optional(),
  status: z.enum(["draft", "review", "published"]).optional(),
  lastUpdated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Last updated must be in YYYY-MM-DD format")
    .optional(),

  // Practice configuration for PracticeButton integration
  practiceConfig: z
    .object({
      targetTags: z.array(z.string()),
      objectiveIds: z.array(z.string()),
      // Accept any string to allow lowercase values in content files
      difficulty: z.string(),
    })
    .optional(),

  // Assessment configuration
  assessment: z
    .object({
      passThreshold: z.number().min(0).max(1, "Pass threshold must be between 0 and 1"),
    })
    .optional(),
});

export type ModuleFrontmatter = z.infer<typeof ModuleFrontmatterSchema>;

/**
 * Validation result with detailed error information
 */
export interface ModuleValidationResult {
  success: boolean;
  data?: ModuleFrontmatter;
  errors?: {
    field: string;
    message: string;
  }[];
  filePath?: string;
}

/**
 * Validate module frontmatter with detailed error reporting
 */
export function validateModuleFrontmatter(
  frontmatter: unknown,
  filePath?: string
): ModuleValidationResult {
  try {
    const data = ModuleFrontmatterSchema.parse(frontmatter);
    return {
      success: true,
      data,
      filePath,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zError = error as z.ZodError<any>;
      const errors = zError.issues.map((err: z.ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return {
        success: false,
        errors,
        filePath,
      };
    }

    return {
      success: false,
      errors: [{ field: "unknown", message: "Unexpected validation error" }],
      filePath,
    };
  }
}

/**
 * Domain enum to slug mapping
 */
export const DOMAIN_ENUM_TO_SLUG: Record<ModuleFrontmatter["domainEnum"], string> = {
  ASKING_QUESTIONS: "asking-questions",
  REFINING_QUESTIONS: "refining-questions-targeting",
  TAKING_ACTION: "taking-action-packages-actions",
  NAVIGATION_MODULES: "navigation-basic-modules",
  REPORTING_EXPORT: "reporting-data-export",
  PLATFORM_FOUNDATION: "platform-foundation",
};

/**
 * Slug to domain enum mapping
 */
export const SLUG_TO_DOMAIN_ENUM: Record<string, ModuleFrontmatter["domainEnum"]> = {
  "asking-questions": "ASKING_QUESTIONS",
  "refining-questions-targeting": "REFINING_QUESTIONS",
  "taking-action-packages-actions": "TAKING_ACTION",
  "navigation-basic-modules": "NAVIGATION_MODULES",
  "reporting-data-export": "REPORTING_EXPORT",
  "platform-foundation": "PLATFORM_FOUNDATION",
};
