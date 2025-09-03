#!/usr/bin/env node

/**
 * Script to verify allergen data fixes in Supabase
 * Run with: node scripts/verify-allergen-fix.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parseAllergens } from '../src/lib/allergenUtils.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAllergenData() {
  console.log('🔍 Verifying allergen data in Supabase...\n');

  try {
    // 1. Fetch all food items with allergens
    console.log('📊 Fetching food items with allergens...');
    const { data: foodItems, error: fetchError } = await supabase
      .from('food_items')
      .select('id, name, allergens')
      .not('allergens', 'is', null)
      .limit(20); // Limit for testing

    if (fetchError) {
      console.error('❌ Error fetching food items:', fetchError);
      return;
    }

    console.log(
      `✅ Found ${foodItems?.length || 0} food items with allergens\n`
    );

    // 2. Analyze allergen data
    const issues = [];
    const correct = [];

    foodItems?.forEach((item) => {
      console.log(`\n📦 Item: ${item.name} (ID: ${item.id})`);
      console.log(`   Raw allergens:`, item.allergens);

      // Check if it's in correct PostgreSQL array format
      const isPostgresArray =
        typeof item.allergens === 'string' &&
        item.allergens.startsWith('{') &&
        item.allergens.endsWith('}');

      // Check for corruption indicators
      const hasCorruption =
        typeof item.allergens === 'string' &&
        (item.allergens.includes('\\') ||
          item.allergens.includes('["') ||
          item.allergens.includes('"]') ||
          item.allergens.includes('\\\"'));

      // Parse using our utility function
      const parsed = parseAllergens(item.allergens);
      console.log(`   Parsed result:`, parsed);

      if (hasCorruption) {
        issues.push({
          id: item.id,
          name: item.name,
          raw: item.allergens,
          parsed: parsed,
        });
        console.log(`   ⚠️  Status: CORRUPTED - needs cleanup`);
      } else if (!isPostgresArray && item.allergens !== '{}') {
        issues.push({
          id: item.id,
          name: item.name,
          raw: item.allergens,
          parsed: parsed,
        });
        console.log(`   ⚠️  Status: WRONG FORMAT - should be PostgreSQL array`);
      } else {
        correct.push({
          id: item.id,
          name: item.name,
          raw: item.allergens,
          parsed: parsed,
        });
        console.log(`   ✅ Status: CORRECT FORMAT`);
      }

      // Check for "Ei määritelty" specifically
      if (parsed.includes('Ei määritelty')) {
        console.log(`   🇫🇮 Contains Finnish allergen: "Ei määritelty"`);
      }
    });

    // 3. Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Correct format: ${correct.length} items`);
    console.log(`⚠️  Issues found: ${issues.length} items`);

    if (issues.length > 0) {
      console.log('\n🔧 Items needing cleanup:');
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.name} (ID: ${issue.id})`);
        console.log(`   Current: ${issue.raw}`);
        console.log(`   After parsing: [${issue.parsed.join(', ')}]`);
      });

      console.log('\n💡 To fix these issues:');
      console.log('1. Run the migration: supabase migration up');
      console.log('2. Or manually update using the parsed values shown above');
    } else {
      console.log('\n🎉 All allergen data is in correct format!');
    }

    // 4. Test specific Finnish allergen
    console.log('\n' + '='.repeat(60));
    console.log('🇫🇮 FINNISH ALLERGEN TEST');
    console.log('='.repeat(60));

    // Test creating a new item with Finnish allergens
    const testAllergens = ['Ei määritelty', 'Gluteeniton', 'Laktoositon'];
    const pgArrayFormat = `{${testAllergens.map((a) => `"${a}"`).join(',')}}`;

    console.log('Testing PostgreSQL array format:');
    console.log(`Input: ${pgArrayFormat}`);
    console.log(`Parsed: [${parseAllergens(pgArrayFormat).join(', ')}]`);

    // Test corrupted format that might exist in DB
    const corruptedFormat = JSON.stringify(testAllergens);
    console.log('\nTesting JSON stringified format (old):');
    console.log(`Input: ${corruptedFormat}`);
    console.log(`Parsed: [${parseAllergens(corruptedFormat).join(', ')}]`);

    // Test deeply nested corruption
    const deeplyCorrupted = JSON.stringify(JSON.stringify(testAllergens));
    console.log('\nTesting deeply corrupted format:');
    console.log(`Input: ${deeplyCorrupted}`);
    console.log(`Parsed: [${parseAllergens(deeplyCorrupted).join(', ')}]`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the verification
console.log('🚀 Starting allergen data verification...\n');
verifyAllergenData()
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
