import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrphanedDonations() {
  console.log('🔍 Checking for orphaned donations...\n');

  try {
    // Get all donations
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('*');

    if (donationsError) {
      console.error('❌ Error fetching donations:', donationsError);
      return;
    }

    console.log(`📊 Found ${donations?.length || 0} donations in database`);

    if (!donations || donations.length === 0) {
      console.log('✅ No donations found - nothing to check!');
      return;
    }

    // Get all food items (should be 0 after cleanup)
    const { data: foodItems, error: foodItemsError } = await supabase
      .from('food_items')
      .select('*');

    if (foodItemsError) {
      console.error('❌ Error fetching food items:', foodItemsError);
      return;
    }

    console.log(`📊 Found ${foodItems?.length || 0} food items in database\n`);

    // Check for orphaned donations
    const orphanedDonations = donations.filter((donation) => {
      const hasMatchingFoodItem = foodItems?.some(
        (item) => item.id === donation.food_item_id
      );
      return !hasMatchingFoodItem;
    });

    console.log(`⚠️  Found ${orphanedDonations.length} orphaned donations`);

    if (orphanedDonations.length > 0) {
      console.log('\nOrphaned donations details:');
      orphanedDonations.slice(0, 5).forEach((donation) => {
        console.log(`  - Donation ID: ${donation.id.substring(0, 8)}...`);
        console.log(
          `    Food Item ID: ${donation.food_item_id.substring(0, 8)}... (MISSING)`
        );
        console.log(`    Donor ID: ${donation.donor_id.substring(0, 8)}...`);
        console.log(`    Status: ${donation.status}`);
        console.log('');
      });

      if (orphanedDonations.length > 5) {
        console.log(
          `    ... and ${orphanedDonations.length - 5} more orphaned donations\n`
        );
      }

      console.log('💡 Impact on UI:');
      console.log(
        '   - These donations will cause errors when UI tries to display food item details'
      );
      console.log(
        '   - Users may see broken donation cards or missing food information'
      );
      console.log(
        '   - Database joins between donations and food_items will fail'
      );
      console.log('\n💡 Recommendation:');
      console.log('   - Delete these orphaned donations to prevent UI errors');
      console.log('   - Or create a cleanup script for donations as well');
    } else {
      console.log('✅ No orphaned donations found!');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkOrphanedDonations();
