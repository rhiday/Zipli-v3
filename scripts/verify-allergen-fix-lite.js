#!/usr/bin/env node

/**
 * Lightweight allergen verification script - optimized for performance
 * Run with: node scripts/verify-allergen-fix-lite.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickVerify() {
  console.log('⚡ Running lightweight allergen verification...\n');

  try {
    // 1. Quick count check - very fast query
    console.log('📊 Quick health check...');
    const { count: totalCount } = await supabase
      .from('food_items')
      .select('*', { count: 'exact', head: true })
      .not('allergens', 'is', null);

    console.log(`Total items with allergens: ${totalCount || 0}`);

    // 2. Sample only 5 items for quick check (instead of fetching all)
    const { data: sampleItems, error } = await supabase
      .from('food_items')
      .select('id, name, allergens')
      .not('allergens', 'is', null)
      .limit(5); // Only 5 items for quick verification

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    // 3. Quick analysis
    let hasIssues = false;
    console.log('\n🔍 Sample check (5 items):');

    sampleItems?.forEach((item, index) => {
      const allergens = item.allergens;
      const isCorrect =
        typeof allergens === 'string' &&
        allergens.startsWith('{') &&
        allergens.endsWith('}') &&
        !allergens.includes('\\') &&
        !allergens.includes('["');

      console.log(`${index + 1}. ${item.name}: ${isCorrect ? '✅' : '⚠️'}`);

      if (!isCorrect) {
        hasIssues = true;
        console.log(`   Raw: ${allergens?.toString().substring(0, 50)}...`);
      }
    });

    // 4. Summary
    console.log('\n' + '='.repeat(40));
    if (hasIssues) {
      console.log('⚠️  Some items may need cleanup');
      console.log('Run the full verification for details:');
      console.log('  node scripts/verify-allergen-fix.js');
    } else {
      console.log('✅ Sample items look good!');
    }

    // 5. Quick Finnish allergen check (using SQL for performance)
    const { count: finnishCount } = await supabase
      .from('food_items')
      .select('*', { count: 'exact', head: true })
      .or(
        'allergens.ilike.%määritelty%,allergens.ilike.%gluteeniton%,allergens.ilike.%laktoositon%'
      );

    if (finnishCount && finnishCount > 0) {
      console.log(`\n🇫🇮 Found ${finnishCount} items with Finnish allergens`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run verification
quickVerify()
  .then(() => {
    console.log('\n✅ Quick verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
