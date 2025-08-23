import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import donationsData from '../../mockData/donations.json';
import foodItemsData from '../../mockData/food_items.json';
import usersData from '../../mockData/users.json';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

// Define interfaces for our data structures based on the JSON files
interface FoodItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  allergens?: string | string[];
}

interface Donation {
  id: string;
  food_item_id: string;
  donor_id: string;
  quantity: string;
  status: string;
  pickup_time: string;
  pickup_slots?: any[]; // Allow for pickup slots
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'food_donor' | 'food_receiver' | 'city' | 'terminals';
  full_name: string;
  organization_name?: string;
  contact_number?: string;
  address?: string;
  driver_instructions?: string;
}

interface Request {
  id: string;
  user_id: string;
  description: string;
  people_count: number;
  start_date: string;
  end_date: string;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  is_recurring: boolean;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// We'll combine donations and their food items for easier use in the app
export interface DonationWithFoodItem extends Donation {
  food_item: FoodItem;
}

// Authentication response types for consistency with Supabase-like API
interface AuthResponse {
  data: { user: User } | null;
  error: string | null;
}

interface AuthError {
  message: string;
}

// Define the store's state and actions
interface DatabaseState {
  donations: Donation[];
  foodItems: FoodItem[];
  users: User[];
  requests: Request[];
  currentUser: User | null;
  isInitialized: boolean;

  // Core methods
  init: () => void;

  // Auth methods
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  verifyOtp: (
    email: string,
    token: string,
    type: string
  ) => Promise<AuthResponse>;
  setCurrentUser: (email: string) => void;
  updateUser: (updatedUser: User) => void;
  logout: () => void;

  // Donation methods
  getDonationById: (id: string) => DonationWithFoodItem | undefined;
  getDonationsByDonor: (donorId: string) => DonationWithFoodItem[];
  getAllDonations: () => DonationWithFoodItem[];
  addFullDonation: (items: any[], slots: any[]) => void;
  updateDonation: (updatedDonation: Partial<Donation> & { id: string }) => void;
  deleteDonation: (id: string) => void;
  updateFoodItem: (updatedFoodItem: Partial<FoodItem> & { id: string }) => void;

  // Request methods
  getAllRequests: () => Request[];
  getRequestById: (id: string) => Request | undefined;
  addRequest: (
    requestData: Omit<Request, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<{ data: Request | null; error: string | null }>;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  deleteRequest: (id: string) => void;
}

// Mock request data
const mockRequests: Omit<Request, 'id'>[] = [
  {
    user_id: 'user-2', // receiver user
    description: 'Need food for 20 people at homeless shelter',
    people_count: 20,
    start_date: '2024-01-15',
    end_date: '2024-01-25',
    pickup_date: '2024-01-20',
    pickup_start_time: '10:00',
    pickup_end_time: '14:00',
    is_recurring: false,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    user_id: 'user-3', // another receiver
    description: 'Weekly food collection for community kitchen',
    people_count: 50,
    start_date: '2024-01-20',
    end_date: '2024-01-30',
    pickup_date: '2024-01-25',
    pickup_start_time: '09:00',
    pickup_end_time: '12:00',
    is_recurring: true,
    status: 'active',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
  },
];

export const useDatabase = create<DatabaseState>()(
  persist(
    (set, get) => ({
      donations: [],
      foodItems: [],
      users: [],
      requests: [],
      currentUser: null,
      isInitialized: false,

      init: () => {
        if (get().isInitialized) return;
        // Load from mock data only if the store is empty
        const usersWithIds = (usersData as any[]).map((u, i) => ({
          ...u,
          id: `user-${i + 1}`,
          organization_name:
            u.role === 'food_donor' ? 'Sample Organization' : undefined,
          contact_number: '+358123456789',
          address: 'Helsinki, Finland',
        })) as User[];

        const foodItemsWithIds = (foodItemsData as any[]).map((fi, i) => ({
          ...fi,
          id: `food-item-${i + 1}`,
        }));

        const donor = usersWithIds.find((u) => u.role === 'food_donor');
        const donationsWithIds = (donationsData as any[]).map((d, i) => ({
          ...d,
          id: `donation-${i + 1}`,
          food_item_id: foodItemsWithIds[i % foodItemsWithIds.length].id,
          donor_id: donor ? donor.id : 'user-1',
        }));

        const requestsWithIds = mockRequests.map((r, i) => ({
          ...r,
          id: `request-${i + 1}`,
        }));

        set({
          users: usersWithIds,
          foodItems:
            get().foodItems.length > 0 ? get().foodItems : foodItemsWithIds,
          donations:
            get().donations.length > 0 ? get().donations : donationsWithIds,
          requests:
            get().requests.length > 0 ? get().requests : requestsWithIds,
          isInitialized: true,
        });

        // Auto-login first food_donor user in development mode for easier testing
        if (process.env.NODE_ENV === 'development' && !get().currentUser) {
          const defaultUser =
            usersWithIds.find((u) => u.role === 'food_donor') ||
            usersWithIds[0];
          if (defaultUser) {
            set({ currentUser: defaultUser });
            console.log(
              'Auto-logged in as:',
              defaultUser.full_name,
              '(',
              defaultUser.role,
              ')'
            );
          }
        }
      },

      // Auth methods
      login: async (email, password) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = get().users.find((u) => u.email === email);
        if (!user) {
          return { data: null, error: 'Invalid email or password' };
        }

        // Verify password matches the one stored in mock data
        if ((user as any).password !== password) {
          return { data: null, error: 'Invalid email or password' };
        }

        set({ currentUser: user });
        return { data: { user }, error: null };
      },

      register: async (email, password, userData) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const existingUser = get().users.find((u) => u.email === email);
        if (existingUser) {
          return { data: null, error: 'User already exists' };
        }

        const newUser: User = {
          id: `user-${get().users.length + 1}`,
          email,
          full_name: userData.full_name || '',
          role: userData.role || 'food_donor',
          organization_name: userData.organization_name,
          contact_number: userData.contact_number,
          address: userData.address,
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));

        return { data: { user: newUser }, error: null };
      },

      resetPassword: async (email) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = get().users.find((u) => u.email === email);
        if (!user) {
          return { error: 'User not found' };
        }

        // In a real app, you'd send an email here
        // Password reset email would be sent
        return { error: null };
      },

