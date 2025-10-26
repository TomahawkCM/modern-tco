#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import * as url from "url";
import { buildModuleIndex, loadKbLessons } from "./lib/kb-lesson-loader";

type ExportOptions = {
  lessonsDir: string;
  outDir: string;
  outFile: string;
  pretty: boolean;
};

function resolveOptions(): ExportOptions {
  const args = process.argv.slice(2);
  let lessonsDir = path.join(process.cwd(), "docs", "KB", "lessons");
  let outDir = path.join(process.cwd(), "docs", "KB", "export", "out");
  let outFile = "kb-lessons.json";
  let pretty = true;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--lessons":
      case "-l": {
        const next = args[i + 1];
        if (!next) throw new Error("Missing directory after --lessons");
        lessonsDir = path.resolve(process.cwd(), next);
        i += 1;
        break;
      }
      case "--out":
      case "-o": {
        const next = args[i + 1];
        if (!next) throw new Error("Missing output directory after --out");
        outDir = path.resolve(process.cwd(), next);
        i += 1;
        break;
      }
      case "--file":
      case "-f": {
        const next = args[i + 1];
        if (!next) throw new Error("Missing file name after --file");
        outFile = next;
        i += 1;
        break;
      }
      case "--compact":
        pretty = false;
        break;
      default:
        break;
    }
  }

  return { lessonsDir, outDir, outFile, pretty };
}

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function renderPayload(options: ExportOptions) {
  const lessons = loadKbLessons(options.lessonsDir);
  const modulesIndex = buildModuleIndex(lessons);
  const modules = Object.values(modulesIndex).sort((a, b) => a.order - b.order);

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      moduleCount: modules.length,
      lessonCount: lessons.length,
      sourceDir: options.lessonsDir,
    },
    modules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      domain: module.domain,
      status: module.status,
      description: module.description ?? null,
      metadata: module.metadata,
      lessons: module.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        status: lesson.status,
        summary: lesson.summary,
        durationMinutes: lesson.durationMinutes ?? null,
        tags: lesson.tags,
        contributors: lesson.contributors,
        skillLevel: lesson.skillLevel,
        content: lesson.content,
        sourceFile: lesson.fileName,
      })),
    })),
    questions: [],
  };
}

function writePayload(payload: unknown, options: ExportOptions) {
  ensureDirectory(options.outDir);
  const filePath = path.join(options.outDir, options.outFile);
  const json = options.pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
  fs.writeFileSync(filePath, json + "\n", "utf-8");
  return filePath;
}

function main() {
  try {
    const options = resolveOptions();
    console.log("?? KB Lesson Exporter");
    console.log("?? Lessons dir:", options.lessonsDir);
    console.log("?? Output dir:", options.outDir);

    const payload = renderPayload(options);
    const filePath = writePayload(payload, options);

    console.log(`?? Exported ${payload.metadata.moduleCount} module(s) and ${payload.metadata.lessonCount} lesson(s)`);
    console.log(`?? Output file: ${filePath}`);
  } catch (error) {
    console.error("?? KB lesson export failed:", (error as Error).message);
    process.exitCode = 1;
  }
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  main();
}

export { renderPayload, writePayload };