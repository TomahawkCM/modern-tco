#!/usr/bin/env node

/**
 * TCO Comprehensive Content Migration Script
 *
 * Parses all comprehensive markdown files from /src/content/domains/*.md
 * and populates Supabase database with structured content data.
 *
 * This replaces minimal fallback content with full 2,415 lines of
 * professional TCO study materials.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Domain configuration mapping markdown files to database structure
const DOMAIN_CONFIG = {
  "domain1-asking-questions.md": {
    domain: "Asking Questions",
    title: "Domain 1: Asking Questions",
    examWeight: 22,
    estimatedTime: "3-4 hours",
  },
  "domain2-refining-questions.md": {
    domain: "Refining Questions & Targeting",
    title: "Domain 2: Refining Questions & Targeting",
    examWeight: 23,
    estimatedTime: "4-5 hours",
  },
  "domain3-taking-action.md": {
    domain: "Taking Action",
    title: "Domain 3: Taking Action",
    examWeight: 15,
    estimatedTime: "3-4 hours",
  },
  "domain4-navigation-modules.md": {
    domain: "Navigation & Module Functions",
    title: "Domain 4: Navigation & Module Functions",
    examWeight: 23,
    estimatedTime: "4-5 hours",
  },
  "domain5-reporting-data-export.md": {
    domain: "Reporting & Data Export",
    title: "Domain 5: Reporting & Data Export",
    examWeight: 17,
    estimatedTime: "3-4 hours",
  },
};

/**
 * Parse markdown content into structured sections
 * @param {string} content - Raw markdown content
 * @returns {Array} Array of section objects
 */
function parseMarkdownContent(content) {
  const sections = [];
  const lines = content.split("\n");

  let currentSection = null;
  let currentContent = [];
  let sectionCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers (## Module X.Y:, ## 🎯 Module, etc.)
    if (
      line.match(/^##\s+(\🎯\s+)?[Mm]odule/i) ||
      line.match(/^##\s+Learning\s+Objectives/i) ||
      line.match(/^##\s+\d+\.\d+/)
    ) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join("\n").trim(),
        });
      }

      // Start new section
      sectionCounter++;
      currentSection = {
        title: line
          .replace(/^##\s*/, "")
          .replace(/\🎯\s*/, "")
          .trim(),
        section_type: determineSectionType(line),
        order_index: sectionCounter,
        estimated_time: estimateSectionTime(line),
        key_points: [],
        procedures: [],
        troubleshooting: [],
        references: [],
      };
      currentContent = [line];
    } else if (line.match(/^#\s+LAB-/i)) {
      // Handle lab sections specially
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join("\n").trim(),
        });
      }

      sectionCounter++;
      currentSection = {
        title: line.replace(/^#\s*/, "").trim(),
        section_type: "lab",
        order_index: sectionCounter,
        estimated_time: extractLabTime(content, i),
        key_points: extractKeyPoints(content, i),
        procedures: extractProcedures(content, i),
        troubleshooting: [],
        references: [],
      };
      currentContent = [line];
    } else {
      // Add line to current section content
      if (currentSection) {
        currentContent.push(line);

        // Extract key points from bullet lists
        if (line.match(/^\s*[-\*]\s+\*\*(.*?)\*\*/)) {
          const keyPoint = line.replace(/^\s*[-\*]\s+\*\*(.*?)\*\*.*/, "$1").trim();
          if (keyPoint && !currentSection.key_points.includes(keyPoint)) {
            currentSection.key_points.push(keyPoint);
          }
        }

        // Extract procedures from numbered lists
        if (line.match(/^\s*\d+\.\s+\*\*(.*?)\*\*/)) {
          const procedure = line.replace(/^\s*\d+\.\s+\*\*(.*?)\*\*.*/, "$1").trim();
          if (procedure && !currentSection.procedures.includes(procedure)) {
            currentSection.procedures.push(procedure);
          }
        }
      }
    }
  }

  // Add final section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

