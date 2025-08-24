'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { useRequestStore } from '@/store/request';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';

interface RecurringSchedule {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_OPTIONS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export default function RequestSchedulePage() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const [requestData, setRequestData] = useState<any>(null);

  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('14:00');
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [editingTime, setEditingTime] = useState<'start' | 'end' | null>(null);

  // Date fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const storedRequest = sessionStorage.getItem('pendingRequest');
    if (storedRequest) {
      const data = JSON.parse(storedRequest);
      setRequestData(data);
      // Initialize dates if they exist
      if (data.startDate) setStartDate(data.startDate);
      if (data.endDate) setEndDate(data.endDate);
    }
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addSchedule = () => {
    if (selectedDays.length === 0) return;

    const newSchedule: RecurringSchedule = {
      id: Date.now().toString(),
      days: selectedDays,
      startTime,
      endTime,
    };

    setSchedules([...schedules, newSchedule]);
    // Reset form
    setSelectedDays([]);
    setStartTime('09:00');
    setEndTime('14:00');
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const formatScheduleDisplay = (schedule: RecurringSchedule) => {
    const days = schedule.days.join(', ');
    return `${days}, ${schedule.startTime} - ${schedule.endTime}`;
  };

  const canAddSchedule = selectedDays.length > 0;
  const hasValidDates =
    startDate && endDate && new Date(startDate) <= new Date(endDate);
  const canContinue = hasValidDates && (schedules.length > 0 || canAddSchedule);

  const handleContinue = () => {
    // If there's a pending schedule, add it
    if (canAddSchedule) {
      addSchedule();
    }

    const finalSchedules =
      canAddSchedule && schedules.length === 0
        ? [
            {
              id: Date.now().toString(),
              days: selectedDays,
              startTime,
              endTime,
            },
          ]
        : schedules;

    const requestWithSchedule = {
      ...requestData,
      recurringSchedules: finalSchedules,
      startDate: startDate,
      endDate: endDate,
    };

    sessionStorage.setItem(
      'pendingRequest',
      JSON.stringify(requestWithSchedule)
    );
    router.push('/request/summary');
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('recurringRequest')}
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
            disabled={!canContinue}
            className="w-full"
          >
            Continue
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <main className="contents">
        {/* Existing Schedules */}
        {schedules.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Pickup slots</h2>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
              >
                <span className="font-semibold text-interactive">
                  {formatScheduleDisplay(schedule)}
                </span>
                <div className="flex gap-2">
                  <button
                    className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white"
                    title={t('edit')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165Z"
                        fill="#024209"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeSchedule(schedule.id)}
                    className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#CB0003] bg-white"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4 text-[#CB0003]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Period */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('requestPeriod')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label font-semibold mb-3">
                {t('startDate')}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-label font-semibold mb-3">
                {t('endDate')}
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || format(new Date(), 'yyyy-MM-dd')}
                className="w-full"
              />
            </div>
          </div>
          {startDate && endDate && (
            <div className="p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
              <div className="text-sm font-semibold text-[#024209]">
                {t('requestPeriod')}:{' '}
                {format(new Date(startDate), 'dd.MM.yyyy')} -{' '}
                {format(new Date(endDate), 'dd.MM.yyyy')}
              </div>
            </div>
          )}
        </div>

        {/* Add Schedule Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {schedules.length > 0
              ? 'Add another schedule'
              : 'Set your schedule'}
          </h2>

          {/* Day Selection */}
          <div>
            <label className="block text-label font-semibold mb-3">
              Select days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(FULL_WEEKDAYS[index])}
                  className={cn(
                    'h-12 rounded-lg border text-sm font-medium transition-all',
                    selectedDays.includes(FULL_WEEKDAYS[index])
                      ? 'border-[#024209] bg-[#eafcd6] text-[#024209]'
                      : 'border-[#D9DBD5] bg-white text-gray-700 hover:border-gray-400'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label font-semibold mb-3">
                Start time
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowTimeSelector(true);
                  setEditingTime('start');
                }}
                className="w-full px-4 py-4 rounded-[12px] border border-[#D9DBD5] bg-white text-left flex items-center justify-between"
              >
                <span className="text-lg">{startTime}</span>
                <Clock className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <label className="block text-label font-semibold mb-3">
                End time
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowTimeSelector(true);
                  setEditingTime('end');
                }}
                className="w-full px-4 py-4 rounded-[12px] border border-[#D9DBD5] bg-white text-left flex items-center justify-between"
              >
                <span className="text-lg">{endTime}</span>
                <Clock className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Add Button */}
          {selectedDays.length > 0 && (
            <button
              type="button"
              onClick={addSchedule}
              className="text-interactive font-semibold text-base underline underline-offset-4"
            >
              Add pickup slot
            </button>
          )}
        </div>

        {/* Time Selector Modal */}
        {showTimeSelector && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Select {editingTime === 'start' ? 'start' : 'end'} time
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      if (editingTime === 'start') {
                        setStartTime(time);
                      } else {
                        setEndTime(time);
                      }
                      setShowTimeSelector(false);
                      setEditingTime(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    {time}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowTimeSelector(false);
                  setEditingTime(null);
                }}
                className="w-full py-3 text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
