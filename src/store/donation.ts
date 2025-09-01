import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  description: string | null;
  allergens: string[];
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[]; // New field for multiple images
}

interface PickupSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

interface DonationState {
  donationItems: DonationItem[];
  pickupSlots: PickupSlot[];
  address: string;
  driverInstructions: string;
  isEditMode: boolean;
  editingDonationId: string | null;
  setDonationItems: (items: DonationItem[]) => void;
  setPickupSlots: (slots: PickupSlot[]) => void;
  setAddress: (address: string) => void;
  setDriverInstructions: (instructions: string) => void;
  setEditMode: (isEdit: boolean, donationId?: string) => void;

  // Actions for donation items
  addDonationItem: (item: Omit<DonationItem, 'id'>) => void;
  updateDonationItem: (item: DonationItem) => void;
  deleteDonationItem: (id: string) => void;

  // Actions for pickup slots
  addPickupSlot: (slot: Omit<PickupSlot, 'id'>) => void;
  updatePickupSlot: (slot: PickupSlot) => void;
  deletePickupSlot: (id: string) => void;

  // Action to clear the store
  clearDonation: () => void;
}

const initialState = {
  donationItems: [],
  pickupSlots: [],
  address: '',
  driverInstructions: '',
  isEditMode: false,
  editingDonationId: null,
};

export const useDonationStore = create<DonationState>()(
  persist(
    (set) => ({
      ...initialState,
      setDonationItems: (items) => set({ donationItems: items }),
      setPickupSlots: (slots) => set({ pickupSlots: slots }),
      setAddress: (address) => set({ address }),
      setDriverInstructions: (instructions) =>
        set({ driverInstructions: instructions }),
      setEditMode: (isEdit, donationId) =>
        set({ isEditMode: isEdit, editingDonationId: donationId || null }),

      // Item actions
      addDonationItem: (item) =>
        set((state) => ({
          donationItems: [
            ...state.donationItems,
            { ...item, id: Date.now().toString() },
          ],
        })),
      updateDonationItem: (updatedItem) =>
        set((state) => ({
          donationItems: state.donationItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        })),
      deleteDonationItem: (id) =>
        set((state) => ({
          donationItems: state.donationItems.filter((item) => item.id !== id),
        })),

      // Slot actions
      addPickupSlot: (slot) =>
        set((state) => ({
          pickupSlots: [
            ...state.pickupSlots,
            { ...slot, id: Date.now().toString() },
          ],
        })),
      updatePickupSlot: (updatedSlot) =>
        set((state) => ({
          pickupSlots: state.pickupSlots.map((slot) =>
            slot.id === updatedSlot.id ? updatedSlot : slot
          ),
        })),
      deletePickupSlot: (id) =>
        set((state) => ({
          pickupSlots: state.pickupSlots.filter((slot) => slot.id !== id),
        })),

      // Clear action implementation
      clearDonation: () => set({ ...initialState }),
    }),
    {
      name: 'donation-storage', // unique name for localStorage key
      partialize: (state) => ({
        ...state,
        pickupSlots: state.pickupSlots.map((slot) => ({
          ...slot,
          date: slot.date ? slot.date.toISOString() : undefined,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.pickupSlots = state.pickupSlots.map((slot) => ({
            ...slot,
            date: slot.date ? new Date(slot.date as any) : undefined,
          }));
        }
      },
    }
  )
);
