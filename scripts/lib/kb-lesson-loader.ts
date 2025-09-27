import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type KbLessonFrontmatter = {
  id: string;
  domain: string;
  slug: string;
  title: string;
  module_title?: string;
  duration_minutes?: number;
  status?: string;
  contributors?: string[];
  description?: string;
  summary?: string;
  tags?: string[];
  skill_level?: string;
};

export type KbLessonSpec = {
  moduleId: string;
  moduleTitle: string;
  domain: string;
  slug: string;
  title: string;
  durationMinutes?: number;
  status: string;
  contributors: string[];
  description?: string;
  summary: string;
  tags: string[];
  skillLevel: string;
  content: string;
  fileName: string;
  order: number;
  frontmatter: KbLessonFrontmatter;
};

export type KbModuleSpec = {
  id: string;
  title: string;
  domain: string;
  description?: string;
  status: string;
  metadata: Record<string, unknown>;
  order: number;
  lessons: KbLessonSpec[];
};

const VALID_DOMAINS = new Set(["AQ", "RQ", "TA", "NB", "RD"]);

const DEFAULT_LESSONS_DIR = path.join(process.cwd(), "docs", "KB", "lessons");

export function loadKbLessons(lessonsDir: string = DEFAULT_LESSONS_DIR): KbLessonSpec[] {
  if (!fs.existsSync(lessonsDir)) {
    throw new Error(`KB lessons directory not found: ${lessonsDir}`);
  }

  const entries = fs
    .readdirSync(lessonsDir)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  return entries.map((fileName, index) => {
    const filePath = path.join(lessonsDir, fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    const front = parsed.data as KbLessonFrontmatter;

    validateFrontmatter(front, fileName);

    const domain = (front.domain || "").toUpperCase();
    const durationMinutes = normaliseDuration(front.duration_minutes);
    const status = typeof front.status === "string" && front.status.trim().length > 0 ? front.status.trim() : "draft";
    const contributors = Array.isArray(front.contributors) ? front.contributors.map(String).filter(Boolean) : [];
    const tags = Array.isArray(front.tags) ? front.tags.map(String).filter(Boolean) : [];
    const skillLevel = typeof front.skill_level === "string" && front.skill_level.trim().length > 0 ? front.skill_level.trim() : "beginner";
    const description = typeof front.description === "string" ? front.description.trim() : undefined;
    const summary = deriveSummary(front, parsed.content);
    const moduleTitle = typeof front.module_title === "string" && front.module_title.trim().length > 0 ? front.module_title.trim() : String(front.title).trim();

    return {
      moduleId: String(front.id).trim(),
      moduleTitle,
      domain,
      slug: String(front.slug).trim(),
      title: String(front.title).trim(),
      durationMinutes,
      status,
      contributors,
      description,
      summary,
      tags,
      skillLevel,
      content: parsed.content.trim(),
      fileName,
      order: index + 1,
      frontmatter: front,
    };
  });
}

export function buildModuleIndex(lessons: KbLessonSpec[]): Record<string, KbModuleSpec> {
  const modules: Record<string, KbModuleSpec> = {};

  lessons.forEach((lesson) => {
    if (!modules[lesson.moduleId]) {
      modules[lesson.moduleId] = {
        id: lesson.moduleId,
        title: lesson.moduleTitle,
        domain: lesson.domain,
        description: lesson.description,
        status: lesson.status,
        metadata: {
          status: lesson.status,
          contributors: lesson.contributors,
          durationMinutes: lesson.durationMinutes,
          slug: lesson.slug,
          sourceFile: lesson.fileName,
        },
        order: lesson.order,
        lessons: [],
      };
    }

    modules[lesson.moduleId].lessons.push(lesson);

    if (lesson.order < modules[lesson.moduleId].order) {
      modules[lesson.moduleId].order = lesson.order;
    }

    if (!modules[lesson.moduleId].description && lesson.description) {
      modules[lesson.moduleId].description = lesson.description;
    }
  });

  Object.values(modules).forEach((module) => {
    module.lessons.sort((a, b) => a.order - b.order);
  });

  return modules;
}

function validateFrontmatter(front: Partial<KbLessonFrontmatter>, fileName: string): asserts front is KbLessonFrontmatter {
  const required = ["id", "domain", "slug", "title"] as const;
  for (const key of required) {
    if (!front[key] || String(front[key]).trim().length === 0) {
      throw new Error(`Lesson ${fileName} is missing required frontmatter field '${key}'`);
    }
  }

  const domain = String(front.domain).toUpperCase();
  if (!VALID_DOMAINS.has(domain)) {
    throw new Error(`Lesson ${fileName} has invalid domain '${front.domain}'. Expected one of ${Array.from(VALID_DOMAINS).join(", ")}`);
  }
}

function deriveSummary(front: Partial<KbLessonFrontmatter>, content: string): string {
  if (typeof front.summary === "string" && front.summary.trim().length > 0) {
    return front.summary.trim();
  }

  const blocks = content
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.replace(/[#>*`-]/g, " ").replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);

  for (const block of blocks) {
    if (/^(overview|lesson flow|resources to link later|author notes)$/i.test(block)) {
      continue;
    }
    if (block.length < 20) {
      continue;
    }
    return block.slice(0, 320);
  }

  return "Lesson summary pending";
}

function normaliseDuration(value?: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}