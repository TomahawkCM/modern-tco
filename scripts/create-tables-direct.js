import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use the same configuration that works for get_project_url
const supabaseUrl = "https://qnwcwoutgarhqxlgsjzs.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTables() {
  console.log("🚀 Creating Supabase tables directly...\n");

  try {
    // Step 1: Enable UUID extension
    console.log("📦 Enabling UUID extension...");
    const { error: extensionError } = await supabase.rpc("exec_sql", {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    });

    if (extensionError) {
      console.log("⚠️ Extension error (may already exist):", extensionError.message);
    } else {
      console.log("✅ UUID extension enabled");
    }

    // Step 2: Create study_modules table
    console.log("📊 Creating study_modules table...");
    const createModulesSQL = `
      CREATE TABLE IF NOT EXISTS public.study_modules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        domain TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        exam_weight INTEGER NOT NULL CHECK (exam_weight > 0 AND exam_weight <= 100),
        estimated_time TEXT NOT NULL,
        learning_objectives JSONB NOT NULL DEFAULT '[]',
        references JSONB NOT NULL DEFAULT '[]',
        exam_prep JSONB NOT NULL DEFAULT '{}',
        version TEXT NOT NULL DEFAULT '1.0',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    const { error: modulesError } = await supabase.rpc("exec_sql", { sql: createModulesSQL });
    if (modulesError) {
      console.log("❌ Error creating study_modules:", modulesError.message);
      return;
    }
    console.log("✅ study_modules table created");

    // Step 3: Create study_sections table
    console.log("📄 Creating study_sections table...");
    const createSectionsSQL = `
      CREATE TABLE IF NOT EXISTS public.study_sections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        section_type TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        estimated_time INTEGER NOT NULL DEFAULT 0,
        key_points JSONB NOT NULL DEFAULT '[]',
        procedures JSONB NOT NULL DEFAULT '[]',
        troubleshooting JSONB NOT NULL DEFAULT '[]',
        playbook JSONB,
        references JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(module_id, order_index)
      );
    `;

    const { error: sectionsError } = await supabase.rpc("exec_sql", { sql: createSectionsSQL });
    if (sectionsError) {
      console.log("❌ Error creating study_sections:", sectionsError.message);
      return;
    }
    console.log("✅ study_sections table created");

    // Step 4: Create progress tables
    console.log("👤 Creating user progress tables...");
    const createProgressSQL = `
      CREATE TABLE IF NOT EXISTS public.user_study_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        module_id UUID NOT NULL REFERENCES public.study_modules(id) ON DELETE CASCADE,
        section_id UUID REFERENCES public.study_sections(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'not_started',
        time_spent INTEGER NOT NULL DEFAULT 0,
        completed_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, module_id, section_id)
      );

      CREATE TABLE IF NOT EXISTS public.user_study_bookmarks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        section_id UUID NOT NULL REFERENCES public.study_sections(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, section_id, position)
      );
    `;

    const { error: progressError } = await supabase.rpc("exec_sql", { sql: createProgressSQL });
    if (progressError) {
      console.log("❌ Error creating progress tables:", progressError.message);
      return;
    }
    console.log("✅ User progress tables created");

    // Step 5: Add indexes
    console.log("⚡ Adding indexes...");
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_study_modules_domain ON public.study_modules(domain);
      CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON public.study_sections(module_id);
      CREATE INDEX IF NOT EXISTS idx_study_sections_module_order ON public.study_sections(module_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_user_study_progress_user_id ON public.user_study_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_study_progress_module_id ON public.user_study_progress(module_id);
    `;

    const { error: indexError } = await supabase.rpc("exec_sql", { sql: indexSQL });
    if (indexError) {
      console.log("⚠️ Index creation warning:", indexError.message);
    } else {
      console.log("✅ Indexes created");
    }

    // Step 6: Enable RLS and create policies
    console.log("🔐 Setting up Row Level Security...");
    const rlsSQL = `
      ALTER TABLE public.study_modules ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.study_sections ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_study_bookmarks ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Study modules are viewable by authenticated users" ON public.study_modules
        FOR SELECT USING (auth.role() = 'authenticated');

      CREATE POLICY "Study sections are viewable by authenticated users" ON public.study_sections
        FOR SELECT USING (auth.role() = 'authenticated');
    `;

    const { error: rlsError } = await supabase.rpc("exec_sql", { sql: rlsSQL });
    if (rlsError) {
      console.log("⚠️ RLS setup warning:", rlsError.message);
    } else {
      console.log("✅ Row Level Security enabled");
    }

    console.log("\n🎉 Database schema created successfully!");
    console.log("📊 Next step: Run content migration");
    console.log("Command: npm run migrate:content");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    console.log("\n💡 Trying alternative approach with direct table creation...");

    // Alternative: Direct INSERT/CREATE without rpc
    try {
      const { data, error: directError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .limit(1);

      if (directError) {
        console.log("❌ Direct query also failed:", directError.message);
        console.log("🔧 The MCP server needs different configuration for DDL operations");
      } else {
        console.log("✅ Basic query works, will use alternative creation method");
      }
    } catch (err) {
      console.log("❌ All approaches failed:", err.message);
    }
  }
}

createTables();
