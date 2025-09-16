#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 *
 * This script identifies and removes test data from the Supabase database
 * Run: node scripts/cleanup-test-data.js [--dry-run]
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// For admin operations, we need service role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('   This script requires admin privileges to delete data');
  process.exit(1);
}

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test user emails to identify test data
const TEST_USER_EMAILS = [
  'hasan@zipli.test',
  'maria@zipli.test',
  'city@zipli.test',
  'terminal@zipli.test',
  'alice@zipli.test',
  'kirkko@zipli.test',
];

// Test organization names that might appear in data
const TEST_ORGANIZATION_NAMES = [
  'Donor Test',
  'Zipli Restaurant',
  'Red Cross Helsinki',
  'Helsinki City',
  'Helsinki Airport Terminal',
  "Alice's Kitchen",
  'Andreas Congregation',
];

async function getTestUsers() {
  console.log('🔍 Finding test users...');

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('email', TEST_USER_EMAILS);

  if (error) {
    console.error('❌ Error fetching test users:', error.message);
    return [];
  }

  console.log(`   Found ${profiles.length} test users:`);
  profiles.forEach((profile) => {
    console.log(
      `   - ${profile.email} (${profile.full_name}) - ${profile.organization_name}`
    );
  });

  return profiles;
}

async function getTestDonations(testUserIds) {
  console.log('\n🍽️ Finding test donations...');

  const { data: donations, error } = await supabaseAdmin
    .from('donations')
    .select(
      `
      *,
      profiles!donations_donor_id_fkey(email, full_name, organization_name),
      food_items(name, description)
    `
    )
    .in('donor_id', testUserIds);

  if (error) {
    console.error('❌ Error fetching test donations:', error.message);
    return [];
  }

  console.log(`   Found ${donations.length} test donations:`);
  donations.forEach((donation) => {
    console.log(
      `   - ${donation.food_items?.name || donation.food_item || 'Unknown item'} by ${donation.profiles?.organization_name} (${donation.profiles?.email})`
    );
    console.log(
      `     Status: ${donation.status}, Created: ${new Date(donation.created_at).toLocaleDateString()}`
    );
  });

  return donations;
}

async function getTestRequests(testUserIds) {
  console.log('\n📋 Finding test requests...');

  const { data: requests, error } = await supabaseAdmin
    .from('requests')
    .select(
      `
      *,
      profiles!requests_user_id_fkey(email, full_name, organization_name)
    `
    )
    .in('user_id', testUserIds);

  if (error) {
    console.error('❌ Error fetching test requests:', error.message);
    return [];
  }

  console.log(`   Found ${requests.length} test requests:`);
  requests.forEach((request) => {
    console.log(
      `   - ${request.food_item || 'Unknown item'} by ${request.profiles?.organization_name} (${request.profiles?.email})`
    );
    console.log(
      `     Status: ${request.status}, Created: ${new Date(request.created_at).toLocaleDateString()}`
    );
  });

  return requests;
}

async function getTestFoodItems(testUserIds) {
  console.log('\n🥬 Finding test food items...');

  // Try simple query first since food_items might not have created_by foreign key
  const { data: foodItems, error } = await supabaseAdmin
    .from('food_items')
    .select('*');

  if (error) {
    console.error('❌ Error fetching food items:', error.message);
    return [];
  }

  // Filter items that look like test data
  const testFoodItems = foodItems.filter(
    (item) =>
      item.name?.toLowerCase().includes('test') ||
      item.description?.toLowerCase().includes('test') ||
      TEST_ORGANIZATION_NAMES.some(
        (org) => item.name?.includes(org) || item.description?.includes(org)
      )
  );

  console.log(
    `   Found ${testFoodItems.length} test food items out of ${foodItems.length} total:`
  );
  testFoodItems.forEach((item) => {
    console.log(`   - ${item.name}: ${item.description}`);
  });

  return testFoodItems;
}

async function getTestDataByOrganization() {
  console.log('\n🏢 Finding test data by organization names...');

  // Get all profiles that might be test organizations
  const { data: testOrgProfiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message);
    return { donations: [], requests: [] };
  }

  // Filter profiles that have test organization names
  const testOrgs = testOrgProfiles.filter(
    (profile) =>
      profile.organization_name?.includes('Test') ||
      profile.organization_name?.includes('Donor Test') ||
      profile.full_name?.includes('Test')
  );

  console.log(`   Found ${testOrgs.length} test organization profiles:`);
  testOrgs.forEach((org) => {
    console.log(
      `   - ${org.email} (${org.full_name}) - ${org.organization_name}`
    );
  });

  const testOrgIds = testOrgs.map((org) => org.id);

  // Get donations from these test organizations
  const { data: orgDonations, error: donationError } = await supabaseAdmin
    .from('donations')
    .select(
      `
      *,
      profiles!donations_donor_id_fkey(email, full_name, organization_name)
    `
    )
    .in('donor_id', testOrgIds);

  if (donationError) {
    console.error(
      '❌ Error fetching organization donations:',
      donationError.message
    );
  } else {
    console.log(
      `   Found ${orgDonations?.length || 0} donations from test organizations:`
    );
    orgDonations?.forEach((donation) => {
      console.log(
        `   - ${donation.food_item || 'Unknown item'} by ${donation.profiles?.organization_name}`
      );
    });
  }

  // Get requests from these test organizations
  const { data: orgRequests, error: requestError } = await supabaseAdmin
    .from('requests')
    .select(
      `
      *,
      profiles!requests_user_id_fkey(email, full_name, organization_name)
    `
    )
    .in('user_id', testOrgIds);

  if (requestError) {
    console.error(
      '❌ Error fetching organization requests:',
      requestError.message
    );
  } else {
    console.log(
      `   Found ${orgRequests?.length || 0} requests from test organizations:`
    );
    orgRequests?.forEach((request) => {
      console.log(
        `   - ${request.food_item || 'Unknown item'} by ${request.profiles?.organization_name}`
      );
    });
  }

  return {
    donations: orgDonations || [],
    requests: orgRequests || [],
    profiles: testOrgs,
  };
}

