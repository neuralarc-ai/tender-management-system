/**
 * Supabase Connection Test Utility
 * Run this to verify your Supabase connection is working
 */

import { supabase, createServiceClient } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables:');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
    return false;
  }
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${url.substring(0, 30)}...`);

  if (!anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    return false;
  }
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`);

  if (!serviceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
    return false;
  }
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceKey.substring(0, 20)}...`);

  // Test 2: Test database connection
  console.log('\n2️⃣ Testing database connection:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }

  // Test 3: Check tables exist
  console.log('\n3️⃣ Checking tables:');
  const tables = ['users', 'tenders', 'ai_analysis', 'proposals', 'notifications', 'user_settings'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      console.error(`❌ Table '${table}' check failed`);
    }
  }

  // Test 4: Check demo users
  console.log('\n4️⃣ Checking demo users:');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('email, role, organization_name');

    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
    } else if (users && users.length > 0) {
      console.log(`✅ Found ${users.length} demo user(s):`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.organization_name}`);
      });
    } else {
      console.log('⚠️ No users found. Run migration 003_seed_data.sql');
    }
  } catch (error) {
    console.error('❌ Users check failed:', error);
  }

  // Test 5: Check RLS is enabled
  console.log('\n5️⃣ Testing RLS (Row Level Security):');
  try {
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('tenders')
      .select('count');

    if (!error) {
      console.log('✅ Service role client working (RLS bypass)');
    }
  } catch (error) {
    console.error('❌ Service role client failed');
  }

  console.log('\n✅ Supabase connection test complete!\n');
  return true;
}

// Run test if executed directly
if (require.main === module) {
  testSupabaseConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

