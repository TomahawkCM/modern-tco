const { createClient } = require("@supabase/supabase-js");

// Test both project configurations
const configs = [
  {
    name: "Project qnwcwoutgarhqxlgsjzs (.env.local)",
    url: "https://qnwcwoutgarhqxlgsjzs.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4",
  },
  {
    name: "Project huvgbelulauauxvlqjvz (MCP)",
    url: "https://huvgbelulauauxvlqjvz.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmdiZWx1bGF1YXV4dmxxanZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2Njc4MywiZXhwIjoyMDcyMjQyNzgzfQ.example_key_here",
  },
];

async function testConnection(config) {
  console.log(`\n🔍 Testing ${config.name}...`);

  try {
    const supabase = createClient(config.url, config.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Test connection by listing tables
    const { data, error } = await supabase
      .rpc("get_schema", { schema_name: "public" })
      .select("*")
      .limit(1);

    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Connection successful!`);
    return true;
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Testing Supabase project connections...\n");

  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n✨ Using ${config.name} as primary project`);
      break;
    }
  }
}

main().catch(console.error);
