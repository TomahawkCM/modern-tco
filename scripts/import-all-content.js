/**
 * Master Import Script for TCO Content Migration
 * Imports all content from old TCO app to modern Next.js app
 *
 * Usage: node scripts/import-all-content.js [--questions|--modules|--labs|--all]
 */

const fs = require("fs");
const path = require("path");

// Paths
const OLD_APP_PATH = path.join(__dirname, "../../../");
const MODERN_APP_PATH = path.join(__dirname, "..");

// Content sources
const CONTENT_SOURCES = {
  questions: {
    source: path.join(OLD_APP_PATH, "js/questions.js"),
    target: path.join(MODERN_APP_PATH, "src/data/questions/"),
    type: "javascript",
  },
  modules: {
    source: path.join(OLD_APP_PATH, "js/modules.js"),
    target: path.join(MODERN_APP_PATH, "src/data/modules/"),
    type: "javascript",
  },
  guides: {
    source: path.join(OLD_APP_PATH, "docs/Module_Guides/"),
    target: path.join(MODERN_APP_PATH, "src/data/guides/"),
    type: "markdown",
  },
  labs: {
    source: path.join(OLD_APP_PATH, "docs/Labs/"),
    target: path.join(MODERN_APP_PATH, "src/data/labs/"),
    type: "json",
  },
  exams: {
    source: path.join(OLD_APP_PATH, "docs/Exam_Sets/"),
    target: path.join(MODERN_APP_PATH, "src/data/exams/"),
    type: "json",
  },
};

// Domain mapping for questions
const DOMAIN_MAPPING = {
  AQ: "ASKING_QUESTIONS",
  RT: "REFINING_TARGETING",
  RQ: "REFINING_TARGETING", // Alternative code
  TA: "TAKING_ACTION",
  NM: "NAVIGATION_MODULES",
  NB: "NAVIGATION_MODULES", // Alternative code
  RE: "REPORTING_EXPORT",
  RD: "REPORTING_EXPORT", // Alternative code
};

// Difficulty mapping
const DIFFICULTY_MAPPING = {
  1: "EASY",
  2: "MEDIUM",
  3: "HARD",
};

/**
 * Import all questions from the old app
 */
