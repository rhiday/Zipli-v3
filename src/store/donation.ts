import { create } from 'zustand';

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  allergens: string[];
  imageUrl?: string;
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
  setDonationItems: (items: DonationItem[]) => void;
  setPickupSlots: (slots: PickupSlot[]) => void;
  setAddress: (address: string) => void;
  setDriverInstructions: (instructions: string) => void;
  
  // Actions for donation items
  addDonationItem: (item: Omit<DonationItem, 'id'>) => void;
  updateDonationItem: (item: DonationItem) => void;
  deleteDonationItem: (id: string) => void;

  // Actions for pickup slots
  addPickupSlot: (slot: Omit<PickupSlot, 'id'>) => void;
  updatePickupSlot: (slot: PickupSlot) => void;
  deletePickupSlot: (id: string) => void;
}

export const useDonationStore = create<DonationState>((set) => ({
  donationItems: [],
  pickupSlots: [],
  address: '',
  driverInstructions: '',
  setDonationItems: (items) => set({ donationItems: items }),
  setPickupSlots: (slots) => set({ pickupSlots: slots }),
  setAddress: (address) => set({ address }),
  setDriverInstructions: (instructions) => set({ driverInstructions: instructions }),
  
  // Item actions
  addDonationItem: (item) => set((state) => ({
    donationItems: [...state.donationItems, { ...item, id: Date.now().toString() }],
  })),
  updateDonationItem: (updatedItem) => set((state) => ({
    donationItems: state.donationItems.map(item => item.id === updatedItem.id ? updatedItem : item),
  })),
  deleteDonationItem: (id) => set((state) => ({
    donationItems: state.donationItems.filter(item => item.id !== id),
  })),

  // Slot actions
  addPickupSlot: (slot) => set((state) => ({
    pickupSlots: [...state.pickupSlots, { ...slot, id: Date.now().toString() }],
  })),
  updatePickupSlot: (updatedSlot) => set((state) => ({
    pickupSlots: state.pickupSlots.map(slot => slot.id === updatedSlot.id ? updatedSlot : slot),
  })),
  deletePickupSlot: (id) => set((state) => ({
    pickupSlots: state.pickupSlots.filter(slot => slot.id !== id),
  })),
})); 