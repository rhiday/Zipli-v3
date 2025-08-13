#!/usr/bin/env node

/**
 * Supabase Database Seeder
 * 
 * This script seeds your Supabase database with test data
 * Run: node scripts/seed-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

// For creating users, we need service role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.warn('⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set');
  console.warn('   Without it, we cannot create test users automatically');
  console.warn('   You will need to create users manually in Supabase Dashboard\n');
}

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use service role client for admin operations if available
const supabaseAdmin = SERVICE_ROLE_KEY 
  ? createClient(supabaseUrl, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Regular client for normal operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users to create
const TEST_USERS = [
  {
    email: 'hasan@zipli.test',
    password: 'password',
    profile: {
      full_name: 'Hasan Donor',
      role: 'food_donor',
      organization_name: 'Zipli Restaurant',
      contact_number: '+358 40 123 4567',
      address: 'Mannerheimintie 1, Helsinki',
    }
  },
  {
    email: 'maria@zipli.test',
    password: 'password',
    profile: {
      full_name: 'Maria Receiver',
      role: 'food_receiver',
      organization_name: 'Red Cross Helsinki',
      contact_number: '+358 40 234 5678',
      address: 'Kaisaniemenkatu 10, Helsinki',
    }
  },
  {
    email: 'city@zipli.test',
    password: 'password',
    profile: {
      full_name: 'City Admin',
      role: 'city',
      organization_name: 'Helsinki City',
      contact_number: '+358 40 345 6789',
      address: 'Pohjoisesplanadi 11-13, Helsinki',
    }
  },
  {
    email: 'terminal@zipli.test',
    password: 'password',
    profile: {
      full_name: 'Terminal Operator',
      role: 'terminals',
      organization_name: 'Helsinki Airport Terminal',
      contact_number: '+358 40 456 7890',
      address: 'Helsinki Airport, Vantaa',
    }
  },
  {
    email: 'alice@zipli.test',
    password: 'password',
    profile: {
      full_name: 'Alice Restaurant',
      role: 'food_donor',
      organization_name: "Alice's Kitchen",
      contact_number: '+358 40 567 8901',
      address: 'Aleksanterinkatu 52, Helsinki',
    }
  },
  {
    email: 'kirkko@zipli.test',
    password: 'password',
    profile: {
      full_name: 'Andreas Church',
      role: 'food_receiver',
      organization_name: 'Andreas Congregation',
      contact_number: '+358 40 678 9012',
      address: 'Vuorikatu 5, Helsinki',
    }
  },
];

// Food items to seed
const FOOD_ITEMS = [
  { name: 'Fresh Bread', description: 'Daily baked bread from our bakery', allergens: ['Wheat', 'Gluten'], image_url: '/images/bread.jpg' },
  { name: 'Vegetable Soup', description: 'Hearty vegetable soup with seasonal vegetables', allergens: ['Celery'], image_url: '/images/soup.jpg' },
  { name: 'Fresh Produce Box', description: 'Assorted seasonal fruits and vegetables', allergens: [], image_url: '/images/produce.jpg' },
  { name: 'Dairy Products', description: 'Milk, cheese, and yogurt close to expiry', allergens: ['Milk', 'Lactose'], image_url: '/images/dairy.jpg' },
  { name: 'Rice and Grains', description: 'Bulk rice, pasta, and other grain products', allergens: ['Gluten'], image_url: '/images/grains.jpg' },
  { name: 'Canned Goods', description: 'Assorted canned vegetables and fruits', allergens: [], image_url: '/images/canned.jpg' },
  { name: 'Fresh Salad Mix', description: 'Pre-washed salad greens ready to eat', allergens: [], image_url: '/images/salad.jpg' },
  { name: 'Meat Products', description: 'Frozen chicken, beef, and pork', allergens: [], image_url: '/images/meat.jpg' },
  { name: 'Fish and Seafood', description: 'Fresh and frozen fish', allergens: ['Fish', 'Shellfish'], image_url: '/images/fish.jpg' },
  { name: 'Baked Goods', description: 'Pastries, cakes, and cookies', allergens: ['Wheat', 'Eggs', 'Milk'], image_url: '/images/pastries.jpg' },
];

async function createTestUsers() {
  if (!supabaseAdmin) {
    console.log('⚠️  Skipping user creation (no service role key)');
    console.log('   Please create these users manually in Supabase Dashboard:\n');
    TEST_USERS.forEach(user => {
      console.log(`   Email: ${user.email}, Password: ${user.password}`);
    });
    console.log('');
    return [];
  }

  console.log('👤 Creating test users...');
  const createdUsers = [];

  for (const userData of TEST_USERS) {
    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.profile.full_name,
          role: userData.profile.role,
        }
      });

      if (authError) {
        if (authError.message?.includes('already exists')) {
          console.log(`   ⚠️  User ${userData.email} already exists`);
          // Get existing user
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users?.users?.find(u => u.email === userData.email);
          if (existingUser) {
            createdUsers.push({ ...userData, id: existingUser.id });
          }
        } else {
          console.error(`   ❌ Error creating ${userData.email}:`, authError.message);
        }
        continue;
      }

      console.log(`   ✅ Created user: ${userData.email}`);
      createdUsers.push({ ...userData, id: authUser.user.id });

      // Create or update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          email: userData.email,
          ...userData.profile
        });

      if (profileError) {
        console.error(`   ❌ Error creating profile for ${userData.email}:`, profileError.message);
      } else {
        console.log(`   ✅ Created profile for: ${userData.email}`);
      }

    } catch (error) {
      console.error(`   ❌ Error with ${userData.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function seedFoodItems() {
  console.log('\n🍎 Seeding food items...');
  
  const client = supabaseAdmin || supabase;
  const { data: existingItems } = await client
    .from('food_items')
    .select('name');

  const existingNames = new Set(existingItems?.map(item => item.name) || []);
  const newItems = FOOD_ITEMS.filter(item => !existingNames.has(item.name));

  if (newItems.length === 0) {
    console.log('   ℹ️  All food items already exist');
    return;
  }

  const { data, error } = await client
    .from('food_items')
    .insert(newItems)
    .select();

  if (error) {
    console.error('   ❌ Error seeding food items:', error.message);
    return;
  }

  console.log(`   ✅ Seeded ${data.length} food items`);
  return data;
}

async function seedDonations(users) {
  console.log('\n📦 Seeding donations...');
  
  const client = supabaseAdmin || supabase;
  
  // Get food items
  const { data: foodItems } = await client
    .from('food_items')
    .select('id, name');

  if (!foodItems || foodItems.length === 0) {
    console.log('   ⚠️  No food items found, skipping donations');
    return;
  }

  // Get donor users
  const { data: profiles } = await client
    .from('profiles')
    .select('id, email, role')
    .in('role', ['food_donor']);

  if (!profiles || profiles.length === 0) {
    console.log('   ⚠️  No donor profiles found, skipping donations');
    return;
  }

  const donations = [
    {
      food_item_id: foodItems.find(f => f.name === 'Fresh Bread')?.id,
      donor_id: profiles.find(p => p.email === 'hasan@zipli.test')?.id,
      quantity: 10,
      status: 'available',
      pickup_slots: [
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          start_time: '10:00:00',
          end_time: '12:00:00'
        }
      ],
    },
    {
      food_item_id: foodItems.find(f => f.name === 'Vegetable Soup')?.id,
      donor_id: profiles.find(p => p.email === 'alice@zipli.test')?.id,
      quantity: 5,
      status: 'available',
      pickup_slots: [
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          start_time: '14:00:00',
          end_time: '16:00:00'
        }
      ],
    },
    {
      food_item_id: foodItems.find(f => f.name === 'Fresh Produce Box')?.id,
      donor_id: profiles.find(p => p.email === 'hasan@zipli.test')?.id,
      quantity: 8,
      status: 'available',
      pickup_slots: [
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          start_time: '09:00:00',
          end_time: '11:00:00'
        }
      ],
    },
  ].filter(d => d.food_item_id && d.donor_id); // Only include valid donations

  if (donations.length === 0) {
    console.log('   ⚠️  Could not create donations (missing required data)');
    return;
  }

  const { data, error } = await client
    .from('donations')
    .insert(donations)
    .select();

  if (error) {
    console.error('   ❌ Error seeding donations:', error.message);
    return;
  }

  console.log(`   ✅ Seeded ${data.length} donations`);
}

async function seedRequests() {
  console.log('\n📋 Seeding requests...');
  
  const client = supabaseAdmin || supabase;
  
  // Get receiver users
  const { data: profiles } = await client
    .from('profiles')
    .select('id, email, role')
    .in('role', ['food_receiver']);

  if (!profiles || profiles.length === 0) {
    console.log('   ⚠️  No receiver profiles found, skipping requests');
    return;
  }

  const requests = [
    {
      user_id: profiles.find(p => p.email === 'maria@zipli.test')?.id,
      description: 'Need warm meals for 50 people at our shelter',
      people_count: 50,
      pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      pickup_start_time: '11:00:00',
      pickup_end_time: '13:00:00',
      status: 'active',
      is_recurring: false,
    },
    {
      user_id: profiles.find(p => p.email === 'kirkko@zipli.test')?.id,
      description: 'Weekly food assistance for 30 families',
      people_count: 30,
      pickup_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      pickup_start_time: '14:00:00',
      pickup_end_time: '16:00:00',
      status: 'active',
      is_recurring: true,
    },
  ].filter(r => r.user_id); // Only include valid requests

  if (requests.length === 0) {
    console.log('   ⚠️  Could not create requests (missing required data)');
    return;
  }

  const { data, error } = await client
    .from('requests')
    .insert(requests)
    .select();

  if (error) {
    console.error('   ❌ Error seeding requests:', error.message);
    return;
  }

  console.log(`   ✅ Seeded ${data.length} requests`);
}

async function main() {
  console.log('🌱 Starting Supabase database seeding...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  try {
    // Create test users (if we have service role key)
    const users = await createTestUsers();
    
    // Seed food items
    await seedFoodItems();
    
    // Seed donations and requests
    await seedDonations(users);
    await seedRequests();
    
    console.log('\n✨ Seeding complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. If users were not created automatically, create them in Supabase Dashboard');
    console.log('   2. Run the app with: npm run dev');
    console.log('   3. Test login with any of the test accounts (password: "password")');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
main().catch(console.error);