async function importQuestions() {
  console.log("📚 Importing questions...");

  try {
    // Read the questions file
    const questionsContent = fs.readFileSync(CONTENT_SOURCES.questions.source, "utf8");

    // Extract questions array from the JavaScript file
    const questionsMatch = questionsContent.match(/const\s+questions\s*=\s*(\[[\s\S]*?\]);/);
    if (!questionsMatch) {
      throw new Error("Could not find questions array in source file");
    }

    // Parse questions (using eval carefully with known source)
    const questions = eval(questionsMatch[1]);
    console.log(`Found ${questions.length} questions to import`);

    // Group questions by domain
    const questionsByDomain = {
      ASKING_QUESTIONS: [],
      REFINING_TARGETING: [],
      TAKING_ACTION: [],
      NAVIGATION_MODULES: [],
      REPORTING_EXPORT: [],
    };

    // Process each question
    questions.forEach((q, index) => {
      const domain = DOMAIN_MAPPING[q.domain] || "NAVIGATION_MODULES";
      const difficulty = DIFFICULTY_MAPPING[q.difficulty] || "MEDIUM";

      const formattedQuestion = {
        id: `imported-${index + 1}`,
        domain: domain,
        subdomain: q.subdomain || "General",
        difficulty: difficulty,
        question: q.question,
        choices: q.choices.map((choice, i) => ({
          id: String.fromCharCode(65 + i), // A, B, C, D
          text: choice,
        })),
        correctAnswerId: String.fromCharCode(65 + q.correctAnswer),
        explanation: q.explanation || "No explanation provided.",
        category: q.category || "General",
        tags: q.tags || [],
        examTopic: q.examTopic || null,
        examSubtopic: q.examSubtopic || null,
        importedFrom: "legacy-tco-app",
        importDate: new Date().toISOString(),
      };

      questionsByDomain[domain].push(formattedQuestion);
    });

    // Create target directory if it doesn't exist
    if (!fs.existsSync(CONTENT_SOURCES.questions.target)) {
      fs.mkdirSync(CONTENT_SOURCES.questions.target, { recursive: true });
    }

    // Save questions by domain
    for (const [domain, questions] of Object.entries(questionsByDomain)) {
      const filename = `${domain.toLowerCase().replace(/_/g, "-")}.ts`;
      const filepath = path.join(CONTENT_SOURCES.questions.target, filename);

      const content = `// Auto-generated from legacy TCO app
// Domain: ${domain}
// Questions: ${questions.length}
// Generated: ${new Date().toISOString()}

import { Question } from '@/types/exam';

export const ${domain.toLowerCase()}Questions: Question[] = ${JSON.stringify(questions, null, 2)};

export default ${domain.toLowerCase()}Questions;
`;

      fs.writeFileSync(filepath, content);
      console.log(`✅ Saved ${questions.length} questions to ${filename}`);
    }

    // Create index file
    const indexContent = `// Auto-generated question bank index
// Total questions: ${questions.length}
// Generated: ${new Date().toISOString()}

import askingQuestions from './asking-questions';
import refiningTargeting from './refining-targeting';
import takingAction from './taking-action';
import navigationModules from './navigation-modules';
import reportingExport from './reporting-export';

export const allQuestions = [
  ...askingQuestions,
  ...refiningTargeting,
  ...takingAction,
  ...navigationModules,
  ...reportingExport
];

export {
  askingQuestions,
  refiningTargeting,
  takingAction,
  navigationModules,
  reportingExport
};

export default allQuestions;
`;

    fs.writeFileSync(path.join(CONTENT_SOURCES.questions.target, "index.ts"), indexContent);
    console.log("✅ Created question bank index");

    // Summary
    console.log("\n📊 Question Import Summary:");
    Object.entries(questionsByDomain).forEach(([domain, questions]) => {
      console.log(`  ${domain}: ${questions.length} questions`);
    });
  } catch (error) {
    console.error("❌ Error importing questions:", error);
  }
}

/**
 * Import learning modules
 */
async function importModules() {
  console.log("\n📚 Importing modules...");

  try {
    // Read modules file
    const modulesContent = fs.readFileSync(CONTENT_SOURCES.modules.source, "utf8");

    // Extract modules array
    const modulesMatch = modulesContent.match(/this\.modules\s*=\s*(\[[\s\S]*?\]);/);
    if (!modulesMatch) {
      throw new Error("Could not find modules array in source file");
    }

    // Parse modules
    const modules = eval(modulesMatch[1]);
    console.log(`Found ${modules.length} modules to import`);

    // Create target directory
    if (!fs.existsSync(CONTENT_SOURCES.modules.target)) {
      fs.mkdirSync(CONTENT_SOURCES.modules.target, { recursive: true });
    }

    // Save modules
    const moduleDefinitions = modules.map((module) => ({
      ...module,
      importedFrom: "legacy-tco-app",
      importDate: new Date().toISOString(),
    }));

    const content = `// Auto-generated from legacy TCO app
// Modules: ${modules.length}
// Generated: ${new Date().toISOString()}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  objectives: string[];
}

export const modules: Module[] = ${JSON.stringify(moduleDefinitions, null, 2)};

export default modules;
`;

    fs.writeFileSync(path.join(CONTENT_SOURCES.modules.target, "index.ts"), content);
    console.log(`✅ Imported ${modules.length} modules`);
  } catch (error) {
    console.error("❌ Error importing modules:", error);
  }
}

/**
 * Import study guides (markdown files)
 */
async function importGuides() {
  console.log("\n📚 Importing study guides...");

  try {
    // Create target directory
    if (!fs.existsSync(CONTENT_SOURCES.guides.target)) {
      fs.mkdirSync(CONTENT_SOURCES.guides.target, { recursive: true });
    }

    // Copy all markdown files
    const files = fs
      .readdirSync(CONTENT_SOURCES.guides.source)
      .filter((file) => file.endsWith(".md"));

    files.forEach((file) => {
      const source = path.join(CONTENT_SOURCES.guides.source, file);
      const target = path.join(CONTENT_SOURCES.guides.target, file);
      fs.copyFileSync(source, target);
      console.log(`✅ Copied ${file}`);
    });

    console.log(`✅ Imported ${files.length} study guides`);
  } catch (error) {
    console.error("❌ Error importing guides:", error);
  }
}

