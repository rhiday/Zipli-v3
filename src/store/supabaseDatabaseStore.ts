// =====================================================
// SUPABASE DATABASE STORE
// Replaces mock database store with real Supabase backend
// =====================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import { authService } from '@/lib/auth/authService';
import { MOCK_USERS, MOCK_FOOD_ITEMS, MOCK_DONATIONS, MOCK_REQUESTS } from '@/lib/mockData';
import {
  Database,
  Profile,
  FoodItem,
  Donation,
  Request,
  DonationClaim,
  DonationWithFoodItem,
  RequestWithUser,
  DonationClaimWithDetails,
  UserRole,
  DonationStatus,
  RequestStatus,
  ClaimStatus,
  AuthResponse,
  ProfileInsert,
  ProfileUpdate,
  DonationInsert,
  DonationUpdate,
  RequestInsert,
  RequestUpdate,
  DonationClaimInsert,
  DonationClaimUpdate,
} from '@/types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Store state interface
interface SupabaseDatabaseState {
  // Data state
  donations: DonationWithFoodItem[];
  foodItems: FoodItem[];
  users: Profile[]; // Keep for compatibility with existing components
  requests: Request[];
  claims: DonationClaim[];
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
  register: (email: string, password: string, userData: Partial<Profile>) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string, type: string) => Promise<AuthResponse>;
  setCurrentUser: (email: string) => Promise<void>;
  updateUser: (updatedUser: Profile) => Promise<void>;
  logout: () => Promise<void>;

  // Data fetching methods
  fetchDonations: () => Promise<void>;
  fetchFoodItems: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchClaims: () => Promise<void>;

  // Donation methods
  getDonationById: (id: string) => DonationWithFoodItem | undefined;
  getDonationsByDonor: (donorId: string) => DonationWithFoodItem[];
  getAllDonations: () => DonationWithFoodItem[];
  addDonation: (donation: DonationInsert) => Promise<{ data: Donation | null; error: string | null }>;
  updateDonation: (id: string, updates: DonationUpdate) => Promise<{ data: Donation | null; error: string | null }>;
  deleteDonation: (id: string) => Promise<{ error: string | null }>;

  // Food item methods
  addFoodItem: (foodItem: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: FoodItem | null; error: string | null }>;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => Promise<{ data: FoodItem | null; error: string | null }>;

  // Request methods
  getAllRequests: () => Request[];
  getRequestById: (id: string) => Request | undefined;
  addRequest: (requestData: RequestInsert) => Promise<{ data: Request | null; error: string | null }>;
  updateRequest: (id: string, updates: RequestUpdate) => Promise<{ data: Request | null; error: string | null }>;
  deleteRequest: (id: string) => Promise<{ error: string | null }>;

  // Claim methods
  getAllClaims: () => DonationClaim[];
  getClaimById: (id: string) => DonationClaim | undefined;
  createClaim: (claimData: DonationClaimInsert) => Promise<{ data: DonationClaim | null; error: string | null }>;
  updateClaim: (id: string, updates: DonationClaimUpdate) => Promise<{ data: DonationClaim | null; error: string | null }>;

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
      claims: [],
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
        if (state.isInitialized) return;

        try {
          set({ loading: true, error: null });

          // Check for existing session
          const currentUser = await authService.getCurrentUser();
          
          // In development mode, populate with mock users if needed
          const isDevelopment = process.env.NODE_ENV === 'development';
          
          if (isDevelopment) {
            // For development, use mock users for the DevLoginSwitcher
            set({ users: MOCK_USERS as any });
            
            // Also set mock data for better development experience
            if (!currentUser) {
              set({ 
                foodItems: MOCK_FOOD_ITEMS as any,
                donations: MOCK_DONATIONS.map(d => ({
                  ...d,
                  food_item: MOCK_FOOD_ITEMS.find(fi => fi.id === d.food_item_id),
                })) as any,
                requests: MOCK_REQUESTS as any,
              });
            }
          } else {
            // In production, fetch real data
            await Promise.all([
              state.fetchFoodItems(),
              state.fetchDonations(),
              state.fetchUsers(),
              state.fetchRequests(),
              state.fetchClaims(),
            ]);
          }

          // Setup real-time subscriptions only if we have a real connection
          if (currentUser) {
            state.setupRealtimeSubscriptions();
          }

          set({ 
            currentUser,
            isInitialized: true,
            loading: false 
          });
        } catch (error) {
          console.error('Initialization error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Initialization failed',
            loading: false 
          });
        }
      },

      // ===== AUTHENTICATION METHODS =====
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          // In development mode, handle mock user login
          const isDevelopment = process.env.NODE_ENV === 'development';
          if (isDevelopment && email.endsWith('@zipli.test')) {
            // Find the mock user
            const mockUser = MOCK_USERS.find(u => u.email === email);
            if (mockUser) {
              // Set the mock user as current user
              set({ 
                currentUser: mockUser as any,
                loading: false 
              });
              
              // Simulate successful login response
              return { 
                data: { user: mockUser as any, session: null }, 
                error: null 
              };
            }
          }
          
          // For real authentication (production or non-mock emails)
          const result = await authService.signIn({ email, password });
          
          if (result.data?.user) {
            set({ currentUser: result.data.user });
            // Refresh data after login
            await get().fetchDonations();
            await get().fetchRequests();
            await get().fetchClaims();
          }
          
          set({ loading: false });
          return result;
        } catch (error) {
          set({ loading: false });
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Login failed' 
          };
        }
      },

      register: async (email: string, password: string, userData: Partial<Profile>) => {
        try {
          set({ loading: true, error: null });
          
          const result = await authService.signUp({
            email,
            password,
            userData: {
              role: userData.role || 'food_receiver',
              full_name: userData.full_name || email,
              organization_name: userData.organization_name,
              contact_number: userData.contact_number,
              address: userData.address,
              driver_instructions: userData.driver_instructions,
            }
          });
          
          if (result.data?.user) {
            set({ currentUser: result.data.user });
          }
          
          set({ loading: false });
          return result;
        } catch (error) {
          set({ loading: false });
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Registration failed' 
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
        if (result.data?.user) {
          set({ currentUser: result.data.user });
        }
        return result;
      },

      setCurrentUser: async (email: string) => {
        // For development compatibility - find user by email
        const result = await authService.devLogin(email);
        if (result.data?.user) {
          set({ currentUser: result.data.user });
        }
      },

      updateUser: async (updatedUser: Profile) => {
        try {
          const result = await authService.updateProfile(updatedUser.id, updatedUser);
          if (result.data) {
            set({ currentUser: result.data });
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
      },

      logout: async () => {
        try {
          // For mock users in development, just clear the current user
          const isDevelopment = process.env.NODE_ENV === 'development';
          const currentUser = get().currentUser;
          
          if (isDevelopment && currentUser?.email?.endsWith('@zipli.test')) {
            // For mock users, just clear the state
            set({ currentUser: null });
          } else {
            // For real users, sign out from Supabase
            await authService.signOut();
          }
          
          get().cleanupSubscriptions();
          
          // Reset data but keep mock users for DevLoginSwitcher
          if (isDevelopment) {
            set({ 
              currentUser: null,
              // Keep mock users and food items for development
              users: MOCK_USERS as any,
              foodItems: MOCK_FOOD_ITEMS as any,
              donations: MOCK_DONATIONS.map(d => ({
                ...d,
                food_item: MOCK_FOOD_ITEMS.find(fi => fi.id === d.food_item_id),
              })) as any,
              requests: MOCK_REQUESTS as any,
              claims: [],
            });
          } else {
            set({ 
              currentUser: null,
              donations: [],
              requests: [],
              claims: [],
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      // ===== DATA FETCHING METHODS =====
      fetchDonations: async () => {
        try {
          const { data, error } = await supabase
            .from('donations')
            .select(`
              *,
              food_item:food_items(*),
              donor:profiles(*)
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const donations: DonationWithFoodItem[] = data.map(d => ({
            ...d,
            food_item: d.food_item as FoodItem,
            donor: d.donor as Profile,
          }));

          set({ donations });
        } catch (error) {
          console.error('Error fetching donations:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch donations' });
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
          console.error('Error fetching food items:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch food items' });
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
          console.error('Error fetching users:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch users' });
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
          console.error('Error fetching requests:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch requests' });
        }
      },

      fetchClaims: async () => {
        try {
          const { data, error } = await supabase
            .from('donation_claims')
            .select('*')
            .order('claimed_at', { ascending: false });

          if (error) throw error;
          set({ claims: data || [] });
        } catch (error) {
          console.error('Error fetching claims:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch claims' });
        }
      },

      // ===== DONATION METHODS =====
      getDonationById: (id: string) => {
        return get().donations.find(d => d.id === id);
      },

      getDonationsByDonor: (donorId: string) => {
        return get().donations.filter(d => d.donor_id === donorId);
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
            error: error instanceof Error ? error.message : 'Failed to add donation' 
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
            error: error instanceof Error ? error.message : 'Failed to update donation' 
          };
        }
      },

      deleteDonation: async (id: string) => {
        try {
          const { error } = await supabase
            .from('donations')
            .delete()
            .eq('id', id);

          if (error) return { error: error.message };
          
          // Remove from local state
          const donations = get().donations.filter(d => d.id !== id);
          set({ donations });
          
          return { error: null };
        } catch (error) {
          return { 
            error: error instanceof Error ? error.message : 'Failed to delete donation' 
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
            error: error instanceof Error ? error.message : 'Failed to add food item' 
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
          const foodItems = get().foodItems.map(item => 
            item.id === id ? { ...item, ...data } : item
          );
          set({ foodItems });
          
          return { data, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Failed to update food item' 
          };
        }
      },

      // ===== REQUEST METHODS =====
      getAllRequests: () => {
        return get().requests;
      },

      getRequestById: (id: string) => {
        return get().requests.find(r => r.id === id);
      },

      addRequest: async (requestData: RequestInsert) => {
        try {
          const { data, error } = await supabase
            .from('requests')
            .insert(requestData)
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
            error: error instanceof Error ? error.message : 'Failed to add request' 
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
          const requests = get().requests.map(req => 
            req.id === id ? { ...req, ...data } : req
          );
          set({ requests });
          
          return { data, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Failed to update request' 
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
          const requests = get().requests.filter(r => r.id !== id);
          set({ requests });
          
          return { error: null };
        } catch (error) {
          return { 
            error: error instanceof Error ? error.message : 'Failed to delete request' 
          };
        }
      },

      // ===== CLAIM METHODS =====
      getAllClaims: () => {
        return get().claims;
      },

      getClaimById: (id: string) => {
        return get().claims.find(c => c.id === id);
      },

      createClaim: async (claimData: DonationClaimInsert) => {
        try {
          const { data, error } = await supabase
            .from('donation_claims')
            .insert(claimData)
            .select()
            .single();

          if (error) return { data: null, error: error.message };
          
          // Add to local state
          const claims = [data, ...get().claims];
          set({ claims });
          
          return { data, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Failed to create claim' 
          };
        }
      },

      updateClaim: async (id: string, updates: DonationClaimUpdate) => {
        try {
          const { data, error } = await supabase
            .from('donation_claims')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) return { data: null, error: error.message };
          
          // Update local state
          const claims = get().claims.map(claim => 
            claim.id === id ? { ...claim, ...data } : claim
          );
          set({ claims });
          
          return { data, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Failed to update claim' 
          };
        }
      },

      // ===== REAL-TIME METHODS =====
      setupRealtimeSubscriptions: () => {
        const subscriptions: RealtimeChannel[] = [];

        // Subscribe to donations changes
        const donationsChannel = supabase
          .channel('donations_changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'donations' },
            () => get().fetchDonations()
          )
          .subscribe();

        // Subscribe to requests changes
        const requestsChannel = supabase
          .channel('requests_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'requests' },
            () => get().fetchRequests()
          )
          .subscribe();

        // Subscribe to claims changes
        const claimsChannel = supabase
          .channel('claims_changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'donation_claims' },
            () => get().fetchClaims()
          )
          .subscribe();

        subscriptions.push(donationsChannel, requestsChannel, claimsChannel);
        set({ subscriptions });
      },

      cleanupSubscriptions: () => {
        const { subscriptions } = get();
        subscriptions.forEach(subscription => {
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
        isInitialized: state.isInitialized,
      }),
    }
  )
);