async function deleteTestData(
  donations,
  requests,
  foodItems,
  profiles,
  dryRun = true
) {
  if (dryRun) {
    console.log('\n🧪 DRY RUN - No data will be deleted');
    console.log(
      '   To actually delete data, run: node scripts/cleanup-test-data.js --execute'
    );
    return;
  }

  console.log('\n🗑️ Deleting test data...');

  // Delete donations
  if (donations.length > 0) {
    console.log(`   Deleting ${donations.length} donations...`);
    const { error: donationsError } = await supabaseAdmin
      .from('donations')
      .delete()
      .in(
        'id',
        donations.map((d) => d.id)
      );

    if (donationsError) {
      console.error('   ❌ Error deleting donations:', donationsError.message);
    } else {
      console.log('   ✅ Donations deleted');
    }
  }

  // Delete requests
  if (requests.length > 0) {
    console.log(`   Deleting ${requests.length} requests...`);
    const { error: requestsError } = await supabaseAdmin
      .from('requests')
      .delete()
      .in(
        'id',
        requests.map((r) => r.id)
      );

    if (requestsError) {
      console.error('   ❌ Error deleting requests:', requestsError.message);
    } else {
      console.log('   ✅ Requests deleted');
    }
  }

  // Delete food items
  if (foodItems.length > 0) {
    console.log(`   Deleting ${foodItems.length} food items...`);
    const { error: foodItemsError } = await supabaseAdmin
      .from('food_items')
      .delete()
      .in(
        'id',
        foodItems.map((f) => f.id)
      );

    if (foodItemsError) {
      console.error('   ❌ Error deleting food items:', foodItemsError.message);
    } else {
      console.log('   ✅ Food items deleted');
    }
  }

  // Optionally delete test user profiles
  console.log('\n❓ Keep test user accounts for future testing?');
  console.log('   Test user profiles will be preserved');
  console.log('   To delete test users entirely, run with --delete-users flag');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  const deleteUsers = args.includes('--delete-users');

  console.log('🧹 Test Data Cleanup Script');
  console.log('==============================\n');

  try {
    // Get test users
    const testUsers = await getTestUsers();
    if (testUsers.length === 0) {
      console.log('✅ No test users found - database is clean!');
      return;
    }

    const testUserIds = testUsers.map((user) => user.id);

    // Get all test data
    const donations = await getTestDonations(testUserIds);
    const requests = await getTestRequests(testUserIds);
    const foodItems = await getTestFoodItems(testUserIds);
    const orgData = await getTestDataByOrganization();

    // Combine all data for comprehensive cleanup
    const allDonations = [...donations, ...orgData.donations];
    const allRequests = [...requests, ...orgData.requests];
    const allTestProfiles = [...testUsers, ...orgData.profiles];

    // Remove duplicates
    const uniqueDonations = allDonations.filter(
      (donation, index, self) =>
        index === self.findIndex((d) => d.id === donation.id)
    );
    const uniqueRequests = allRequests.filter(
      (request, index, self) =>
        index === self.findIndex((r) => r.id === request.id)
    );
    const uniqueProfiles = allTestProfiles.filter(
      (profile, index, self) =>
        index === self.findIndex((p) => p.id === profile.id)
    );

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Test Users: ${uniqueProfiles.length}`);
    console.log(`   Test Donations: ${uniqueDonations.length}`);
    console.log(`   Test Requests: ${uniqueRequests.length}`);
    console.log(`   Test Food Items: ${foodItems.length}`);

    if (
      uniqueDonations.length === 0 &&
      uniqueRequests.length === 0 &&
      foodItems.length === 0
    ) {
      console.log('\n✅ No test data found - database is clean!');
      return;
    }

    // Delete or show what would be deleted
    await deleteTestData(
      uniqueDonations,
      uniqueRequests,
      foodItems,
      uniqueProfiles,
      dryRun
    );

    if (dryRun) {
      console.log('\n🎯 Next steps:');
      console.log('   1. Review the test data listed above');
      console.log('   2. Run with --execute flag to delete the data:');
      console.log('      node scripts/cleanup-test-data.js --execute');
    } else {
      console.log('\n✅ Test data cleanup completed!');
      console.log('   Check your terminal dashboard - it should now be clean');
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
