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
  people_count: number; // Changed from quantity to match database
  allergens: string[];
  dietary_preferences: string[];
  recurringInterval: string; // Keep for backward compatibility
  recurrencePattern: RecurrencePattern;
  startDate: string;
  endDate: string;
  pickupDate: string; // Keep for backward compatibility
  startTime: string; // Keep for backward compatibility
  endTime: string; // Keep for backward compatibility
  delivery_preference: 'pickup' | 'delivery' | 'either';
}

interface RequestState {
  requestData: RequestFormData;
  pickupSlots: PickupSlot[];
  address: string;
  driverInstructions: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  timezone: string;
  isEditMode: boolean;
  editingRequestId: string | null;

  setRequestData: (data: Partial<RequestFormData>) => void;
  setAddress: (address: string) => void;
  setDriverInstructions: (instructions: string) => void;
  setLocation: (lat: number, lng: number, postal?: string) => void;
  setTimezone: (timezone: string) => void;
  setEditMode: (isEdit: boolean, requestId?: string) => void;

  // Actions for pickup slots
  addPickupSlot: (slot: Omit<PickupSlot, 'id'>) => void;
  updatePickupSlot: (slot: PickupSlot) => void;
  deletePickupSlot: (id: string) => void;
  setPickupSlots: (slots: PickupSlot[]) => void;

  clearRequest: () => void;
}

const initialRequestData: RequestFormData = {
  request_type: 'one-time',
  description: '',
  people_count: 1,
  allergens: [],
  dietary_preferences: [],
  recurringInterval: '',
  recurrencePattern: {
    type: 'never',
  },
  startDate: '',
  endDate: '',
  pickupDate: '',
  startTime: '09:00',
  endTime: '14:00',
  delivery_preference: 'pickup',
};

const initialState = {
  requestData: initialRequestData,
  pickupSlots: [],
  address: '',
  driverInstructions: '',
  latitude: undefined,
  longitude: undefined,
  postalCode: undefined,
  timezone: 'UTC',
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
      setLocation: (lat, lng, postal) =>
        set({ latitude: lat, longitude: lng, postalCode: postal }),
      setTimezone: (timezone) => set({ timezone }),
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

      clearRequest: () => set(initialState),
    }),
    {
      name: 'zipli-request-store',
    }
  )
);
