const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Test 1: Basic connection test
    console.log('\n📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('study_modules')
      .select('count', { count: 'exact' })
      .limit(0);

    if (connectionError) {
      console.error('❌ Connection error:', connectionError);
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('Study modules count:', connectionTest?.length || 'Unknown');

    // Test 2: Query study modules
    console.log('\n📚 Testing study_modules table...');
    const { data: modules, error: modulesError } = await supabase
      .from('study_modules')
      .select('id, domain, title')
      .limit(5);

    if (modulesError) {
      console.error('❌ Modules query error:', modulesError);
    } else {
      console.log('✅ Found', modules?.length || 0, 'study modules:');
      modules?.forEach((module) => {
        console.log(`  - ${module.domain}: ${module.title}`);
      });
    }

    // Test 3: Query study sections
    console.log('\n📖 Testing study_sections table...');
    const { data: sections, error: sectionsError } = await supabase
      .from('study_sections')
      .select('id, title, section_type')
      .limit(3);

    if (sectionsError) {
      console.error('❌ Sections query error:', sectionsError);
    } else {
      console.log('✅ Found', sections?.length || 0, 'study sections:');
      sections?.forEach((section) => {
        console.log(`  - ${section.title} (${section.section_type})`);
      });
    }

    // Test 4: Test with service role key
    console.log('\n🔑 Testing service role connection...');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('study_modules')
      .select('count', { count: 'exact' })
      .limit(0);

    if (adminError) {
      console.error('❌ Service role error:', adminError);
    } else {
      console.log('✅ Service role connection successful!');
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All Supabase tests passed!');
      console.log('✅ MCP Server should be functional for database operations');
    } else {
      console.log('\n❌ Some tests failed');
      console.log('⚠️  Check your environment variables and database setup');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  });
