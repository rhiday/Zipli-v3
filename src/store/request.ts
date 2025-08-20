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

interface RequestFormData {
  recurringInterval: string; // Keep for backward compatibility
  recurrencePattern: RecurrencePattern;
  quantity: string;
  allergens: string[];
  startDate: string;
  endDate: string;
  pickupDate: string;
  startTime: string;
  endTime: string;
}

interface RequestState {
  requestData: RequestFormData;
  setRequestData: (data: Partial<RequestFormData>) => void;
  clearRequest: () => void;
}

const initialRequestData: RequestFormData = {
  recurringInterval: '',
  recurrencePattern: {
    type: 'never',
  },
  quantity: '',
  allergens: ['Vegan', 'Low-lactose'],
  startDate: '',
  endDate: '',
  pickupDate: '',
  startTime: '09:00',
  endTime: '14:00',
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set) => ({
      requestData: initialRequestData,
      setRequestData: (data) =>
        set((state) => ({
          requestData: { ...state.requestData, ...data },
        })),
      clearRequest: () =>
        set({
          requestData: initialRequestData,
        }),
    }),
    {
      name: 'zipli-request-store',
    }
  )
);
