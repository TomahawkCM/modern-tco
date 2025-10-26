#!/usr/bin/env node

/**
 * Test Script for Study Content Parser
 *
 * Tests the markdown parsing functionality without database operations
 */

const fs = require("fs");
const path = require("path");

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

class ContentParserTester {
  constructor() {
    this.legacyDocsPath = path.join(__dirname, "../../docs/Module_Guides");
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
}

async function testContentParsing() {
  console.log("🧪 Testing Study Content Parser");
  console.log("===============================");

  const tester = new ContentParserTester();

  // Test individual file parsing
  const testFile = "01-Asking_Questions.md";
  const testPath = path.join(tester.legacyDocsPath, testFile);

  if (!fs.existsSync(testPath)) {
    console.error(`❌ Test file not found: ${testPath}`);
    return;
  }

  console.log(`\n📖 Testing parser with: ${testFile}`);

  try {
    // Read and parse content
    const content = fs.readFileSync(testPath, "utf8");
    console.log(`   Content length: ${content.length.toLocaleString()} characters`);

    const sections = tester.parseMarkdownContent(content, "Asking Questions");
    console.log(`   Parsed sections: ${sections.length}`);

    // Display section structure
    console.log("\n📝 Section Structure:");
    sections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title}`);
      console.log(`      Content: ${section.content.length} chars`);
      console.log(`      Subsections: ${section.subsections.length}`);

      section.subsections.forEach((subsection, subIndex) => {
        console.log(
          `         ${index + 1}.${subIndex + 1} ${subsection.title} (${subsection.content.length} chars)`
        );
      });
    });

    // Test content preview
    console.log("\n🔍 Content Preview (First Section):");
    if (sections.length > 0) {
      const firstSection = sections[0];
      console.log(`Title: ${firstSection.title}`);
      console.log("Content:");
      console.log(
        firstSection.content.substring(0, 300) + (firstSection.content.length > 300 ? "..." : "")
      );

      if (firstSection.subsections.length > 0) {
        const firstSubsection = firstSection.subsections[0];
        console.log(`\nFirst Subsection: ${firstSubsection.title}`);
        console.log(
          firstSubsection.content.substring(0, 200) +
            (firstSubsection.content.length > 200 ? "..." : "")
        );
      }
    }

    // Test domain mapping
    console.log("\n🗺️  Testing Domain Mapping:");
    Object.entries(LEGACY_DOMAIN_MAPPING).forEach(([legacy, modern]) => {
      console.log(`   ${legacy} → ${modern}`);
    });

    console.log("\n✅ Parser test completed successfully!");
  } catch (error) {
    console.error(`❌ Parser test failed: ${error.message}`);
    throw error;
  }
}

async function testAllFiles() {
  console.log("\n🗂️  Testing All Module Guide Files");
  console.log("=================================");

  const tester = new ContentParserTester();

  let totalSections = 0;
  let totalCharacters = 0;

  for (const [domain, filename] of Object.entries(DOMAIN_FILE_MAPPING)) {
    const filePath = path.join(tester.legacyDocsPath, filename);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const sections = tester.parseMarkdownContent(content, domain);

      totalSections += sections.length;
      totalCharacters += content.length;

      console.log(
        `✅ ${domain}: ${sections.length} sections, ${content.length.toLocaleString()} characters`
      );
    } else {
      console.log(`❌ ${domain}: File not found (${filename})`);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`Total sections across all domains: ${totalSections}`);
  console.log(`Total characters across all domains: ${totalCharacters.toLocaleString()}`);
}

// Main execution
async function main() {
  try {
    await testContentParsing();
    await testAllFiles();
    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error(`\n💥 Tests failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testContentParsing, testAllFiles };
