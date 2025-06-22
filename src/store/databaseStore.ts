import { create } from 'zustand';
import donations  from '../../mockData/donations.json';
import foodItems  from '../../mockData/food_items.json';
import users      from '../../mockData/users.json';

// Define interfaces for our data structures based on the JSON files
interface FoodItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  allergens?: string;
}

interface Donation {
  id: string;
  food_item_id: string;
  donor_id: string;
  quantity: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  role: 'donor' | 'receiver' | 'city';
  full_name: string;
}

// We'll combine donations and their food items for easier use in the app
export interface DonationWithFoodItem extends Donation {
  food_item: FoodItem;
}

// Define the store's state and actions
interface DatabaseState {
  donations: Donation[];
  foodItems: FoodItem[];
  users: User[];
  currentUser: User | null;
  isInitialized: boolean;
  actions: {
    init: () => void;
    setCurrentUser: (email: string) => void;
    logout: () => void;
    getDonationById: (id: string) => DonationWithFoodItem | undefined;
    getDonationsByDonor: (donorId: string) => DonationWithFoodItem[];
    getAllDonations: () => DonationWithFoodItem[];
    updateDonation: (updatedDonation: Partial<Donation> & { id: string }) => void;
    deleteDonation: (id: string) => void;
    updateFoodItem: (updatedFoodItem: Partial<FoodItem> & { id: string }) => void;
  };
}

const useDatabaseStore = create<DatabaseState>((set, get) => ({
  donations: [],
  foodItems: [],
  users: [],
  currentUser: null,
  isInitialized: false,
  actions: {
    init: () => {
      // Create mock IDs since they are missing from the JSON files
      const usersWithIds = (users as any[]).map((u, i) => ({ ...u, id: `user-${i + 1}` })) as User[];
      const foodItemsWithIds = (foodItems as any[]).map((fi, i) => ({ ...fi, id: `food-item-${i + 1}` }));
      
      // Assign a donor to the mock donation
      const donor = usersWithIds.find(u => u.role === 'donor');
      const donationsWithIds = (donations as any[]).map((d, i) => ({
        ...d,
        id: `donation-${i + 1}`,
        food_item_id: foodItemsWithIds[i % foodItemsWithIds.length].id, // Link to a food item
        donor_id: donor ? donor.id : 'user-1', // Link to a donor
      }));

      set({
        users: usersWithIds,
        foodItems: foodItemsWithIds,
        donations: donationsWithIds,
        isInitialized: true,
      });
    },
    setCurrentUser: (email) => {
      const user = get().users.find(u => u.email === email);
      set({ currentUser: user || null });
    },
    logout: () => set({ currentUser: null }),
    getDonationById: (id) => {
      const donation = get().donations.find(d => d.id === id);
      if (!donation) return undefined;
      const foodItem = get().foodItems.find(fi => fi.id === donation.food_item_id);
      return { ...donation, food_item: foodItem || ({} as FoodItem) };
    },
    getDonationsByDonor: (donorId) => {
      const donorDonations = get().donations.filter(d => d.donor_id === donorId);
      return donorDonations.map(d => {
        const foodItem = get().foodItems.find(fi => fi.id === d.food_item_id);
        return { ...d, food_item: foodItem || ({} as FoodItem) };
      });
    },
    getAllDonations: () => {
        const allDonations = get().donations;
        return allDonations.map(d => {
            const foodItem = get().foodItems.find(fi => fi.id === d.food_item_id);
            return { ...d, food_item: foodItem || ({} as FoodItem) };
        });
    },
    updateDonation: (updatedDonation) => {
      set(state => ({
        donations: state.donations.map(d =>
          d.id === updatedDonation.id ? { ...d, ...updatedDonation } : d
        ),
      }));
    },
    deleteDonation: (id) => {
      set(state => ({
        donations: state.donations.filter(d => d.id !== id),
      }));
    },
    updateFoodItem: (updatedFoodItem) => {
      set(state => ({
        foodItems: state.foodItems.map(fi =>
          fi.id === updatedFoodItem.id ? { ...fi, ...updatedFoodItem } : fi
        ),
      }));
    },
  },
}));

export const useDatabase = useDatabaseStore;
export const useDatabaseActions = () => useDatabaseStore(state => state.actions); 