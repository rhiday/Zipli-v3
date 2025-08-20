#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDgzNzYsImV4cCI6MjA2MTQ4NDM3Nn0.I2Qqp8BNeCxNHT9T03sbMROy_eKqXenj9QFibCmXdgk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRequestsTable() {
  console.log('🔍 Checking current requests table structure...');

  try {
    // Try to select from requests table to see current structure
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying requests table:', error);
      return;
    }

    if (requests && requests.length > 0) {
      console.log(
        '📋 Current table has these columns:',
        Object.keys(requests[0])
      );
    } else {
      console.log('📋 Requests table exists but is empty');
    }

    // Try to describe the table structure
    console.log('🔍 Trying to get table structure via SQL...');
    const { data: result, error: sqlError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'requests' }
    );

    if (sqlError) {
      console.log('ℹ️ Could not get table structure via RPC (expected)');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkRequestsTable();
