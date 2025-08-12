import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RequestFormData {
  recurringInterval: string;
  quantity: string;
  allergens: string[];
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
  quantity: '',
  allergens: ['Vegan', 'Low-lactose'],
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