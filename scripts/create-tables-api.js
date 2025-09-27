import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTables() {
  console.log("🚀 Creating tables via Supabase Admin API...\n");

  // Use the raw SQL execution via the REST API
  const createSQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS public.study_modules (
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

    CREATE TABLE IF NOT EXISTS public.study_sections (
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

    CREATE TABLE IF NOT EXISTS public.content_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'multiple_choice',
        options JSONB,
        correct_answer TEXT,
        explanation TEXT,
        difficulty_level TEXT DEFAULT 'intermediate',
        tags TEXT[],
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON public.study_sections(module_id);
    CREATE INDEX IF NOT EXISTS idx_content_questions_section_id ON public.content_questions(section_id);

    ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.content_questions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY IF NOT EXISTS "Public read access for study modules" ON public.study_modules FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Public read access for study sections" ON public.study_sections FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "Public read access for content questions" ON public.content_questions FOR SELECT USING (true);
  `;

  try {
    // Execute via raw HTTP request to Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: createSQL,
      }),
    });

    if (response.ok) {
      console.log("✅ Tables created successfully via REST API");
    } else {
      console.log("⚠️  REST API method not available, trying direct approach...");

      // Alternative: Try to test if tables exist by querying them
      const { error: testError } = await supabase
        .from("study_modules")
        .select("count", { count: "exact" });

      if (testError && testError.code === "PGRST106") {
        console.log("❌ Tables do not exist and cannot be created automatically");
        console.log("Please run the SQL script in Supabase Dashboard SQL Editor:");
        console.log("\n" + createSQL);
        return false;
      } else if (!testError) {
        console.log("✅ Tables already exist");
        return true;
      }
    }

    // Verify tables were created
    console.log("🔍 Verifying table creation...");

    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("count", { count: "exact" });

    if (modulesError) {
      console.error("❌ study_modules table verification failed:", modulesError.message);
      return false;
    }

    console.log("✅ study_modules table verified");

    const { data: sections, error: sectionsError } = await supabase
      .from("study_sections")
      .select("count", { count: "exact" });

    if (sectionsError) {
      console.error("❌ study_sections table verification failed:", sectionsError.message);
      return false;
    }

    console.log("✅ study_sections table verified");

    console.log("\n🎉 Database schema ready for content migration!");
    return true;
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    return false;
  }
}

// Run the function
createTables().then((success) => {
  if (success) {
    console.log("\n🚀 Ready to run: npm run migrate:content");
  } else {
    console.log("\n❌ Table creation failed - manual intervention required");
  }
  process.exit(success ? 0 : 1);
});
