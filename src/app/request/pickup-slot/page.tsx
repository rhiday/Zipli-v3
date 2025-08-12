'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store/databaseStore';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { TimeSlotSelector } from '@/components/ui/TimeSlotSelector';

// Define Form Input Types
type PickupSlotFormInputs = {
  pickupDate: string;
  startTime: string;
  endTime: string;
};

export default function PickupSlotPage() {
  const router = useRouter();
  const { requestData, setRequestData, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    requestData.pickupDate ? new Date(requestData.pickupDate) : undefined
  );
  const [startTime, setStartTime] = useState<string>(requestData.startTime || '');
  const [endTime, setEndTime] = useState<string>(requestData.endTime || '');

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PickupSlotFormInputs>();

  const onSubmit = async () => {
    if (!selectedDate || !startTime || !endTime) {
      return; // Add validation as needed
    }

    // Update store with pickup slot data
    setRequestData({
      pickupDate: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      startTime: startTime,
      endTime: endTime,
    });

    // Navigate to summary page
    router.push('/request/summary');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-dvh bg-white">
      <div className="mx-auto max-w-lg bg-white w-full">
        <SecondaryNavbar 
          title="Pickup slot" 
          backHref="/request/new" 
          onBackClick={handleBackClick}
        />

        {/* Progress Bar */}
        <div className="px-4 pt-2">
          <Progress value={67} className="h-2 w-full" />
        </div>

        <main className="flex-grow overflow-y-auto p-4">
          <TimeSlotSelector
            label="When do you need"
            date={selectedDate}
            startTime={startTime}
            endTime={endTime}
            onDateChange={setSelectedDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />
        </main>

        <footer className="px-4 pb-6 pt-4 bg-white">
          <div className="flex justify-end">
            <Button
              onClick={onSubmit}
              className="w-full"
              disabled={isSubmitting || !selectedDate || !startTime || !endTime}
            >
              Continue
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}