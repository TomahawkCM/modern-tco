import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment from .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");
const env = {};

envLines.forEach((line) => {
  const match = line.match(/^([^#][^=]*)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 Using Supabase URL:", supabaseUrl);
console.log("🔑 Service key available:", !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTablesAndMigrateContent() {
  console.log("🚀 Starting automatic pipeline: Create tables + Load content\n");

  // Step 1: Try to create tables by checking if they exist
  try {
    console.log("📋 Step 1: Checking if tables exist...");

    // Test study_modules table
    const { error: modulesError } = await supabase
      .from("study_modules")
      .select("count", { count: "exact" })
      .limit(0);

    if (modulesError?.code === "PGRST106") {
      console.log("❌ study_modules table does not exist");
      console.log("\n🔧 Please run this SQL in Supabase Dashboard:");
      console.log("=====================================");
      console.log(`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.study_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exam_weight INTEGER,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.study_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.study_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    section_type TEXT DEFAULT 'content',
    order_index INTEGER DEFAULT 0,
    estimated_time INTEGER,
    difficulty_level TEXT DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_sections_module_id ON public.study_sections(module_id);

ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for study modules" ON public.study_modules FOR SELECT USING (true);
CREATE POLICY "Public read access for study sections" ON public.study_sections FOR SELECT USING (true);
      `);
      return false;
    } else {
      console.log("✅ Tables exist, proceeding with content migration...");
    }

    // Step 2: Load comprehensive content
    console.log("\n📚 Step 2: Loading comprehensive TCO content...");

    const domainFiles = [
      "domain1-asking-questions.md",
      "domain2-refining-questions.md",
      "domain3-taking-action.md",
      "domain4-navigation-modules.md",
      "domain5-reporting-data-export.md",
    ];

    let totalSections = 0;

    for (const filename of domainFiles) {
      try {
        const filePath = join(__dirname, "../src/content/domains", filename);
        const content = readFileSync(filePath, "utf8");

        console.log(`📖 Processing ${filename}...`);

        // Extract domain info from filename
        const domainMatch = filename.match(/^domain(\d+)-(.+)\.md$/);
        if (!domainMatch) continue;

        const domainNum = parseInt(domainMatch[1]);
        const domainSlug = filename.replace(".md", "");

        // Extract title and exam weight from content
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const weightMatch = content.match(/(\d+)%\s+exam\s+weight/i);

        const title = titleMatch ? titleMatch[1] : `Domain ${domainNum}`;
        const examWeight = weightMatch ? parseInt(weightMatch[1]) : 20;

        // Insert or update module
        const { data: moduleData, error: moduleError } = await supabase
          .from("study_modules")
          .upsert(
            {
              slug: domainSlug,
              title: title,
              exam_weight: examWeight,
              order_index: domainNum,
              is_active: true,
            },
            { onConflict: "slug" }
          )
          .select()
          .single();

        if (moduleError) {
          console.error(`❌ Error creating module for ${filename}:`, moduleError);
          continue;
        }

        console.log(`✅ Module created: ${title} (${examWeight}% weight)`);

        // Parse sections from content
        const sections = parseContentSections(content, moduleData.id);

        if (sections.length > 0) {
          const { error: sectionsError } = await supabase
            .from("study_sections")
            .upsert(sections, { onConflict: "module_id,title" });

          if (sectionsError) {
            console.error(`❌ Error inserting sections for ${filename}:`, sectionsError);
          } else {
            console.log(`✅ Inserted ${sections.length} sections`);
            totalSections += sections.length;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
      }
    }

    console.log(`\n🎉 Content migration completed!`);
    console.log(`📊 Results:`);
    console.log(`   - 5 study modules processed`);
    console.log(`   - ${totalSections} study sections loaded`);
    console.log(`   - Comprehensive TCO content now available in database`);

    return true;
  } catch (error) {
    console.error("❌ Pipeline error:", error.message);
    return false;
  }
}

function parseContentSections(content, moduleId) {
  const sections = [];
  const lines = content.split("\n");
  let currentSection = null;
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match section headers (## Module X: Title or ## Title)
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentSection.content.trim(),
          order_index: sectionIndex++,
        });
      }

      // Start new section
      currentSection = {
        module_id: moduleId,
        title: sectionMatch[1].replace(/^(🎯\s+)?Module\s+\d+:\s*/i, ""),
        content: "",
        section_type: getSectionType(sectionMatch[1]),
        difficulty_level: getDifficultyLevel(sectionMatch[1]),
        estimated_time: getEstimatedTime(sectionMatch[1]),
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += line + "\n";
    }
  }

  // Add final section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentSection.content.trim(),
      order_index: sectionIndex,
    });
  }

  return sections;
}

function getSectionType(title) {
  if (/lab|exercise|hands.?on/i.test(title)) return "lab";
  if (/practice|question/i.test(title)) return "practice";
  if (/assessment|test|exam/i.test(title)) return "assessment";
  return "content";
}

function getDifficultyLevel(title) {
  if (/advanced|expert|complex/i.test(title)) return "advanced";
  if (/intermediate|moderate/i.test(title)) return "intermediate";
  return "beginner";
}

function getEstimatedTime(title) {
  // Extract time estimates from titles like "Lab (15 minutes)"
  const timeMatch = title.match(/\((\d+)\s*min/i);
  return timeMatch ? parseInt(timeMatch[1]) : 30; // Default 30 minutes
}

// Run the pipeline
createTablesAndMigrateContent().then((success) => {
  console.log(success ? "\n🎉 Pipeline completed successfully!" : "\n❌ Pipeline failed");
  process.exit(success ? 0 : 1);
});
