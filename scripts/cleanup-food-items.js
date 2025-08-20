#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDgzNzYsImV4cCI6MjA2MTQ4NDM3Nn0.I2Qqp8BNeCxNHT9T03sbMROy_eKqXenj9QFibCmXdgk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupFoodItems() {
  console.log('🧹 Starting cleanup of food items...');

  try {
    // First, get all food items to see what we're deleting
    const { data: foodItems, error: fetchError } = await supabase
      .from('food_items')
      .select('id, name, created_at');

    if (fetchError) {
      console.error('❌ Error fetching food items:', fetchError);
      return;
    }

    if (!foodItems || foodItems.length === 0) {
      console.log('✅ No food items found to delete.');
      return;
    }

    console.log(`📦 Found ${foodItems.length} food items to delete:`);
    foodItems.forEach((item) => {
      console.log(`  - ${item.name} (ID: ${item.id})`);
    });

    // Delete all food items
    const { error: deleteError } = await supabase
      .from('food_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ Error deleting food items:', deleteError);
      return;
    }

    console.log('✅ Successfully deleted all food items!');

    // Also check if there are any donations that need cleanup
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('id, food_item_id, created_at');

    if (donationsError) {
      console.error('❌ Error fetching donations:', donationsError);
      return;
    }

    if (donations && donations.length > 0) {
      console.log(
        `⚠️  Found ${donations.length} donations that may reference deleted food items.`
      );
      console.log('   These donations may need to be cleaned up as well.');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
cleanupFoodItems();
