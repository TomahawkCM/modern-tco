#!/usr/bin/env node
/**
 * Direct Schema Deployment using PostgREST API
 * Bypasses Supabase client limitations for direct SQL execution
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function executeSQL(sql) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required environment variables');
  }

  // Use PostgREST's rpc endpoint to execute SQL
  const rpcEndpoint = `${supabaseUrl}/rest/v1/rpc/exec_sql`;

  try {
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.log(`⚠️  exec_sql not available, trying manual table creation: ${error.message}`);
    return null;
  }
}

async function createTablesDirect() {
  console.log('🚀 Starting direct schema deployment...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20250904043019_create_tco_study_schema.sql'
  );
  const migrationSQL = await fs.readFile(migrationPath, 'utf8');

  console.log('📄 Migration file loaded successfully');

  // Since direct SQL execution isn't available through PostgREST by default,
  // let's create the tables using the REST API for table creation

  try {
    // First, let's check if tables exist by trying to query them
    const checkTables = async (tableName) => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=0`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    };

    console.log('🔍 Checking existing tables...');

    const tables = ['study_domains', 'study_modules', 'study_sections', 'practice_questions'];
    const tableStatus = {};

    for (const table of tables) {
      const exists = await checkTables(table);
      tableStatus[table] = exists;
      console.log(`   ${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    // If any tables are missing, we need to create them
    const missingTables = Object.entries(tableStatus)
      .filter(([_, exists]) => !exists)
      .map(([name, _]) => name);

    if (missingTables.length > 0) {
      console.log(`⚡ Missing tables: ${missingTables.join(', ')}`);
      console.log('📋 Schema needs to be deployed via Supabase dashboard or CLI');
      console.log(
        '🔗 Please visit your Supabase dashboard SQL editor to run the migration manually'
      );
      console.log(
        `   Dashboard URL: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}/sql/new`
      );

      // Output the SQL for manual execution
      console.log('\\n📄 SQL to execute in dashboard:');
      console.log('----------------------------------------');
      console.log(migrationSQL);
      console.log('----------------------------------------');
    } else {
      console.log('✅ All tables exist - schema is deployed!');
    }

    // Test basic connectivity
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/study_domains?select=count()`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          Prefer: 'count=exact',
        },
      });

      if (response.ok) {
        const count = response.headers.get('content-range');
        console.log('✅ Database connectivity test passed');
        console.log(`📊 Study domains count: ${count || 'available'}`);
      } else {
        console.log('⚠️  Could not test study_domains table');
      }
    } catch (error) {
      console.log('⚠️  Connectivity test failed:', error.message);
    }

    return tableStatus;
  } catch (error) {
    console.error('❌ Schema deployment failed:', error);
    throw error;
  }
}

// Run the deployment
if (require.main === module) {
  createTablesDirect()
    .then((status) => {
      const allTablesExist = Object.values(status).every((exists) => exists);
      if (allTablesExist) {
        console.log('🎉 Schema deployment verification completed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Manual schema deployment required via Supabase dashboard');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Deployment verification failed:', error);
      process.exit(1);
    });
}

module.exports = { createTablesDirect };
