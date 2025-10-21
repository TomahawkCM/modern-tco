/**
 * Simple TCO Database Schema Deployment Script
 * Uses CommonJS syntax and direct Supabase client connection
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 TCO Schema Deployment Starting...');
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(
  `🔑 Service Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NOT FOUND'}`
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...');

  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test threw error:', err.message);
    return false;
  }
}

async function createTables() {
  console.log('\n🏗️  Creating Database Tables...');

  try {
    // Step 1: Create UUID extension
    console.log('📋 Creating UUID extension...');
    const { error: uuidError } = await supabase.rpc('exec_sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    });

    if (uuidError && !uuidError.message.includes('already exists')) {
      console.log('⚠️  UUID extension may need manual creation in Supabase Dashboard');
    } else {
      console.log('✅ UUID extension ready');
    }

    // Step 2: Create study_domains table
    console.log('📋 Creating study_domains table...');
    const domainsSQL = `
      CREATE TABLE IF NOT EXISTS study_domains (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        domain_number INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        exam_weight INTEGER NOT NULL,
        estimated_time_minutes INTEGER DEFAULT 180,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: domainsError } = await supabase.rpc('exec_sql', { query: domainsSQL });
    if (domainsError) {
      console.error('❌ Failed to create study_domains:', domainsError.message);
    } else {
      console.log('✅ study_domains table created');
    }

    // Step 3: Insert domain data using direct table insert
    console.log('📋 Inserting TCO certification domains...');
    const domains = [
      { domain_number: 1, title: 'Asking Questions', exam_weight: 22, estimated_time_minutes: 180 },
      {
        domain_number: 2,
        title: 'Refining Questions & Targeting',
        exam_weight: 23,
        estimated_time_minutes: 200,
      },
      { domain_number: 3, title: 'Taking Action', exam_weight: 15, estimated_time_minutes: 150 },
      {
        domain_number: 4,
        title: 'Navigation & Module Functions',
        exam_weight: 23,
        estimated_time_minutes: 180,
      },
      {
        domain_number: 5,
        title: 'Reporting & Data Export',
        exam_weight: 17,
        estimated_time_minutes: 160,
      },
    ];

    const { error: insertError } = await supabase.from('study_domains').upsert(domains, {
      onConflict: 'domain_number',
      ignoreDuplicates: false,
    });

    if (insertError) {
      console.error('❌ Failed to insert domains:', insertError.message);
    } else {
      console.log('✅ TCO certification domains inserted');
    }

    return true;
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
    return false;
  }
}

async function verifyDeployment() {
  console.log('\n🔍 Verifying Deployment...');

  try {
    const { data: domains, error } = await supabase
      .from('study_domains')
      .select('domain_number, title, exam_weight')
      .order('domain_number');

    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }

    console.log('✅ Verification successful!');
    console.log('📊 TCO Domains:', domains);
    return true;
  } catch (err) {
    console.error('❌ Verification threw error:', err.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🎯 Starting TCO Database Setup');

    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }

    // Create tables and data
    const tablesOk = await createTables();
    if (!tablesOk) {
      console.error('❌ Table creation failed');
      process.exit(1);
    }

    // Verify deployment
    const verifyOk = await verifyDeployment();
    if (!verifyOk) {
      console.error('❌ Verification failed');
      process.exit(1);
    }

    console.log('\n🎉 TCO Database Setup Completed Successfully!');
    console.log('📋 Next Steps:');
    console.log('  1. Check tables in Supabase Dashboard');
    console.log('  2. Run content migration for study modules');
    console.log('  3. Test React app database connectivity');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
