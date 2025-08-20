#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDgzNzYsImV4cCI6MjA2MTQ4NDM3Nn0.I2Qqp8BNeCxNHT9T03sbMROy_eKqXenj9QFibCmXdgk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupDonations() {
  console.log('🧹 Starting cleanup of donations...');

  try {
    // Get all donations to see what we're deleting
    const { data: donations, error: fetchError } = await supabase
      .from('donations')
      .select('id, food_item_id, status, created_at');

    if (fetchError) {
      console.error('❌ Error fetching donations:', fetchError);
      return;
    }

    if (!donations || donations.length === 0) {
      console.log('✅ No donations found to delete.');
      return;
    }

    console.log(`📦 Found ${donations.length} donations to delete:`);
    donations.forEach((donation) => {
      console.log(
        `  - Donation ID: ${donation.id}, Food Item: ${donation.food_item_id}, Status: ${donation.status}`
      );
    });

    // Delete all donations
    const { error: deleteError } = await supabase
      .from('donations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ Error deleting donations:', deleteError);
      return;
    }

    console.log('✅ Successfully deleted all donations!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanupDonations();
