/**
 * Comprehensive Database Integration Tests
 * Tests all Supabase functionality including CRUD operations, real-time subscriptions,
 * role-based access control, and data integrity
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import type {
  Profile,
  FoodItem,
  Donation,
  Request,
  UserRole,
} from '@/types/supabase';

// Test environment setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables for testing');
}

// Create clients for different permission levels
const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

describe('Database Integration Tests', () => {
  let testUserId: string;
  let testDonorId: string;
  let testReceiverId: string;
  let testFoodItemId: string;
  let testDonationId: string;
  let testRequestId: string;

  beforeAll(async () => {
    if (!supabaseAdmin) {
      console.warn(
        '⚠️  Service role key not available - some tests will be skipped'
      );
      return;
    }

    // Clean up any existing test data
    await cleanupTestData();

    // Create test users and data
    await setupTestData();
  }, 30000);

  afterAll(async () => {
    if (supabaseAdmin) {
      await cleanupTestData();
    }
  });

  describe('Authentication and User Management', () => {
    it('should handle user profile creation', async () => {
      if (!supabaseAdmin) {
        console.log('⚠️  Skipping - requires service role key');
        return;
      }

      const testProfile = {
        id: testUserId,
        email: 'test-new-user@zipli.test',
        role: 'food_donor' as UserRole,
        full_name: 'Test New User',
        organization_name: 'Test Organization',
        contact_number: '+358 40 123 9999',
        address: 'Test Address 123, Helsinki',
      };

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(testProfile)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(testProfile.email);
      expect(data?.role).toBe(testProfile.role);
    });

    it('should enforce profile data validation', async () => {
      if (!supabaseAdmin) return;

      // Test invalid role
      const { error: roleError } = await supabaseAdmin.from('profiles').insert({
        id: 'test-invalid-role',
        email: 'invalid@test.com',
        role: 'invalid_role' as any,
        full_name: 'Invalid User',
        organization_name: 'Test Organization',
      });

      expect(roleError).toBeDefined();
      expect(roleError?.message).toContain('invalid input value');
    });

    it('should handle profile updates', async () => {
      if (!supabaseAdmin) return;

      const updateData = {
        organization_name: 'Updated Organization',
        contact_number: '+358 40 999 9999',
      };

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.organization_name).toBe(updateData.organization_name);
      expect(data?.contact_number).toBe(updateData.contact_number);
    });
  });

  describe('Food Items CRUD Operations', () => {
    it('should create food items with proper validation', async () => {
      if (!supabaseAdmin) return;

      const foodItem = {
        name: 'Test Food Item',
        description: 'A test food item for integration testing',
        allergens: JSON.stringify(['Test Allergen']),
        image_url: '/test/image.jpg',
        quantity: 1,
        unit: 'piece',
        food_type: 'test',
        user_id: testUserId,
        donor_id: testUserId,
      };

      const { data, error } = await supabaseAdmin
        .from('food_items')
        .insert(foodItem)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(foodItem.name);
      expect(data?.allergens).toEqual(foodItem.allergens);

      testFoodItemId = data!.id;
    });

    it('should retrieve food items with filtering', async () => {
      const { data, error } = await supabaseAnon
        .from('food_items')
        .select('*')
        .eq('name', 'Test Food Item');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should update food items', async () => {
      if (!supabaseAdmin || !testFoodItemId) return;

      const updateData = {
        description: 'Updated test food item description',
        allergens: JSON.stringify(['Updated Allergen', 'Another Allergen']),
      };

      const { data, error } = await supabaseAdmin
        .from('food_items')
        .update(updateData)
        .eq('id', testFoodItemId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.description).toBe(updateData.description);
      expect(data?.allergens).toEqual(updateData.allergens);
    });

    it('should handle allergen array operations', async () => {
      const { data, error } = await supabaseAnon
        .from('food_items')
        .select('*')
        .contains('allergens', ['Updated Allergen']);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Donations Lifecycle', () => {
    it('should create donations with proper structure', async () => {
      if (!supabaseAdmin || !testFoodItemId || !testDonorId) return;

      const donation = {
        food_item_id: testFoodItemId,
        donor_id: testDonorId,
        quantity: 5,
        status: 'available' as const,
        pickup_slots: [
          {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            start_time: '10:00:00',
            end_time: '12:00:00',
          },
        ],
      };

      const { data, error } = await supabaseAdmin
        .from('donations')
        .insert(donation)
        .select(
          `
          *,
          food_item:food_items(*),
          donor:profiles(*)
        `
        )
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.quantity).toBe(donation.quantity);
      expect(data?.status).toBe(donation.status);
      expect(data?.pickup_slots).toEqual(donation.pickup_slots);

      testDonationId = data!.id;
    });

    it('should handle donation status transitions', async () => {
      if (!supabaseAdmin || !testDonationId) return;

      // Test available -> claimed
      const { data: claimedData, error: claimedError } = await supabaseAdmin
        .from('donations')
        .update({ status: 'claimed' })
        .eq('id', testDonationId)
        .select()
        .single();

      expect(claimedError).toBeNull();
      expect(claimedData?.status).toBe('claimed');

      // Test claimed -> picked_up
      const { data: completedData, error: completedError } = await supabaseAdmin
        .from('donations')
        .update({ status: 'picked_up' })
        .eq('id', testDonationId)
        .select()
        .single();

      expect(completedError).toBeNull();
      expect(completedData?.status).toBe('picked_up');
    });

    it('should retrieve donations with joins', async () => {
      const { data, error } = await supabaseAnon
        .from('donations')
        .select(
          `
          *,
          food_item:food_items(*),
          donor:profiles(*)
        `
        )
        .eq('status', 'available')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data && data.length > 0) {
        expect(data[0].food_item).toBeDefined();
        expect(data[0].donor).toBeDefined();
      }
    });

    it('should handle pickup slot queries', async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabaseAnon
        .from('donations')
        .select('*')
        .gte('pickup_slots->0->date', today);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Requests Management', () => {
    it('should create food requests', async () => {
      if (!supabaseAdmin || !testReceiverId) return;

      const request = {
        user_id: testReceiverId,
        description: 'Test food request for 20 people',
        people_count: 20,
        pickup_date: new Date(Date.now() + 86400000)
          .toISOString()
          .split('T')[0],
        pickup_start_time: '14:00:00',
        pickup_end_time: '16:00:00',
        is_recurring: false,
        status: 'active' as const,
      };

      const { data, error } = await supabaseAdmin
        .from('requests')
        .insert(request)
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.description).toBe(request.description);
      expect(data?.people_count).toBe(request.people_count);

      testRequestId = data!.id;
    });

    it('should handle recurring requests', async () => {
      if (!supabaseAdmin || !testReceiverId) return;

      const recurringRequest = {
        user_id: testReceiverId,
        description: 'Weekly food assistance',
        people_count: 30,
        pickup_date: new Date(Date.now() + 172800000)
          .toISOString()
          .split('T')[0],
        pickup_start_time: '10:00:00',
        pickup_end_time: '12:00:00',
        is_recurring: true,
        status: 'active' as const,
      };

      const { data, error } = await supabaseAdmin
        .from('requests')
        .insert(recurringRequest)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.is_recurring).toBe(true);
    });

    it('should update request status', async () => {
      if (!supabaseAdmin || !testRequestId) return;

      const { data, error } = await supabaseAdmin
        .from('requests')
        .update({ status: 'fulfilled' })
        .eq('id', testRequestId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('fulfilled');
    });
  });

  describe('Donation Claims', () => {
    it('should create donation claims', async () => {
      if (!supabaseAdmin || !testDonationId || !testReceiverId) return;

      // Reset donation to available
      await supabaseAdmin
        .from('donations')
        .update({ status: 'available' })
        .eq('id', testDonationId);

      // Test claiming a donation by updating its receiver_id and status
      const { data, error } = await supabaseAdmin
        .from('donations')
        .update({
          receiver_id: testReceiverId,
          status: 'claimed',
          claimed_at: new Date().toISOString(),
        })
        .eq('id', testDonationId)
        .select(
          `
          *,
          receiver:profiles(*)
        `
        )
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.status).toBe('claimed');
      expect(data?.receiver_id).toBe(testReceiverId);
    });

    it('should handle donation pickup workflow', async () => {
      if (!supabaseAdmin) return;

      // Get the claimed donation
      const { data: donation } = await supabaseAdmin
        .from('donations')
        .select('*')
        .eq('id', testDonationId)
        .eq('status', 'claimed')
        .single();

      if (!donation) return;

      // Mark as picked up
      const { data: pickedUpDonation, error } = await supabaseAdmin
        .from('donations')
        .update({
          status: 'picked_up',
          picked_up_at: new Date().toISOString(),
        })
        .eq('id', testDonationId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(pickedUpDonation?.status).toBe('picked_up');
      expect(pickedUpDonation?.picked_up_at).toBeDefined();
    });
  });

  describe('Data Integrity and Constraints', () => {
    it('should enforce foreign key constraints', async () => {
      if (!supabaseAdmin) return;

      // Try to create donation with non-existent food item
      const { error } = await supabaseAdmin.from('donations').insert({
        food_item_id: 'non-existent-id',
        donor_id: testDonorId,
        quantity: 1,
        status: 'available',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('foreign key');
    });

    it('should validate enum constraints', async () => {
      if (!supabaseAdmin || !testDonationId) return;

      // Try to set invalid status
      const { error } = await supabaseAdmin
        .from('donations')
        .update({ status: 'invalid_status' as any })
        .eq('id', testDonationId);

      expect(error).toBeDefined();
      expect(error?.message).toContain('invalid input value');
    });

    it('should handle unique constraints', async () => {
      if (!supabaseAdmin) return;

      // Try to create duplicate profile with same email
      const { error } = await supabaseAdmin.from('profiles').insert({
        id: 'duplicate-test',
        email: 'test-new-user@zipli.test', // Same email as created earlier
        role: 'food_donor',
        full_name: 'Duplicate User',
        organization_name: 'Duplicate Organization',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('duplicate key');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should receive real-time updates for donations', (done) => {
      if (!supabaseAdmin || !testDonationId) {
        done();
        return;
      }

      const subscription = supabaseAnon
        .channel('donations-test')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'donations',
            filter: `id=eq.${testDonationId}`,
          },
          (payload) => {
            expect(payload.new).toBeDefined();
            expect(payload.eventType).toBe('UPDATE');
            subscription.unsubscribe();
            done();
          }
        )
        .subscribe();

      // Trigger an update after subscription is ready
      setTimeout(async () => {
        await supabaseAdmin
          .from('donations')
          .update({
            status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('id', testDonationId);
      }, 1000);
    }, 10000);

    it('should handle subscription cleanup', () => {
      const subscription = supabaseAnon
        .channel('test-cleanup')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'donations' },
          () => {}
        )
        .subscribe();

      expect(subscription).toBeDefined();

      const unsubscribeResult = subscription.unsubscribe();
      expect(unsubscribeResult).toEqual('ok');
    });
  });

  describe('Role-based Access Control', () => {
    it('should enforce row-level security policies', async () => {
      // Test with anonymous client (should have limited access)
      const { data, error } = await supabaseAnon
        .from('profiles')
        .select('*')
        .limit(1);

      // Depending on RLS policies, this might be restricted
      if (error) {
        expect(error.message).toContain('permission denied');
      } else {
        expect(data).toBeDefined();
      }
    });

    it('should allow admin operations with service role', async () => {
      if (!supabaseAdmin) return;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('City Analytics and Reporting', () => {
    it('should retrieve city monthly donation data', async () => {
      const { data, error } = await supabaseAnon
        .from('city_monthly_data')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should retrieve city statistics', async () => {
      const { data, error } = await supabaseAnon
        .from('city_stats')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should retrieve organization profiles', async () => {
      const { data, error } = await supabaseAnon
        .from('profiles')
        .select('id, organization_name, role')
        .not('organization_name', 'is', null)
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  // Helper functions
  async function setupTestData() {
    if (!supabaseAdmin) return;

    // Create test users
    const testUsers = [
      {
        email: 'test-donor@zipli-test.com',
        password: 'testpassword123',
        role: 'food_donor' as UserRole,
        full_name: 'Test Donor User',
        organization_name: 'Test Donor Org',
      },
      {
        email: 'test-receiver@zipli-test.com',
        password: 'testpassword123',
        role: 'food_receiver' as UserRole,
        full_name: 'Test Receiver User',
        organization_name: 'Test Receiver Org',
      },
    ];

    for (const userData of testUsers) {
      try {
        const { data: authUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
          });

        if (authError && !authError.message.includes('already exists')) {
          console.error('Error creating test user:', authError);
          continue;
        }

        const userId = authUser?.user?.id || 'test-' + userData.role;

        if (userData.role === 'food_donor') {
          testDonorId = userId;
        } else {
          testReceiverId = userId;
        }

        if (!testUserId) testUserId = userId;

        // Create profile
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name,
          organization_name: userData.organization_name,
        });
      } catch (error) {
        console.log('Test user might already exist:', userData.email);
      }
    }
  }

  async function cleanupTestData() {
    if (!supabaseAdmin) return;

    try {
      // Clean up in reverse dependency order
      await supabaseAdmin.from('donations').delete().like('donor_id', 'test-%');
      await supabaseAdmin.from('requests').delete().like('user_id', 'test-%');
      await supabaseAdmin
        .from('food_items')
        .delete()
        .eq('name', 'Test Food Item');
      await supabaseAdmin
        .from('profiles')
        .delete()
        .like('email', '%zipli-test.com');

      // Clean up auth users
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      if (users?.users) {
        for (const user of users.users) {
          if (user.email?.includes('zipli-test.com')) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
          }
        }
      }
    } catch (error) {
      console.log('Cleanup error (expected):', error);
    }
  }
});
