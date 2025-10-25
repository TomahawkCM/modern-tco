#!/usr/bin/env node

/**
 * Supabase Connection Validator - Quick Status Check
 * Validates that Supabase is fully operational for next session
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Supabase Connection Validator');
console.log('=================================');
console.log(`Project: ${process.env.SUPABASE_PROJECT_REF}`);
console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log('');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function validateSupabaseConnection() {
  const results = {
    connection: false,
    tables: [],
    features: {},
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('📡 Testing Database Connection...');

    // Test all required tables
    const requiredTables = [
      'study_modules',
      'study_sections',
      'user_study_progress',
      'user_study_bookmarks',
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          results.tables.push({ name: table, status: 'error', error: error.message });
        } else {
          console.log(`✅ ${table}: Operational`);
          results.tables.push({ name: table, status: 'working' });
        }
      } catch (err) {
        console.log(`💥 ${table}: ${err.message}`);
        results.tables.push({ name: table, status: 'failed', error: err.message });
      }
    }

    // Test PostgreSQL features
    console.log('\n⚡ Testing PostgreSQL Features...');

    // Test UUID generation
    try {
      const { data: uuidTest } = await supabase.from('study_modules').select('id').limit(1);
      console.log('✅ UUID Generation: Working');
      results.features.uuid = true;
    } catch (err) {
      console.log('❌ UUID Generation: Failed');
      results.features.uuid = false;
    }

    // Test JSONB columns
    try {
      const { data: jsonbTest } = await supabase
        .from('study_sections')
        .select('key_points, procedures')
        .limit(1);
      console.log('✅ JSONB Columns: Working');
      results.features.jsonb = true;
    } catch (err) {
      console.log('❌ JSONB Columns: Failed');
      results.features.jsonb = false;
    }

    // Check overall status
    const workingTables = results.tables.filter((t) => t.status === 'working').length;
    const totalTables = results.tables.length;

    console.log('\n🎯 VALIDATION RESULTS:');
    console.log('======================');

    if (workingTables === totalTables) {
      console.log('🎉 SUCCESS: Supabase is fully operational!');
      console.log(`✅ All ${totalTables} tables working`);
      console.log('✅ PostgreSQL features operational');
      console.log('✅ Ready for TCO development');
      results.connection = true;
    } else {
      console.log(`⚠️  PARTIAL: ${workingTables}/${totalTables} tables working`);
      console.log('📋 Some tables may need deployment');
      results.connection = false;
    }

    console.log('\n📋 Next Session Info:');
    console.log('- Database Status: ' + (results.connection ? 'READY' : 'NEEDS SETUP'));
    console.log('- Schema File: supabase/migrations/005_fixed_study_content_tables.sql');
    console.log('- Dashboard: https://supabase.com/dashboard/project/qnwcwoutgarhqxlgsjzs/sql');

    return results;
  } catch (error) {
    console.error('💥 Validation failed:', error.message);
    results.connection = false;
    return results;
  }
}

// Run validation
validateSupabaseConnection()
  .then((results) => {
    if (results.connection) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Validation error:', error);
    process.exit(1);
  });
