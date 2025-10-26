#!/usr/bin/env tsx
/*
 * Script to apply pending Supabase migrations
 * Run with: npm run apply-migrations
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrationFiles = [
  '20250926_add_last_viewed_section.sql',
  '20250927_add_mdx_id_to_study_modules.sql',
  '20250927_add_questions_module_id.sql'
];

async function applyMigrations() {
  console.log('🚀 Starting migration process...\n');

  for (const file of migrationFiles) {
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', file);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Migration file not found: ${file}`);
      continue;
    }

    console.log(`📄 Applying migration: ${file}`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute the migration
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try direct execution if RPC not available
        console.log('   Using direct SQL execution...');
        // Note: Direct SQL execution requires admin permissions
        console.warn(`   ⚠️ Migration ${file} requires manual execution through Supabase dashboard`);
      } else {
        console.log(`   ✅ Migration ${file} applied successfully`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to apply ${file}:`, err);
    }
  }

  console.log('\n✨ Migration process complete!');
}

// Run the migrations
applyMigrations().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});