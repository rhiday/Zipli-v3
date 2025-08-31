// =====================================================
// SUPABASE DATABASE STORE
// Replaces mock database store with real Supabase backend
// =====================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import { authService } from '@/lib/auth/authService';
import {
  Database,
  Profile,
  FoodItem,
  Donation,
  Request,
  DonationWithFoodItem,
  RequestWithUser,
  UserRole,
  DonationStatus,
  RequestStatus,
  AuthResponse,
  ProfileInsert,
  ProfileUpdate,
  DonationInsert,
  DonationUpdate,
  RequestInsert,
  RequestUpdate,
} from '@/types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Store state interface
interface SupabaseDatabaseState {
  // Data state
  donations: DonationWithFoodItem[];
  foodItems: FoodItem[];
  users: Profile[]; // Keep for compatibility with existing components
  requests: Request[];
  currentUser: Profile | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;

  // Real-time subscriptions
  subscriptions: RealtimeChannel[];

  // Initialization
  init: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth methods (maintaining compatibility with existing auth interface)
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    userData: Partial<Profile>
  ) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  verifyOtp: (
    email: string,
    token: string,
    type: string
  ) => Promise<AuthResponse>;
  setCurrentUser: (email: string) => Promise<void>;
  updateUser: (updatedUser: Profile) => Promise<void>;
  logout: () => Promise<void>;

  // Data fetching methods
  fetchDonations: () => Promise<void>;
  fetchFoodItems: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchRequests: () => Promise<void>;

  // Donation methods
  getDonationById: (id: string) => DonationWithFoodItem | undefined;
  getDonationsByDonor: (donorId: string) => DonationWithFoodItem[];
  getAllDonations: () => DonationWithFoodItem[];
  addDonation: (
    donation: DonationInsert
  ) => Promise<{ data: Donation | null; error: string | null }>;
  updateDonation: (
    id: string,
    updates: DonationUpdate
  ) => Promise<{ data: Donation | null; error: string | null }>;
  deleteDonation: (id: string) => Promise<{ error: string | null }>;

  // Food item methods
  addFoodItem: (
    foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<{ data: FoodItem | null; error: string | null }>;
  updateFoodItem: (
    id: string,
    updates: Partial<FoodItem>
  ) => Promise<{ data: FoodItem | null; error: string | null }>;

  // Request methods
  getAllRequests: () => Request[];
  getRequestById: (id: string) => Request | undefined;
  addRequest: (
    requestData: RequestInsert
  ) => Promise<{ data: Request | null; error: string | null }>;
  updateRequest: (
    id: string,
    updates: RequestUpdate
  ) => Promise<{ data: Request | null; error: string | null }>;
  deleteRequest: (id: string) => Promise<{ error: string | null }>;

  // Real-time methods
  setupRealtimeSubscriptions: () => void;
  cleanupSubscriptions: () => void;
}

