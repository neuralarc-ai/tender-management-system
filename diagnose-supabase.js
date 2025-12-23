#!/usr/bin/env node

/**
 * Supabase Connection Diagnostic Tool
 * Checks if Supabase is properly configured and accessible
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Supabase Connection Diagnostic\n');
console.log('='.repeat(50));

// Check 1: Environment Variables
console.log('\n1️⃣  Checking Environment Variables...');
console.log('-'.repeat(50));

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
  console.log('\n💡 Solution:');
  console.log('   1. Create a Supabase account at https://supabase.com');
  console.log('   2. Create a new project');
  console.log('   3. Get your URL from Project Settings → API');
  console.log('   4. Add it to .env.local file\n');
  process.exit(1);
} else {
  console.log(`✅ SUPABASE_URL found: ${SUPABASE_URL.substring(0, 30)}...`);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
  process.exit(1);
} else {
  console.log(`✅ SUPABASE_ANON_KEY found: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing!');
  process.exit(1);
} else {
  console.log(`✅ SUPABASE_SERVICE_KEY found: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
}

// Check 2: URL Format
console.log('\n2️⃣  Checking URL Format...');
console.log('-'.repeat(50));

const urlRegex = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
if (!urlRegex.test(SUPABASE_URL)) {
  console.error(`❌ Invalid Supabase URL format: ${SUPABASE_URL}`);
  console.log('\n💡 Expected format: https://your-project-id.supabase.co');
  console.log('   No trailing slashes or paths!\n');
  process.exit(1);
} else {
  console.log('✅ URL format is valid');
}

// Check 3: Network Connectivity
console.log('\n3️⃣  Testing Network Connectivity...');
console.log('-'.repeat(50));

async function testConnection() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ Successfully connected to Supabase!');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.error(`❌ Connection failed with status: ${response.status}`);
      const text = await response.text();
      console.error(`   Error: ${text}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error - Cannot reach Supabase');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Solutions:');
      console.log('   1. Check if the Supabase URL is correct');
      console.log('   2. Verify your Supabase project exists and is not paused');
      console.log('   3. Check your internet connection');
      console.log('   4. Try accessing the URL in your browser');
      console.log(`      Visit: ${SUPABASE_URL}`);
    }
    
    return false;
  }
}

// Check 4: Database Tables
console.log('\n4️⃣  Checking Database Tables...');
console.log('-'.repeat(50));

async function checkTables() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tenders?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Database tables accessible');
      const data = await response.json();
      console.log(`   Found ${data.length > 0 ? 'existing' : 'no'} tender records`);
      return true;
    } else if (response.status === 404) {
      console.error('❌ Table "tenders" not found');
      console.log('\n💡 You need to run the database migrations!');
      console.log('   See: supabase/SETUP_GUIDE.md');
      return false;
    } else {
      console.error(`❌ Database error: ${response.status}`);
      const text = await response.text();
      console.error(`   ${text}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking database: ${error.message}`);
    return false;
  }
}

// Run all checks
(async () => {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await checkTables();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Diagnostic Complete!\n');
  
  if (!connectionOk) {
    console.log('❌ CRITICAL: Fix Supabase connection first');
    console.log('\n📖 Quick Setup Guide:');
    console.log('   1. Go to https://supabase.com and sign up');
    console.log('   2. Create a new project (it takes 2-3 minutes)');
    console.log('   3. Go to Project Settings → API');
    console.log('   4. Copy URL and keys to .env.local');
    console.log('   5. Run this diagnostic again');
    console.log('\n   For detailed steps, see: supabase/SETUP_GUIDE.md\n');
  }
})();