/**
 * Import interactive labs
 */
async function importLabs() {
  console.log("\n📚 Importing labs...");

  try {
    // Create target directory
    if (!fs.existsSync(CONTENT_SOURCES.labs.target)) {
      fs.mkdirSync(CONTENT_SOURCES.labs.target, { recursive: true });
    }

    // Copy all JSON lab files
    const files = fs
      .readdirSync(CONTENT_SOURCES.labs.source)
      .filter((file) => file.endsWith(".json"));

    files.forEach((file) => {
      const source = path.join(CONTENT_SOURCES.labs.source, file);
      const target = path.join(CONTENT_SOURCES.labs.target, file);

      // Read and process lab content
      const labContent = JSON.parse(fs.readFileSync(source, "utf8"));

      // Update domain codes to new format
      if (labContent.domain) {
        labContent.domain = DOMAIN_MAPPING[labContent.domain] || labContent.domain;
      }

      // Add import metadata
      labContent.importedFrom = "legacy-tco-app";
      labContent.importDate = new Date().toISOString();

      fs.writeFileSync(target, JSON.stringify(labContent, null, 2));
      console.log(`✅ Imported ${file}`);
    });

    console.log(`✅ Imported ${files.length} labs`);
  } catch (error) {
    console.error("❌ Error importing labs:", error);
  }
}

/**
 * Import exam sets
 */
async function importExams() {
  console.log("\n📚 Importing exams...");

  try {
    // Create target directory
    if (!fs.existsSync(CONTENT_SOURCES.exams.target)) {
      fs.mkdirSync(CONTENT_SOURCES.exams.target, { recursive: true });
    }

    // Process subdirectories
    const subdirs = ["mock_exams", "real_exams"];
    let totalExams = 0;

    subdirs.forEach((subdir) => {
      const sourcePath = path.join(CONTENT_SOURCES.exams.source, subdir);
      const targetPath = path.join(CONTENT_SOURCES.exams.target, subdir);

      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      if (fs.existsSync(sourcePath)) {
        const files = fs.readdirSync(sourcePath).filter((file) => file.endsWith(".json"));

        files.forEach((file) => {
          const source = path.join(sourcePath, file);
          const target = path.join(targetPath, file);
          fs.copyFileSync(source, target);
          totalExams++;
        });
      }
    });

    // Also copy quizlet file if it exists
    const quizletSource = path.join(CONTENT_SOURCES.exams.source, "quizlet_100.json");
    if (fs.existsSync(quizletSource)) {
      const quizletTarget = path.join(CONTENT_SOURCES.exams.target, "quizlet_100.json");
      fs.copyFileSync(quizletSource, quizletTarget);
      totalExams++;
    }

    console.log(`✅ Imported ${totalExams} exam files`);
  } catch (error) {
    console.error("❌ Error importing exams:", error);
  }
}

/**
 * Main import function
 */
async function main() {
  console.log("🚀 Starting TCO Content Import");
  console.log("================================\n");

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--all")) {
    // Import everything
    await importQuestions();
    await importModules();
    await importGuides();
    await importLabs();
    await importExams();
  } else {
    // Import specific content types
    if (args.includes("--questions")) await importQuestions();
    if (args.includes("--modules")) await importModules();
    if (args.includes("--guides")) await importGuides();
    if (args.includes("--labs")) await importLabs();
    if (args.includes("--exams")) await importExams();
  }

  console.log("\n================================");
  console.log("✅ Import complete!");
  console.log("\nNext steps:");
  console.log("1. Fix domain constants in ProgressContext.tsx");
  console.log("2. Update domain page components");
  console.log("3. Create module/lab viewer components");
  console.log("4. Test imported content");
}

// Run the import
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
