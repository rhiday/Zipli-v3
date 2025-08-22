'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { Clock } from 'lucide-react';

// Simple schedule interface
interface SimpleSchedule {
  frequency: 'weekly' | 'daily';
  days: string[]; // For weekly: ['Monday', 'Tuesday', etc.]
  timeSlot: string; // Simple: "Morning (9AM-12PM)", "Afternoon (12PM-4PM)", "Evening (4PM-8PM)"
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  { label: 'Morning', value: 'morning', time: '9:00 AM - 12:00 PM' },
  { label: 'Afternoon', value: 'afternoon', time: '12:00 PM - 4:00 PM' },
  { label: 'Evening', value: 'evening', time: '4:00 PM - 8:00 PM' },
];

export default function SimpleSchedulePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [donationData, setDonationData] = useState<any>(null);

  // Simple state
  const [frequency, setFrequency] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    const storedDonation = sessionStorage.getItem('pendingDonation');
    if (storedDonation) {
      setDonationData(JSON.parse(storedDonation));
    }
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectAllDays = () => {
    setSelectedDays(DAYS_OF_WEEK);
  };

  const clearAllDays = () => {
    setSelectedDays([]);
  };

  const isValid = () => {
    if (frequency === 'daily') {
      return selectedTimeSlot !== '';
    }
    return selectedDays.length > 0 && selectedTimeSlot !== '';
  };

  const handleContinue = () => {
    if (!isValid()) return;

    const schedule: SimpleSchedule = {
      frequency,
      days: frequency === 'daily' ? DAYS_OF_WEEK : selectedDays,
      timeSlot: selectedTimeSlot,
    };

    const donationWithSchedule = {
      ...donationData,
      schedule,
    };

    sessionStorage.setItem(
      'pendingDonation',
      JSON.stringify(donationWithSchedule)
    );
    router.push('/donate/summary');
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title="Set Your Schedule"
            backHref="/donate/recurring-form"
            onBackClick={() => router.back()}
          />
          <div className="px-4 pt-2">
            <Progress value={67} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <Button
            onClick={handleContinue}
            disabled={!isValid()}
            className="w-full"
          >
            Continue
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <main className="contents">
        <div>
          <h2 className="text-xl font-semibold mb-2">When can you donate?</h2>
          <p className="text-sm text-gray-600">
            Choose your recurring schedule
          </p>
        </div>

        {/* Frequency Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-black">How often?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setFrequency('weekly');
                setSelectedDays([]);
              }}
              className={cn(
                'px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                frequency === 'weekly'
                  ? 'border-[#024209] bg-[#eafcd6] text-[#024209]'
                  : 'border-gray-300 bg-white text-gray-700'
              )}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setFrequency('daily');
                setSelectedDays(DAYS_OF_WEEK);
              }}
              className={cn(
                'px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                frequency === 'daily'
                  ? 'border-[#024209] bg-[#eafcd6] text-[#024209]'
                  : 'border-gray-300 bg-white text-gray-700'
              )}
            >
              Every Day
            </button>
          </div>
        </div>

        {/* Day Selection (only for weekly) */}
        {frequency === 'weekly' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-black">Which days?</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllDays}
                  className="text-xs text-[#024209] underline"
                >
                  Select all
                </button>
                {selectedDays.length > 0 && (
                  <button
                    onClick={clearAllDays}
                    className="text-xs text-gray-500 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm transition-colors',
                    selectedDays.includes(day)
                      ? 'border-[#024209] bg-[#eafcd6] text-[#024209] font-medium'
                      : 'border-gray-300 bg-white text-gray-700'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Slot Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-black">What time?</h3>
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setSelectedTimeSlot(slot.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border transition-colors flex items-center justify-between',
                  selectedTimeSlot === slot.value
                    ? 'border-[#024209] bg-[#eafcd6]'
                    : 'border-gray-300 bg-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Clock
                    className={cn(
                      'w-5 h-5',
                      selectedTimeSlot === slot.value
                        ? 'text-[#024209]'
                        : 'text-gray-400'
                    )}
                  />
                  <div className="text-left">
                    <div
                      className={cn(
                        'font-medium',
                        selectedTimeSlot === slot.value
                          ? 'text-[#024209]'
                          : 'text-gray-900'
                      )}
                    >
                      {slot.label}
                    </div>
                    <div className="text-xs text-gray-500">{slot.time}</div>
                  </div>
                </div>
                {selectedTimeSlot === slot.value && (
                  <div className="w-5 h-5 rounded-full bg-[#024209] flex items-center justify-center">
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4L4.5 7.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {(selectedDays.length > 0 || frequency === 'daily') &&
          selectedTimeSlot && (
            <div className="p-4 bg-[#F5F9EF] rounded-lg border border-[#D9DBD5]">
              <p className="text-sm text-gray-600 mb-1">Your schedule:</p>
              <p className="font-medium text-[#024209]">
                {frequency === 'daily' ? 'Every day' : selectedDays.join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                {TIME_SLOTS.find((s) => s.value === selectedTimeSlot)?.time}
              </p>
            </div>
          )}
      </main>
    </PageContainer>
  );
}
