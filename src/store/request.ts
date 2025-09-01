import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecurrencePattern {
  type: 'never' | 'daily' | 'weekly' | 'custom';
  weeklyDays?: number[];
  customPattern?: {
    frequency: number;
    unit: 'days' | 'weeks';
    endType: 'never' | 'date' | 'occurrences';
    endDate?: string;
    maxOccurrences?: number;
  };
}

interface PickupSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

interface RequestFormData {
  request_type: 'one-time' | 'recurring';
  description: string;
  quantity: number;
  allergens: string[];
  recurringInterval: string; // Keep for backward compatibility
  recurrencePattern: RecurrencePattern;
  startDate: string;
  endDate: string;
  pickupDate: string; // Keep for backward compatibility
  startTime: string; // Keep for backward compatibility
  endTime: string; // Keep for backward compatibility
}

interface RequestState {
  requestData: RequestFormData;
  pickupSlots: PickupSlot[];
  address: string;
  driverInstructions: string;
  isEditMode: boolean;
  editingRequestId: string | null;

  setRequestData: (data: Partial<RequestFormData>) => void;
  setAddress: (address: string) => void;
  setDriverInstructions: (instructions: string) => void;
  setEditMode: (isEdit: boolean, requestId?: string) => void;

  // Actions for pickup slots
  addPickupSlot: (slot: Omit<PickupSlot, 'id'>) => void;
  updatePickupSlot: (slot: PickupSlot) => void;
  deletePickupSlot: (id: string) => void;
  setPickupSlots: (slots: PickupSlot[]) => void;

  // Helper methods for allergen text/array conversion
  allergenTextFromArray: (allergens: string[]) => string;
  arrayFromAllergenText: (text: string) => string[];

  clearRequest: () => void;
}

const initialRequestData: RequestFormData = {
  request_type: 'one-time',
  description: '',
  quantity: 1,
  allergens: [],
  recurringInterval: '',
  recurrencePattern: {
    type: 'never',
  },
  startDate: '',
  endDate: '',
  pickupDate: '',
  startTime: '09:00',
  endTime: '14:00',
};

const initialState = {
  requestData: initialRequestData,
  pickupSlots: [],
  address: '',
  driverInstructions: '',
  isEditMode: false,
  editingRequestId: null,
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRequestData: (data) =>
        set((state) => ({
          requestData: { ...state.requestData, ...data },
        })),

      setAddress: (address) => set({ address }),
      setDriverInstructions: (instructions) =>
        set({ driverInstructions: instructions }),
      setEditMode: (isEdit, requestId) =>
        set({ isEditMode: isEdit, editingRequestId: requestId || null }),

      // Pickup slot actions
      addPickupSlot: (slot) =>
        set((state) => ({
          pickupSlots: [
            ...state.pickupSlots,
            { ...slot, id: Date.now().toString() },
          ],
        })),

      updatePickupSlot: (slot) =>
        set((state) => ({
          pickupSlots: state.pickupSlots.map((s) =>
            s.id === slot.id ? slot : s
          ),
        })),

      deletePickupSlot: (id) =>
        set((state) => ({
          pickupSlots: state.pickupSlots.filter((slot) => slot.id !== id),
        })),

      setPickupSlots: (slots) => set({ pickupSlots: slots }),

      // Helper methods for allergen text/array conversion
      allergenTextFromArray: (allergens: string[]): string => {
        return allergens.length > 0 ? allergens.join(', ') : '';
      },

      arrayFromAllergenText: (text: string): string[] => {
        if (!text.trim()) return [];
        return text
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      },

      clearRequest: () => set(initialState),
    }),
    {
      name: 'zipli-request-store',
    }
  )
);
