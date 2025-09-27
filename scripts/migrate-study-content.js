#!/usr/bin/env node

/**
 * Study Content Migration Script
 *
 * Migrates legacy Tanium TCO Module_Guide content to modern-tco Supabase database
 * Handles domain name mapping and markdown parsing
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Domain name mapping from legacy to modern TCO blueprint names
const LEGACY_DOMAIN_MAPPING = {
  "Asking Questions": "Asking Questions",
  "Refining Questions and Targeting": "Refining Questions",
  "Taking Action": "Taking Action",
  "Tanium Navigation and Basic Modules": "Navigation & Basic Modules",
  "Report Generation and Data Export": "Report Generation & Data Export",
};

// File mapping for legacy Module_Guide files
const DOMAIN_FILE_MAPPING = {
  "Asking Questions": "01-Asking_Questions.md",
  "Refining Questions": "02-Refining_Questions_and_Targeting.md",
  "Taking Action": "03-Taking_Action_Packages_and_Actions.md",
  "Navigation & Basic Modules": "04-Navigation_and_Basic_Module_Functions.md",
  "Report Generation & Data Export": "05-Reporting_and_Data_Export.md",
};

class StudyContentMigrator {
  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Paths
    this.legacyDocsPath = path.join(__dirname, "../../docs/Module_Guides");
    this.modernTcoPath = path.join(__dirname, "..");
  }

  /**
   * Parse markdown content into structured sections
   */
  parseMarkdownContent(content, domain) {
    const lines = content.split("\n");
    const sections = [];
    let currentSection = null;
    let currentSubsection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Main section headers (## )
      if (line.startsWith("## ")) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: line.replace("## ", "").trim(),
          content: "",
          subsections: [],
          order_index: sections.length,
        };
        currentSubsection = null;
      }
      // Subsection headers (### )
      else if (line.startsWith("### ")) {
        if (currentSection) {
          // Save previous subsection content
          if (currentSubsection) {
            currentSection.subsections.push(currentSubsection);
          }

          currentSubsection = {
            title: line.replace("### ", "").trim(),
            content: "",
            order_index: currentSection.subsections.length,
          };
        }
      }
      // Content lines
      else {
        const contentLine = lines[i]; // Keep original formatting

        if (currentSubsection) {
          currentSubsection.content += contentLine + "\n";
        } else if (currentSection) {
          currentSection.content += contentLine + "\n";
        }
      }
    }

    // Don't forget the last section
    if (currentSection) {
      if (currentSubsection) {
        currentSection.subsections.push(currentSubsection);
      }
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Insert study module into database
   */
  async insertStudyModule(domain, description, totalSections) {
    const { data, error } = await this.supabase
      .from("study_modules")
      .insert({
        domain,
        title: `${domain} - Study Guide`,
        description,
        total_sections: totalSections,
        estimated_time_minutes: totalSections * 15, // Estimate 15 minutes per section
        difficulty_level: "intermediate",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert study module: ${error.message}`);
    }

    return data;
  }

  /**
   * Insert study sections into database
   */
  async insertStudySections(moduleId, sections) {
    const sectionsToInsert = [];

    for (const section of sections) {
      // Main section
      const sectionData = {
        module_id: moduleId,
        title: section.title,
        content: section.content.trim(),
        order_index: section.order_index,
        parent_section_id: null,
      };

      sectionsToInsert.push(sectionData);

      // Subsections
      for (const subsection of section.subsections) {
        // We'll need to handle parent_section_id after inserting main sections
        // For now, we'll insert subsections with a temporary structure
        const subsectionData = {
          module_id: moduleId,
          title: `${section.title} - ${subsection.title}`,
          content: subsection.content.trim(),
          order_index: section.order_index + (subsection.order_index + 1) * 0.1,
          parent_section_id: null, // Will be updated after main section insertion
        };

        sectionsToInsert.push(subsectionData);
      }
    }

    const { data, error } = await this.supabase
      .from("study_sections")
      .insert(sectionsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to insert study sections: ${error.message}`);
    }

    return data;
  }

  /**
   * Migrate a single domain's content
   */
  async migrateDomain(legacyDomain) {
    const modernDomain = LEGACY_DOMAIN_MAPPING[legacyDomain];
    const filename = DOMAIN_FILE_MAPPING[modernDomain];

    if (!filename) {
      throw new Error(`No file mapping found for domain: ${modernDomain}`);
    }

    console.log(`\n📚 Migrating ${legacyDomain} → ${modernDomain}`);

    // Read legacy content
    const filePath = path.join(this.legacyDocsPath, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    console.log(`   📖 Read ${content.length} characters from ${filename}`);

    // Parse content into sections
    const sections = this.parseMarkdownContent(content, modernDomain);
    console.log(`   📝 Parsed ${sections.length} sections`);

    // Create module description
    const description = `Comprehensive study guide for ${modernDomain} covering all essential concepts, procedures, and best practices for the Tanium Certified Operator exam.`;

    // Insert into database
    try {
      // Insert study module
      const module = await this.insertStudyModule(modernDomain, description, sections.length);
      console.log(`   ✅ Created study module: ${module.id}`);

      // Insert study sections
      const insertedSections = await this.insertStudySections(module.id, sections);
      console.log(`   ✅ Created ${insertedSections.length} study sections`);

      return {
        domain: modernDomain,
        moduleId: module.id,
        sectionsCount: insertedSections.length,
        totalCharacters: content.length,
      };
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${modernDomain}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run complete migration for all domains
   */
  async migrateAll() {
    console.log("🚀 Starting Study Content Migration");
    console.log("==================================");

    const results = [];

    // Get all legacy domains to migrate
    const legacyDomains = Object.keys(LEGACY_DOMAIN_MAPPING);

    for (const legacyDomain of legacyDomains) {
      try {
        const result = await this.migrateDomain(legacyDomain);
        results.push(result);
      } catch (error) {
        console.error(`Failed to migrate ${legacyDomain}:`, error.message);
        // Continue with other domains
      }
    }

    // Summary
    console.log("\n📊 Migration Summary");
    console.log("==================");

    const totalSections = results.reduce((sum, r) => sum + r.sectionsCount, 0);
    const totalCharacters = results.reduce((sum, r) => sum + r.totalCharacters, 0);

    console.log(`Domains migrated: ${results.length}/${legacyDomains.length}`);
    console.log(`Total sections: ${totalSections}`);
    console.log(`Total content: ${totalCharacters.toLocaleString()} characters`);

    results.forEach((result) => {
      console.log(
        `  • ${result.domain}: ${result.sectionsCount} sections (${result.totalCharacters.toLocaleString()} chars)`
      );
    });

    return results;
  }

  /**
   * Verify migration results
   */
  async verifyMigration() {
    console.log("\n🔍 Verifying Migration");
    console.log("=====================");

    try {
      // Check study modules
      const { data: modules, error: modulesError } = await this.supabase
        .from("study_modules")
        .select("*")
        .order("domain");

      if (modulesError) {
        throw new Error(`Failed to fetch modules: ${modulesError.message}`);
      }

      console.log(`✅ Found ${modules.length} study modules:`);
      modules.forEach((module) => {
        console.log(
          `   • ${module.domain} (${module.total_sections} sections, ${module.estimated_time_minutes}min)`
        );
      });

      // Check study sections
      const { data: sections, error: sectionsError } = await this.supabase
        .from("study_sections")
        .select("module_id, title")
        .order("module_id, order_index");

      if (sectionsError) {
        throw new Error(`Failed to fetch sections: ${sectionsError.message}`);
      }

      console.log(`✅ Found ${sections.length} study sections total`);

      // Group by module
      const sectionsByModule = {};
      sections.forEach((section) => {
        if (!sectionsByModule[section.module_id]) {
          sectionsByModule[section.module_id] = [];
        }
        sectionsByModule[section.module_id].push(section);
      });

      Object.entries(sectionsByModule).forEach(([moduleId, moduleSections]) => {
        const module = modules.find((m) => m.id === moduleId);
        console.log(`   • ${module?.domain || moduleId}: ${moduleSections.length} sections`);
      });

      return { modules: modules.length, sections: sections.length };
    } catch (error) {
      console.error("❌ Verification failed:", error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const migrator = new StudyContentMigrator();

    // Run migration
    await migrator.migrateAll();

    // Verify results
    await migrator.verifyMigration();

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("\n💥 Migration failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { StudyContentMigrator };
