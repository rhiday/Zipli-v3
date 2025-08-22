'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditIcon } from '@/components/ui/icons/EditIcon';
import { DeleteIcon } from '@/components/ui/icons/DeleteIcon';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

interface PickupSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

export default function PickupSlotPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([
    {
      id: '1',
      date: undefined,
      startTime: '09:00',
      endTime: '17:00',
    },
  ]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  // Helper function to safely format dates
  const safeFormatDate = (date: Date | undefined): string => {
    if (!date || isNaN(date.getTime())) return '';
    return format(date, 'PPP');
  };

  // Helper function to format slot display
  const formatSlotTime = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  };

  const addPickupSlot = () => {
    const newSlot: PickupSlot = {
      id: Date.now().toString(),
      date: undefined,
      startTime: '09:00',
      endTime: '17:00',
    };
    setPickupSlots([...pickupSlots, newSlot]);
  };

  const updatePickupSlot = (
    id: string,
    updates: Partial<Omit<PickupSlot, 'id'>>
  ) => {
    setPickupSlots(
      pickupSlots.map((slot) =>
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
  };

  const deletePickupSlot = (id: string) => {
    setPickupSlots(pickupSlots.filter((slot) => slot.id !== id));
  };

  const handleContinue = async () => {
    // Validate all slots have required data
    const validSlots = pickupSlots.filter(
      (slot) => slot.date && slot.startTime && slot.endTime
    );

    if (validSlots.length === 0) {
      alert('Please configure at least one pickup slot');
      return;
    }

    // Store pickup slots in session storage
    sessionStorage.setItem('pickupSlots', JSON.stringify(validSlots));

    // Navigate to summary page
    router.push('/request/summary');
  };

  const isFormValid = pickupSlots.some(
    (slot) => slot.date && slot.startTime && slot.endTime
  );

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title="Pickup Slots"
            backHref="/request/new"
            onBackClick={() => router.back()}
          />
          <div className="px-4 pt-2">
            <Progress value={50} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6 pb-24"
      footer={
        <BottomActionBar>
          <Button
            onClick={handleContinue}
            className="w-full"
            disabled={!isFormValid}
          >
            Continue
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            When can you pick up the food?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add one or more pickup time slots to give donors flexibility.
          </p>
        </div>

        {/* Pickup Slots */}
        <div className="space-y-4">
          {pickupSlots.map((slot, index) => (
            <div
              key={slot.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  Pickup Slot {index + 1}
                </h3>
                {pickupSlots.length > 1 && (
                  <button
                    onClick={() => deletePickupSlot(slot.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <DeleteIcon />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !slot.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {slot.date ? safeFormatDate(slot.date) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={slot.date}
                        onSelect={(date) => updatePickupSlot(slot.id, { date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updatePickupSlot(slot.id, { startTime: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updatePickupSlot(slot.id, { endTime: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Slot Button */}
        <Button variant="secondary" onClick={addPickupSlot} className="w-full">
          Add Another Slot
        </Button>
      </div>
    </PageContainer>
  );
}