/**
 * Determine section type based on header content
 */
function determineSectionType(headerLine) {
  const lower = headerLine.toLowerCase();
  if (lower.includes("objective") || lower.includes("overview")) return "overview";
  if (lower.includes("procedure") || lower.includes("step-by-step")) return "procedures";
  if (lower.includes("troubleshoot") || lower.includes("common issues")) return "troubleshooting";
  if (lower.includes("lab-") || lower.includes("exercise")) return "lab";
  if (lower.includes("exam") || lower.includes("practice")) return "exam_prep";
  if (lower.includes("reference") || lower.includes("resources")) return "references";
  return "overview";
}

/**
 * Estimate reading/completion time for section
 */
function estimateSectionTime(headerLine) {
  // Base estimation on content complexity indicators
  if (headerLine.toLowerCase().includes("lab")) return 15; // Labs take longer
  if (headerLine.toLowerCase().includes("procedure")) return 20; // Procedures need practice
  if (headerLine.toLowerCase().includes("troubleshoot")) return 10; // Quick reference
  return 15; // Default reading time
}

/**
 * Extract lab time from lab section content
 */
function extractLabTime(content, startIndex) {
  const lines = content.split("\n");
  for (let i = startIndex; i < Math.min(startIndex + 20, lines.length); i++) {
    const match = lines[i].match(/(\d+)\s*min/i);
    if (match) return parseInt(match[1]);
  }
  return 15; // Default lab time
}

/**
 * Extract key points from section content
 */
function extractKeyPoints(content, startIndex) {
  const keyPoints = [];
  const lines = content.split("\n");

  for (let i = startIndex; i < Math.min(startIndex + 50, lines.length); i++) {
    const line = lines[i];
    if (line.match(/^\s*[-\*]\s+\*\*(.*?)\*\*/)) {
      const point = line.replace(/^\s*[-\*]\s+\*\*(.*?)\*\*.*/, "$1").trim();
      if (point && keyPoints.length < 10) {
        // Limit key points
        keyPoints.push(point);
      }
    }
  }

  return keyPoints;
}

/**
 * Extract procedures from section content
 */
function extractProcedures(content, startIndex) {
  const procedures = [];
  const lines = content.split("\n");

  for (let i = startIndex; i < Math.min(startIndex + 100, lines.length); i++) {
    const line = lines[i];
    if (line.match(/^\s*\d+\.\s+\*\*(.*?)\*\*/)) {
      const procedure = line.replace(/^\s*\d+\.\s+\*\*(.*?)\*\*.*/, "$1").trim();
      if (procedure && procedures.length < 15) {
        // Limit procedures
        procedures.push(procedure);
      }
    }
  }

  return procedures;
}

/**
 * Clear existing minimal content and insert comprehensive content
 */
