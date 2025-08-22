import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error(
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupFoodItems() {
  console.log('🧹 Starting food items cleanup...\n');

  try {
    // First, get count of existing food items
    const { count: initialCount } = await supabase
      .from('food_items')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Found ${initialCount} food items to delete\n`);

    if (initialCount === 0) {
      console.log('✅ No food items to clean up!');
      return;
    }

    // Get a sample of items to show what will be deleted
    const { data: sampleItems } = await supabase
      .from('food_items')
      .select('id, name, donor_id')
      .limit(5);

    console.log('Sample of items to be deleted:');
    sampleItems?.forEach((item) => {
      console.log(`  - ${item.name} (ID: ${item.id.substring(0, 8)}...)`);
    });

    if (initialCount && initialCount > 5) {
      console.log(`  ... and ${initialCount - 5} more items\n`);
    } else {
      console.log('');
    }

    // Ask for confirmation
    console.log(
      '⚠️  WARNING: This will delete ALL food items from the database!'
    );
    console.log('⚠️  This action cannot be undone!\n');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Delete all food items
    console.log('🗑️  Deleting all food items...');

    const { error, count } = await supabase
      .from('food_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)

    if (error) {
      console.error('❌ Error deleting food items:', error);
      process.exit(1);
    }

    // Verify deletion
    const { count: finalCount } = await supabase
      .from('food_items')
      .select('*', { count: 'exact', head: true });

    console.log('\n✅ Cleanup completed!');
    console.log(`📊 Deleted ${initialCount} food items`);
    console.log(`📊 Remaining food items: ${finalCount}`);

    // Also check for orphaned donations
    const { count: orphanedDonations } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true });

    if (orphanedDonations && orphanedDonations > 0) {
      console.log(
        `\n⚠️  Note: There are ${orphanedDonations} donations that may reference deleted food items.`
      );
      console.log('   Consider running a donation cleanup script as well.');
    }
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupFoodItems()
  .then(() => {
    console.log('\n🎉 Cleanup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
