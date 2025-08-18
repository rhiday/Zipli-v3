#!/usr/bin/env node
// Quick test to verify Supabase connection

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count()', { count: 'exact', head: true });
    
    if (profileError) throw profileError;
    console.log('✓ Profiles table accessible');
    
    // Test donations table
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select('count()', { count: 'exact', head: true });
    
    if (donationError) throw donationError;
    console.log('✓ Donations table accessible');
    
    // Test requests table  
    const { data: requests, error: requestError } = await supabase
      .from('requests')
      .select('count()', { count: 'exact', head: true });
    
    if (requestError) throw requestError;
    console.log('✓ Requests table accessible');
    
    // Test food_items table
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('count()', { count: 'exact', head: true });
    
    if (foodError) throw foodError;
    console.log('✓ Food items table accessible');
    
    console.log('\n✅ All tables are accessible. Supabase connection successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();