export const useSupabaseDatabase = create<SupabaseDatabaseState>()(
  persist(
    (set, get) => ({
      // Initial state
      donations: [],
      foodItems: [],
      users: [],
      requests: [],
      currentUser: null,
      isInitialized: false,
      loading: false,
      error: null,
      subscriptions: [],

      // Utility methods
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // ===== INITIALIZATION =====
      init: async () => {
        const state = get();
        if (state.isInitialized) {
          return;
        }

        try {
          console.log('🚀 Store init starting...');
          set({ loading: true, error: null });

          // Check for existing session
          console.log('📋 Getting current user...');
          const currentUser = await authService.getCurrentUser();
          console.log('👤 Current user:', currentUser?.full_name || 'None');

          // Always fetch data from Supabase
          console.log('📦 Fetching data...');
          await Promise.all([
            state.fetchFoodItems(),
            state.fetchDonations(),
            state.fetchUsers(),
            state.fetchRequests(),
          ]);
          console.log('✅ Data fetching completed');

          // Setup real-time subscriptions
          state.setupRealtimeSubscriptions();
          set({
            currentUser,
            isInitialized: true,
            loading: false,
          });
        } catch (error) {
          console.error('Initialization error', error);
          set({
            error:
              error instanceof Error ? error.message : 'Initialization failed',
            loading: false,
          });
        }
      },

      // ===== AUTHENTICATION METHODS =====
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          // Always use real Supabase authentication
          const result = await authService.signIn({ email, password });

          if (result.data) {
            set({ currentUser: result.data });
            // Refresh data after login
            await get().fetchDonations();
            await get().fetchRequests();
          }

          set({ loading: false });
          return result;
        } catch (error) {
          set({ loading: false });
          return {
            data: null,
            error: error instanceof Error ? error.message : 'Login failed',
          };
        }
      },

      register: async (
        email: string,
        password: string,
        userData: Partial<Profile>
      ) => {
        try {
          console.log('📝 Store.register - Starting registration for:', email);
          console.log('📝 Store.register - User data:', userData);

          set({ loading: true, error: null });

          const signUpData = {
            email,
            password,
            userData: {
              role: userData.role || 'food_receiver',
              full_name: userData.full_name || email,
              organization_name: userData.organization_name || undefined,
              contact_number: userData.contact_number || undefined,
              address: userData.address || undefined,
            },
          };

          console.log(
            '📝 Store.register - Calling authService.signUp with:',
            signUpData
          );

          const result = await authService.signUp(signUpData);

          console.log('📝 Store.register - Auth service result:', {
            hasData: !!result.data,
            error: result.error,
            userData: result.data,
          });

          if (result.data) {
            console.log(
              '📝 Store.register - Setting current user:',
              result.data
            );
            set({ currentUser: result.data });
          } else if (result.error) {
            console.error(
              '📝 Store.register - Registration failed:',
              result.error
            );
          }

          set({ loading: false });
          return result;
        } catch (error) {
          console.error('📝 Store.register - Caught exception:', error);
          set({ loading: false });
          return {
            data: null,
            error:
              error instanceof Error ? error.message : 'Registration failed',
          };
        }
      },

      resetPassword: async (email: string) => {
        return await authService.resetPassword(email);
      },

      updatePassword: async (password: string) => {
        return await authService.updatePassword(password);
      },

      verifyOtp: async (email: string, token: string, type: string) => {
        const result = await authService.verifyOtp(email, token, type as any);
        if (result.data) {
          set({ currentUser: result.data });
        }
        return result;
      },

      setCurrentUser: async (email: string) => {
        // For development compatibility - find user by email
        const result = await authService.devLogin(email);
        if (result.data) {
          set({ currentUser: result.data });
        }
      },

      updateUser: async (updatedUser: Profile) => {
        try {
          console.log('🔄 updateUser called with:', updatedUser);
          const result = await authService.updateProfile(
            updatedUser.id,
            updatedUser
          );
          console.log('🔄 updateProfile result:', result);

          if (result.error) {
            console.error('❌ Profile update failed:', result.error);
            throw new Error(result.error);
          }

          if (result.data) {
            console.log('✅ Profile updated successfully, updating state');
            set({ currentUser: result.data });
          } else {
            throw new Error('No data returned from profile update');
          }
        } catch (error) {
          console.error('❌ Error in updateUser:', error);
          throw error; // Re-throw so the UI can handle it
        }
      },

      logout: async () => {
        try {
          // Always sign out from Supabase
          await authService.signOut();

          get().cleanupSubscriptions();

          set({
            currentUser: null,
            // Keep users list for DevLoginSwitcher
            // Other data will be cleared
            donations: [],
            requests: [],
          });
        } catch (error) {
          console.error('Logout error', error);
        }
      },

      // ===== DATA FETCHING METHODS =====
      fetchDonations: async () => {
        try {
          // OPTIMIZED: Single query with JOINs instead of N+1 queries
          const { data: donationsData, error: donationsError } = await supabase
            .from('donations')
            .select(
              `
              *,
              food_item:food_items(*),
              donor:profiles!donations_donor_id_fkey(*)
            `
            )
            .order('created_at', { ascending: false });

          if (donationsError) throw donationsError;

          // Transform the joined data to match expected format
          const donations: DonationWithFoodItem[] = (donationsData || []).map(
            (donation) => ({
              ...donation,
              food_item: donation.food_item || {
                id: donation.food_item_id,
                name: 'Unknown item',
                description: null,
                image_url: null,
                allergens: null,
                donor_id: donation.donor_id,
                food_type: null,
                quantity: 0,
                unit: null,
                user_id: donation.donor_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              donor: donation.donor || {
                id: donation.donor_id,
                full_name: 'Unknown donor',
                email: '',
                role: 'food_donor' as any,
                organization_name: '',
                contact_number: null,
                address: null,
                city: null,
                country: null,
                postal_code: null,
                street_address: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            })
          );

          // Also fetch and cache food items separately for other uses
          const { data: foodItemsData } = await supabase
            .from('food_items')
            .select('*');

          set({ donations, foodItems: foodItemsData || [] });
        } catch (error) {
          console.error('Error fetching donations', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch donations',
          });
        }
      },

      fetchFoodItems: async () => {
        try {
          const { data, error } = await supabase
            .from('food_items')
            .select('*')
            .order('name');

          if (error) throw error;
          set({ foodItems: data || [] });
        } catch (error) {
          console.error('Error fetching food items', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch food items',
          });
        }
      },

      fetchUsers: async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');

          if (error) throw error;
          set({ users: data || [] });
        } catch (error) {
          console.error('Error fetching users', error);
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch users',
          });
        }
      },

      fetchRequests: async () => {
        try {
          const { data, error } = await supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ requests: data || [] });
        } catch (error) {
          console.error('Error fetching requests', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch requests',
          });
        }
      },

      // ===== DONATION METHODS =====
      getDonationById: (id: string) => {
        return get().donations.find((d) => d.id === id);
      },

      getDonationsByDonor: (donorId: string) => {
        return get().donations.filter((d) => d.donor_id === donorId);
      },

      getAllDonations: () => {
        return get().donations;
      },

      addDonation: async (donation: DonationInsert) => {
        try {
          const { data, error } = await supabase
            .from('donations')
            .insert(donation)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Refresh donations to get the full data with relations
          await get().fetchDonations();

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error ? error.message : 'Failed to add donation',
          };
        }
      },

      updateDonation: async (id: string, updates: DonationUpdate) => {
        try {
          const { data, error } = await supabase
            .from('donations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Refresh donations
          await get().fetchDonations();

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update donation',
          };
        }
      },

      deleteDonation: async (id: string) => {
        try {
          // First, get the donation to find the food_item_id
          const donationToDelete = get().donations.find((d) => d.id === id);
          if (!donationToDelete) {
            return { error: 'Donation not found' };
          }

          // Delete the donation first (this is the main operation)
          const { error: donationError } = await supabase
            .from('donations')
            .delete()
            .eq('id', id);

          if (donationError) return { error: donationError.message };

          // Then try to delete the associated food item
          // This is safe because if the food item is referenced elsewhere, it will fail silently
          const { error: foodItemError } = await supabase
            .from('food_items')
            .delete()
            .eq('id', donationToDelete.food_item_id);

          // Log food item deletion error but don't fail the operation
          if (foodItemError) {
            console.log(
              'Food item deletion skipped (may be referenced elsewhere):',
              foodItemError.message
            );
          }

          // Remove from local state
          const donations = get().donations.filter((d) => d.id !== id);
          const foodItems = foodItemError
            ? get().foodItems // Keep food items if deletion failed
            : get().foodItems.filter(
                (fi) => fi.id !== donationToDelete.food_item_id
              );

          set({ donations, foodItems });

          return { error: null };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete donation',
          };
        }
      },

      // ===== FOOD ITEM METHODS =====
      addFoodItem: async (foodItem) => {
        try {
          const { data, error } = await supabase
            .from('food_items')
            .insert(foodItem)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Add to local state
          const foodItems = [...get().foodItems, data];
          set({ foodItems });

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add food item',
          };
        }
      },

      updateFoodItem: async (id: string, updates) => {
        try {
          const { data, error } = await supabase
            .from('food_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Update local state
          const foodItems = get().foodItems.map((item) =>
            item.id === id ? { ...item, ...data } : item
          );
          set({ foodItems });

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update food item',
          };
        }
      },

      // ===== REQUEST METHODS =====
      getAllRequests: () => {
        return get().requests;
      },

      getRequestById: (id: string) => {
        return get().requests.find((r) => r.id === id);
      },

      addRequest: async (requestData: RequestInsert) => {
        try {
          // Ensure allergens is properly formatted as array for PostgreSQL
          const formattedRequest = {
            ...requestData,
            allergens: Array.isArray(requestData.allergens)
              ? requestData.allergens
              : requestData.allergens
                ? [requestData.allergens]
                : null,
          };

          console.log('🔧 Supabase insert payload:', formattedRequest);

          const { data, error } = await supabase
            .from('requests')
            .insert(formattedRequest)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Add to local state
          const requests = [data, ...get().requests];
          set({ requests });

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error ? error.message : 'Failed to add request',
          };
        }
      },

      updateRequest: async (id: string, updates: RequestUpdate) => {
        try {
          const { data, error } = await supabase
            .from('requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) return { data: null, error: error.message };

          // Update local state
          const requests = get().requests.map((req) =>
            req.id === id ? { ...req, ...data } : req
          );
          set({ requests });

          return { data, error: null };
        } catch (error) {
          return {
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update request',
          };
        }
      },

      deleteRequest: async (id: string) => {
        try {
          const { error } = await supabase
            .from('requests')
            .delete()
            .eq('id', id);

          if (error) return { error: error.message };

          // Remove from local state
          const requests = get().requests.filter((r) => r.id !== id);
          set({ requests });

          return { error: null };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete request',
          };
        }
      },

      // ===== REAL-TIME METHODS =====
      setupRealtimeSubscriptions: () => {
        // Clean up any existing subscriptions first
        const currentState = get();
        if (currentState.subscriptions.length > 0) {
          console.log('Cleaning up existing subscriptions...');
          currentState.cleanupSubscriptions();
        }

        const subscriptions: RealtimeChannel[] = [];

        try {
          // OPTIMIZED: Use stable channel names to prevent memory leaks
          // Only refetch if user is affected by the change
          const donationsChannel = supabase
            .channel('donations_realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'donations' },
              (payload) => {
                console.log(
                  'Donations changed:',
                  payload.eventType,
                  (payload.new as any)?.id
                );

                // PERFORMANCE: Only refetch if current user is involved
                const currentUser = get().currentUser;
                if (!currentUser) return;

                const newRecord = payload.new as any;
                const oldRecord = payload.old as any;

                const relevantChange =
                  newRecord?.donor_id === currentUser.id ||
                  oldRecord?.donor_id === currentUser.id ||
                  payload.eventType === 'DELETE'; // Always refetch on deletes

                if (relevantChange) {
                  // Debounce rapid changes
                  clearTimeout((window as any)._donationRefetchTimeout);
                  (window as any)._donationRefetchTimeout = setTimeout(() => {
                    get().fetchDonations();
                  }, 100);
                }
              }
            )
            .subscribe();

          // OPTIMIZED: Similar pattern for requests
          const requestsChannel = supabase
            .channel('requests_realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'requests' },
              (payload) => {
                console.log(
                  'Requests changed:',
                  payload.eventType,
                  (payload.new as any)?.id
                );

                const currentUser = get().currentUser;
                if (!currentUser) return;

                const newRecord = payload.new as any;
                const oldRecord = payload.old as any;

                const relevantChange =
                  newRecord?.user_id === currentUser.id ||
                  oldRecord?.user_id === currentUser.id ||
                  payload.eventType === 'DELETE';

                if (relevantChange) {
                  clearTimeout((window as any)._requestRefetchTimeout);
                  (window as any)._requestRefetchTimeout = setTimeout(() => {
                    get().fetchRequests();
                  }, 100);
                }
              }
            )
            .subscribe();

          subscriptions.push(donationsChannel, requestsChannel);
          set({ subscriptions });
          console.log('Optimized real-time subscriptions set up successfully');
        } catch (error) {
          console.error('Error setting up subscriptions', error);
        }
      },

      cleanupSubscriptions: () => {
        const { subscriptions } = get();
        subscriptions.forEach((subscription) => {
          supabase.removeChannel(subscription);
        });
        set({ subscriptions: [] });
      },
    }),
    {
      name: 'supabase-database-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user session, not the actual data (we'll fetch fresh data on init)
      partialize: (state) => ({
        currentUser: state.currentUser,
        // Don't persist isInitialized so we always fetch fresh data on app restart
      }),
    }
  )
);
