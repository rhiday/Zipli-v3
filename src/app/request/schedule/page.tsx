'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TimeSlotSelector } from '@/components/ui/TimeSlotSelector';
import { WeeklyDaySelector } from '@/components/ui/WeeklyDaySelector';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RequestSchedule {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  weeklyDays?: number[];
  customDates?: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;
}

export default function RequestSchedulePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [requestData, setRequestData] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<
    'daily' | 'weekly' | 'custom'
  >('daily');
  const [schedules, setSchedules] = useState<RequestSchedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(true);

  // Current schedule form state
  const [currentSchedule, setCurrentSchedule] = useState<
    Omit<RequestSchedule, 'id'> & { id: string | 'new' }
  >({
    id: 'new',
    type: 'daily',
    startTime: '09:00',
    endTime: '14:00',
    weeklyDays: [1], // Default to Monday
  });

  useEffect(() => {
    // Get request data from session storage
    const storedRequest = sessionStorage.getItem('pendingRequest');
    if (storedRequest) {
      setRequestData(JSON.parse(storedRequest));
    }
  }, []);

  const handleScheduleTypeChange = (type: 'daily' | 'weekly' | 'custom') => {
    setScheduleType(type);
    setCurrentSchedule((prev) => ({
      ...prev,
      type,
      weeklyDays: type === 'weekly' ? [1] : undefined,
    }));
  };

  const handleScheduleChange = (field: keyof RequestSchedule, value: any) => {
    setCurrentSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSchedule = () => {
    if (!isScheduleValid()) return;

    const newSchedule: RequestSchedule = {
      ...currentSchedule,
      id: Date.now().toString(),
    } as RequestSchedule;

    setSchedules((prev) => [...prev, newSchedule]);

    // Reset form
    setCurrentSchedule({
      id: 'new',
      type: scheduleType,
      startTime: '09:00',
      endTime: '14:00',
      weeklyDays: scheduleType === 'weekly' ? [1] : undefined,
    });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const isScheduleValid = () => {
    if (currentSchedule.type === 'daily') {
      return (
        currentSchedule.startDate &&
        currentSchedule.endDate &&
        currentSchedule.startTime &&
        currentSchedule.endTime
      );
    }
    if (currentSchedule.type === 'weekly') {
      return (
        currentSchedule.weeklyDays?.length &&
        currentSchedule.startTime &&
        currentSchedule.endTime
      );
    }
    if (currentSchedule.type === 'custom') {
      return currentSchedule.customDates?.length;
    }
    return false;
  };

  const handleContinue = () => {
    // Auto-save current schedule if valid
    if (isScheduleValid() && showAddForm) {
      handleAddSchedule();
    }

    if (schedules.length === 0 && !isScheduleValid()) return;

    // Store schedule data
    const requestWithSchedule = {
      ...requestData,
      schedules:
        schedules.length > 0
          ? schedules
          : [{ ...currentSchedule, id: Date.now().toString() }],
    };

    sessionStorage.setItem(
      'pendingRequest',
      JSON.stringify(requestWithSchedule)
    );
    router.push('/request/summary');
  };

  const formatScheduleDisplay = (schedule: RequestSchedule) => {
    switch (schedule.type) {
      case 'daily':
        if (schedule.startDate && schedule.endDate) {
          return `Daily: ${format(schedule.startDate, 'dd/MM')} - ${format(schedule.endDate, 'dd/MM')}, ${schedule.startTime} - ${schedule.endTime}`;
        }
        return `Daily: ${schedule.startTime} - ${schedule.endTime}`;
      case 'weekly':
        if (schedule.weeklyDays?.length) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const days = schedule.weeklyDays.map((d) => dayNames[d]).join(', ');
          return `Weekly: ${days}, ${schedule.startTime} - ${schedule.endTime}`;
        }
        return `Weekly: ${schedule.startTime} - ${schedule.endTime}`;
      case 'custom':
        const count = schedule.customDates?.length || 0;
        return `Custom: ${count} dates selected`;
      default:
        return 'Default';
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
title="Default"
            backHref="/request/recurring-form"
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
            disabled={schedules.length === 0 && !isScheduleValid()}
            className="w-full"
          >
            Continue
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <main className="contents">
        <h2 className="text-xl font-semibold mb-2">Request Schedule</h2>
        <p className="text-sm text-gray-600 mb-4">
          Set up when you need food delivered
        </p>

        {/* Schedule Type Selector */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-black">Schedule Type</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'custom'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleScheduleTypeChange(type)}
                className={cn(
                  'px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                  scheduleType === type
                    ? 'border-[#024209] bg-[#eafcd6] text-[#024209]'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Existing Schedules */}
        {schedules.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-black">Configured Schedules</h3>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 h-[56px] rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
              >
                <span className="font-semibold text-interactive">
                  {formatScheduleDisplay(schedule)}
                </span>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#CB0003] text-[#CB0003] hover:bg-black/5"
                  title="Default"
                >
                  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
                    <path
                      d="M10.7325 4.6664H3.26824V12.9017C3.26824 13.0797 3.40931 13.224 3.58335 13.224H10.4174C10.5914 13.224 10.7325 13.0797 10.7325 12.9017V4.6664ZM12.0241 12.9017C12.0241 13.8094 11.3048 14.5452 10.4174 14.5452H3.58335C2.69602 14.5452 1.97667 13.8094 1.97667 12.9017V4.6664H0.645774C0.289119 4.6664 0 4.37065 0 4.00581C0 3.64097 0.289119 3.34521 0.645774 3.34521H13.3542L13.3709 3.34542C13.7198 3.35446 14 3.64667 14 4.00581C14 4.36495 13.7198 4.65715 13.3709 4.66619L13.3542 4.6664H12.0241V12.9017Z"
                      fill="#CB0003"
                    />
                    <path
                      d="M9.18653 3.51198V2.59606C9.18653 2.43967 9.03048 2.31287 8.83803 2.31286H5.16197C4.9695 2.31286 4.81345 2.43966 4.81345 2.59606V3.51198L4.81325 3.52575C4.80425 3.8141 4.51376 4.04561 4.15673 4.04561C3.79969 4.04561 3.5092 3.8141 3.5002 3.52575L3.5 3.51198V2.59606C3.5 1.85022 4.24409 1.24561 5.16197 1.24561H8.83803C9.75587 1.24561 10.5 1.85022 10.5 2.59606V3.51198C10.5 3.80669 10.206 4.04561 9.84325 4.04561C9.48055 4.0456 9.18653 3.80669 9.18653 3.51198Z"
                      fill="#CB0003"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Configuration Form */}
        {showAddForm && (
          <div className="space-y-6">
            <h3 className="font-semibold text-black">
              {schedules.length > 0
                ? 'Add Another Schedule'
                : 'Configure Schedule'}
            </h3>

            {/* Daily Schedule */}
            {scheduleType === 'daily' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-black font-semibold mb-3">
                    Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        className="rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base"
                      >
                        {currentSchedule.startDate ? (
                          <span className="text-black">
                            {format(currentSchedule.startDate, 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          <span className="text-gray-400">DD/MM/YYYY</span>
                        )}
                        <div className="pointer-events-none">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white border-gray-200"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        weekStartsOn={1}
                        selected={currentSchedule.startDate}
                        onSelect={(date) =>
                          handleScheduleChange('startDate', date)
                        }
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-black font-semibold mb-3">
                    End Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        className="rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base"
                      >
                        {currentSchedule.endDate ? (
                          <span className="text-black">
                            {format(currentSchedule.endDate, 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          <span className="text-gray-400">DD/MM/YYYY</span>
                        )}
                        <div className="pointer-events-none">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white border-gray-200"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        weekStartsOn={1}
                        selected={currentSchedule.endDate}
                        onSelect={(date) =>
                          handleScheduleChange('endDate', date)
                        }
                        initialFocus
                        disabled={(date) =>
                          date < (currentSchedule.startDate || new Date())
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <TimeSlotSelector
                  label = 'Time_range'
                  startTimeLabel = 'StartTime'
                  endTimeLabel = 'EndTime'
                  startTime={currentSchedule.startTime}
                  endTime={currentSchedule.endTime}
                  onStartTimeChange={(time) =>
                    handleScheduleChange('startTime', time)
                  }
                  onEndTimeChange={(time) =>
                    handleScheduleChange('endTime', time)
                  }
                />
              </div>
            )}

            {/* Weekly Schedule */}
            {scheduleType === 'weekly' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-black font-semibold mb-3">
                    Select Days
                  </label>
                  <WeeklyDaySelector
                    selectedDays={currentSchedule.weeklyDays || []}
                    onChange={(days) =>
                      handleScheduleChange('weeklyDays', days)
                    }
                  />
                </div>
                <TimeSlotSelector
                  label="Time Range for Selected Days"
                  startTimeLabel = 'StartTime'
                  endTimeLabel = 'EndTime'
                  startTime={currentSchedule.startTime}
                  endTime={currentSchedule.endTime}
                  onStartTimeChange={(time) =>
                    handleScheduleChange('startTime', time)
                  }
                  onEndTimeChange={(time) =>
                    handleScheduleChange('endTime', time)
                  }
                />
              </div>
            )}

            {/* Custom Schedule */}
            {scheduleType === 'custom' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select specific dates and times when you need food
                </p>
                {/* This would be implemented with a more complex date/time picker */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Custom date selection with individual time ranges will be
                    implemented here
                  </p>
                </div>
              </div>
            )}

            {/* Add Schedule Button */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleAddSchedule}
                disabled={!isScheduleValid()}
                className={cn(
                  'text-interactive font-semibold text-base underline underline-offset-4 px-2 py-1 rounded transition-colors',
                  isScheduleValid()
                    ? 'hover:bg-[#eafcd6] cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                )}
              >
                Add Schedule
              </button>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
