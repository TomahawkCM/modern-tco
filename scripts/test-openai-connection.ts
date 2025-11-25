/**
 * Test OpenAI API Connection
 * Verifies the API key is valid and the service is accessible
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 OpenAI API Connection Test');
console.log('═══════════════════════════════════════════════════════\n');

if (!apiKey) {
  console.log('❌ NEXT_PUBLIC_OPENAI_API_KEY not found in .env.local\n');
  process.exit(1);
}

console.log('✅ API key configured');
console.log(`   Key prefix: ${apiKey.substring(0, 20)}...`);
console.log(`   Key length: ${apiKey.length} characters\n`);

async function testConnection() {
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    console.log('📡 Testing connection to OpenAI API...\n');

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Respond with exactly one word: SUCCESS' },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    console.log('✅ Connection successful!');
    console.log(`   Response: "${content}"`);
    console.log(`   Tokens used: ${tokensUsed}`);
    console.log(`   Model: ${response.model}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ OpenAI API is working correctly');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error: any) {
    console.log('❌ Connection failed!\n');
    console.log('Error details:');
    console.log(`   Type: ${error.constructor.name}`);
    console.log(`   Message: ${error.message}`);

    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }

    if (error.code) {
      console.log(`   Code: ${error.code}`);
    }

    console.log('\n📋 Common causes:\n');
    console.log('   1. Invalid API key - Key may be incorrect or expired');
    console.log('   2. Rate limit exceeded - Too many requests');
    console.log('   3. Quota exceeded - Free tier limit reached');
    console.log('   4. Network issue - Firewall or proxy blocking');
    console.log('   5. OpenAI service outage - Check status.openai.com\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ OpenAI API connection failed');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(1);
  }
}

testConnection();