      updatePassword: async (password) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { currentUser } = get();
        if (!currentUser) {
          return { error: 'Not authenticated' };
        }

        // In a real app, you'd update the password in the database
        // Password updated successfully
        return { error: null };
      },

      verifyOtp: async (email, token, type) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = get().users.find((u) => u.email === email);
        if (!user) {
          return { data: null, error: 'Invalid verification code' };
        }

        // For mock purposes, accept any 6-digit code
        if (token.length === 6) {
          set({ currentUser: user });
          return { data: { user }, error: null };
        }

        return { data: null, error: 'Invalid verification code' };
      },

      setCurrentUser: (email) => {
        const user = get().users.find((u) => u.email === email);
        set({ currentUser: user || null });
      },

      updateUser: (updatedUser) => {
        const users = get().users.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        set({
          users,
          currentUser:
            get().currentUser?.id === updatedUser.id
              ? updatedUser
              : get().currentUser,
        });
      },

      logout: () => {
        set({ currentUser: null });
        // Clear draft donations from localStorage
        localStorage.removeItem('donation-storage');
      },

      // Donation methods (existing)
      getDonationById: (id) => {
        const donation = get().donations.find((d) => d.id === id);
        if (!donation) return undefined;
        const foodItem = get().foodItems.find(
          (fi) => fi.id === donation.food_item_id
        );
        return { ...donation, food_item: foodItem || ({} as FoodItem) };
      },

      getDonationsByDonor: (donorId) => {
        const donorDonations = get().donations.filter(
          (d) => d.donor_id === donorId
        );
        return donorDonations.map((d) => {
          const foodItem = get().foodItems.find(
            (fi) => fi.id === d.food_item_id
          );
          return { ...d, food_item: foodItem || ({} as FoodItem) };
        });
      },

      getAllDonations: () => {
        const allDonations = get().donations;
        return allDonations.map((d) => {
          const foodItem = get().foodItems.find(
            (fi) => fi.id === d.food_item_id
          );
          return { ...d, food_item: foodItem || ({} as FoodItem) };
        });
      },

      addFullDonation: (items, slots) => {
        const { currentUser, foodItems, donations } = get();
        if (!currentUser) return;

        // Helper to generate a random date within the last 7 days
        function randomRecentISO() {
  const { t } = useCommonTranslation();

          const now = new Date();
          const daysAgo = Math.floor(Math.random() * 7);
          const hoursAgo = Math.floor(Math.random() * 24);
          const d = new Date(
            now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000
          );
          return d.toISOString();
        }

        const newFoodItems = items.map((item, index) => ({
          ...item,
          id: `food-item-${foodItems.length + index + 1}`,
          image_url: item.imageUrl || item.image_url || '',
        }));

        const newDonations = newFoodItems.map((foodItem, index) => ({
          id: `donation-${donations.length + index + 1}`,
          food_item_id: foodItem.id,
          donor_id: currentUser.id,
          quantity: items[index].quantity,
          status: 'available',
          pickup_time: items[index].pickup_time || randomRecentISO(),
          pickup_slots: slots,
          claimed_at: null,
          created_at: new Date().toISOString(),
          instructions_for_driver: null,
          picked_up_at: null,
          receiver_id: null,
          updated_at: new Date().toISOString(),
        }));

        set((state) => ({
          foodItems: [...state.foodItems, ...newFoodItems],
          donations: [...state.donations, ...newDonations],
        }));
      },

      updateDonation: (updatedDonation) => {
        set((state) => ({
          donations: state.donations.map((d) =>
            d.id === updatedDonation.id ? { ...d, ...updatedDonation } : d
          ),
        }));
      },

      deleteDonation: (id) => {
        set((state) => ({
          donations: state.donations.filter((d) => d.id !== id),
        }));
      },

      updateFoodItem: (updatedFoodItem) => {
        set((state) => ({
          foodItems: state.foodItems.map((fi) =>
            fi.id === updatedFoodItem.id ? { ...fi, ...updatedFoodItem } : fi
          ),
        }));
      },

      // Request methods
      getAllRequests: () => get().requests,

      getRequestById: (id) => get().requests.find((r) => r.id === id),

      addRequest: async (requestData) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newRequest: Request = {
          ...requestData,
          id: `request-${get().requests.length + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          requests: [...state.requests, newRequest],
        }));

        return { data: newRequest, error: null };
      },

      updateRequest: (id, updates) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? { ...r, ...updates, updated_at: new Date().toISOString() }
              : r
          ),
        }));
      },

      deleteRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id),
        }));
      },
    }),
    {
      name: 'zipli-database-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        donations: state.donations,
        foodItems: state.foodItems,
        users: state.users,
        requests: state.requests,
        currentUser: state.currentUser,
      }), // persist relevant data
      onRehydrateStorage: () => (state) => {
        // If state is empty after rehydration, initialize it with mock data
        if (
          state &&
          (!state.users || state.users.length === 0) &&
          !state.isInitialized
        ) {
          state.init();
        }
      },
    }
  )
);