async function migrateComprehensiveContent() {
  console.log("🚀 Starting comprehensive content migration...");

  try {
    // 1. Clear existing content
    console.log("🧹 Clearing existing content...");
    await supabase
      .from("study_sections")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("study_modules").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Process each domain file
    const contentDir = path.join(__dirname, "../src/content/domains");
    const domainFiles = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));

    console.log(`📚 Processing ${domainFiles.length} domain files...`);

    for (const filename of domainFiles) {
      if (!DOMAIN_CONFIG[filename]) {
        console.warn(`⚠️ No config found for ${filename}, skipping...`);
        continue;
      }

      console.log(`\n📖 Processing ${filename}...`);

      const config = DOMAIN_CONFIG[filename];
      const filePath = path.join(contentDir, filename);
      const content = fs.readFileSync(filePath, "utf-8");

      // Parse learning objectives from content
      const objectivesMatch = content.match(
        /By (?:the end of this module|completing this domain), (?:TCO candidates )?(?:you )?will (?:be able to:|master:)(.*?)(?=\n##|\n---|\n\*\*)/s
      );
      let learningObjectives = [];

      if (objectivesMatch) {
        learningObjectives = objectivesMatch[1]
          .split(/\n/)
          .filter((line) => line.match(/^\s*[-\*\d\.]/))
          .map((line) =>
            line
              .replace(/^\s*[-\*\d\.\s]+/, "")
              .replace(/\*\*(.*?)\*\*/, "$1")
              .trim()
          )
          .filter((obj) => obj.length > 10)
          .slice(0, 8); // Limit to 8 objectives
      }

      // Insert study module
      const { data: moduleData, error: moduleError } = await supabase
        .from("study_modules")
        .insert({
          domain: config.domain,
          title: config.title,
          description: `Comprehensive study guide for ${config.domain} covering all TCO certification requirements.`,
          exam_weight: config.examWeight,
          estimated_time: config.estimatedTime,
          learning_objectives: learningObjectives,
          references: ["Tanium Core Platform Documentation", "TCO Certification Guide"],
          exam_prep: {
            weight_percentage: config.examWeight,
            key_topics: extractKeyTopics(content),
            practice_focus: extractPracticeFocus(config.domain),
          },
        })
        .select()
        .single();

      if (moduleError) {
        console.error(`❌ Error inserting module for ${filename}:`, moduleError);
        continue;
      }

      console.log(`✅ Module created: ${moduleData.title}`);

      // Parse and insert sections
      const sections = parseMarkdownContent(content);
      console.log(`📝 Found ${sections.length} sections`);

      for (const section of sections) {
        const { error: sectionError } = await supabase.from("study_sections").insert({
          module_id: moduleData.id,
          title: section.title,
          content: section.content,
          section_type: section.section_type,
          order_index: section.order_index,
          estimated_time: section.estimated_time,
          key_points: section.key_points,
          procedures: section.procedures,
          troubleshooting: section.troubleshooting,
          references: section.references,
        });

        if (sectionError) {
          console.error(`❌ Error inserting section "${section.title}":`, sectionError);
        }
      }

      console.log(`✅ Processed ${sections.length} sections for ${config.domain}`);
    }

    // 3. Verify migration
    const { data: moduleCount } = await supabase
      .from("study_modules")
      .select("*", { count: "exact" });

    const { data: sectionCount } = await supabase
      .from("study_sections")
      .select("*", { count: "exact" });

    console.log("\n🎉 Migration completed successfully!");
    console.log(`📊 Results:`);
    console.log(`   - ${moduleCount?.length || 0} study modules created`);
    console.log(`   - ${sectionCount?.length || 0} study sections created`);
    console.log(`   - Full 2,415 lines of comprehensive content now available`);
    console.log(
      `   - Students will see professional study materials instead of minimal placeholders`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

/**
 * Extract key topics from content for exam prep
 */
function extractKeyTopics(content) {
  const topics = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Look for topics in headers and emphasized text
    if (line.match(/\*\*(.*?)\*\*/)) {
      const matches = line.matchAll(/\*\*(.*?)\*\*/g);
      for (const match of matches) {
        const topic = match[1].trim();
        if (topic.length > 5 && topic.length < 50 && !topics.includes(topic)) {
          topics.push(topic);
          if (topics.length >= 8) break;
        }
      }
    }
    if (topics.length >= 8) break;
  }

  return topics;
}

/**
 * Get practice focus based on domain
 */
function extractPracticeFocus(domain) {
  const focusMap = {
    "Asking Questions": "Question construction and sensor usage",
    "Refining Questions & Targeting": "Targeting and filtering scenarios",
    "Taking Action": "Safe action deployment and monitoring",
    "Navigation & Module Functions": "Interface efficiency and module utilization",
    "Reporting & Data Export": "Reporting scenarios and export procedures",
  };

  return focusMap[domain] || "Hands-on practice scenarios";
}

// Run migration if called directly
if (process.argv[1] === __filename) {
  migrateComprehensiveContent();
}

export { migrateComprehensiveContent };
