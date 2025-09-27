// Direct schema creation with service role key - FULL DATABASE ACCESS
require("dotenv").config({ path: ".env.local" });
const https = require("https");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

console.log("🚀 DIRECT SCHEMA CREATION WITH SERVICE ROLE ACCESS");
console.log("URL:", SUPABASE_URL);
console.log("Project:", PROJECT_REF);
console.log(
  "Service Role Key:",
  SERVICE_ROLE_KEY ? `${SERVICE_ROLE_KEY.slice(0, 20)}...` : "MISSING"
);

// DDL statements to execute
const ddlStatements = [
  'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',

  `CREATE TABLE IF NOT EXISTS study_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    exam_weight INTEGER NOT NULL,
    estimated_time_minutes INTEGER DEFAULT 180,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS study_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    learning_objectives TEXT[],
    section_number INTEGER,
    estimated_time_minutes INTEGER DEFAULT 30,
    difficulty_level TEXT DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS study_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES study_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS practice_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_id UUID NOT NULL REFERENCES study_domains(id) ON DELETE CASCADE,
    module_id UUID REFERENCES study_modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty_level TEXT DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  "CREATE INDEX IF NOT EXISTS idx_study_modules_domain_id ON study_modules(domain_id);",
  "CREATE INDEX IF NOT EXISTS idx_study_sections_module_id ON study_sections(module_id);",
  "CREATE INDEX IF NOT EXISTS idx_practice_questions_domain_id ON practice_questions(domain_id);",
  "CREATE INDEX IF NOT EXISTS idx_practice_questions_module_id ON practice_questions(module_id);",

  `INSERT INTO study_domains (domain_number, title, exam_weight, estimated_time_minutes) VALUES
    (1, 'Asking Questions', 22, 180),
    (2, 'Refining Questions & Targeting', 23, 200), 
    (3, 'Taking Action', 15, 150),
    (4, 'Navigation & Module Functions', 23, 180),
    (5, 'Reporting & Data Export', 17, 160)
  ON CONFLICT (domain_number) DO UPDATE SET
    title = EXCLUDED.title,
    exam_weight = EXCLUDED.exam_weight,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes,
    updated_at = NOW();`,

  "ALTER TABLE study_domains ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE study_modules ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE study_sections ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;",

  'CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_domains FOR SELECT USING (true);',
  'CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_modules FOR SELECT USING (true);',
  'CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_sections FOR SELECT USING (true);',
  'CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON practice_questions FOR SELECT USING (true);',
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: "/rest/v1/rpc/query",
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        Prefer: "return=minimal",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on("error", (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Alternative: Direct PostgreSQL connection approach
async function executeDirectSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = sql;

    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: "/rest/v1/",
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/sql",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data: data,
        });
      });
    });

    req.on("error", (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function createSchema() {
  console.log("\n📊 Executing DDL statements with SERVICE ROLE access...");

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < ddlStatements.length; i++) {
    const sql = ddlStatements[i];
    console.log(`\n[${i + 1}/${ddlStatements.length}] Executing: ${sql.substring(0, 50)}...`);

    // Try direct SQL approach first
    let result = await executeDirectSQL(sql);

    if (result.success) {
      console.log("   ✅ SUCCESS");
      successCount++;
    } else {
      console.log(`   ❌ FAILED (${result.status}): ${result.data || result.error}`);

      // Try RPC approach as fallback
      console.log("   🔄 Trying RPC approach...");
      result = await executeSQL(sql);

      if (result.success) {
        console.log("   ✅ SUCCESS (RPC)");
        successCount++;
      } else {
        console.log(`   ❌ FAILED (RPC): ${result.error}`);
        errorCount++;
      }
    }
  }

  console.log(`\n🎯 SCHEMA CREATION COMPLETE`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (successCount > 0) {
    console.log("\n🔍 Verifying table creation...");
    // Try to query the tables
    const verifySQL =
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'study_%'";
    const verifyResult = await executeDirectSQL(verifySQL);

    if (verifyResult.success) {
      console.log("🎉 TABLES CREATED SUCCESSFULLY!");
      console.log("Tables:", verifyResult.data);
    } else {
      console.log("⚠️  Tables may have been created but verification failed");
    }
  }
}

if (!SERVICE_ROLE_KEY) {
  console.log("❌ SERVICE_ROLE_KEY not found in environment");
  process.exit(1);
}

createSchema().catch(console.error);
