const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function createTCOSchema() {
  console.log('🚀 Creating TCO Study Platform Schema...\n');

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase configuration in .env.local');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log('✅ Supabase client initialized');
  console.log('   URL:', supabaseUrl);
  console.log('   Service Role Key:', serviceRoleKey.substring(0, 20) + '...\n');

  // Read the migration SQL file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20250904043019_create_tco_study_schema.sql'
  );
  let migrationSQL;

  try {
    migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration SQL loaded');
    console.log('   File:', migrationPath);
    console.log('   Size:', migrationSQL.length + ' characters\n');
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message);
    process.exit(1);
  }

  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`🔄 Executing ${statements.length} SQL statements...\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`   [${i + 1}/${statements.length}] ${statement.substring(0, 50)}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`   ❌ Error:`, error.message);
        // Continue with next statement for CREATE TABLE IF NOT EXISTS
        if (!error.message.includes('already exists')) {
          console.error('   Stopping execution due to error');
          break;
        }
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.error(`   ❌ Exception:`, err.message);
      // Try direct query execution as fallback
      try {
        const { data, error } = await supabase.from('sql').select('*').eq('query', statement);

        console.log(`   🔄 Fallback execution attempted`);
      } catch (fallbackErr) {
        console.error(`   ❌ Fallback failed:`, fallbackErr.message);
      }
    }
  }

  console.log('\n🔍 Verifying table creation...\n');

  // Verify tables were created
  const tablesToCheck = ['study_domains', 'study_modules', 'study_sections', 'practice_questions'];

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`   ✅ Table '${table}': exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`   ❌ Table '${table}': ${err.message}`);
    }
  }

  // Check study domains data
  console.log('\n📊 Checking study domains data...\n');
  try {
    const { data, error } = await supabase
      .from('study_domains')
      .select('domain_number, title, exam_weight');

    if (error) {
      console.log('   ❌ Failed to fetch study domains:', error.message);
    } else if (data && data.length > 0) {
      console.log('   ✅ Study domains populated:');
      data.forEach((domain) => {
        console.log(`      ${domain.domain_number}. ${domain.title} (${domain.exam_weight}%)`);
      });
    } else {
      console.log('   ⚠️  Study domains table exists but is empty');
    }
  } catch (err) {
    console.log('   ❌ Error checking study domains:', err.message);
  }

  console.log('\n🎉 Schema creation process completed!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Test the application at http://localhost:3000');
  console.log('3. Check that study modules load correctly\n');
}

// Run the schema creation
createTCOSchema().catch(console.error);
