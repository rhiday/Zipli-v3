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
import { DatePicker } from '@/components/ui/DatePicker';
import { format } from 'date-fns';

interface RecurringSchedule {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const FULL_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
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
  const { setRequestData: updateRequestStore } = useRequestStore();
  const [requestData, setRequestData] = useState<any>(null);

  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('14:00');
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [editingTime, setEditingTime] = useState<'start' | 'end' | null>(null);

  // Date fields
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const storedRequest = sessionStorage.getItem('pendingRequest');
    if (storedRequest) {
      const data = JSON.parse(storedRequest);
      setRequestData(data);
      // Initialize start date if it exists
      if (data.startDate) setStartDate(new Date(data.startDate));
      // Load existing recurring schedules
      if (data.recurringSchedules && Array.isArray(data.recurringSchedules)) {
        setSchedules(data.recurringSchedules);
      }
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

  const editSchedule = (schedule: RecurringSchedule) => {
    // Pre-populate the form with the schedule data
    setSelectedDays(schedule.days);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    // Remove the schedule from the list so user can re-add it
    setSchedules(schedules.filter((s) => s.id !== schedule.id));
  };

  const formatScheduleDisplay = (schedule: RecurringSchedule) => {
    const days = schedule.days.join(', ');
    return `${days}, ${schedule.startTime} - ${schedule.endTime}`;
  };

  const canAddSchedule = selectedDays.length > 0;
  const hasValidDates = startDate !== undefined;
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
      startDate: startDate?.toISOString().split('T')[0],
    };

    // Update the Zustand store as well
    updateRequestStore({
      startDate: startDate?.toISOString().split('T')[0] || '',
    });

    sessionStorage.setItem(
      'pendingRequest',
      JSON.stringify(requestWithSchedule)
    );
    router.push('/request/summary');
  };

  return (
    <>
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
              size="cta"
              className="w-full"
            >
              {t('continue')}
            </Button>
          </BottomActionBar>
        }
        className="bg-white"
      >
        <div className="space-y-6">
          {/* Request Period */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#021d13]">
              {t('requestPeriod')}
            </h2>
            <div className="space-y-3">
              {!startDate && (
                <DatePicker
                  label={t('startDate')}
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="dd.mm.yyyy"
                  dateFormat="dd.MM.yyyy"
                  disablePastDates={true}
                  className="w-full"
                />
              )}
              {startDate && (
                <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5] min-h-[56px]">
                  <div className="text-sm font-semibold text-[#024209]">
                    {t('startDate')}: {format(startDate, 'dd.MM.yyyy')}
                  </div>
                  <button
                    onClick={() => {
                      // Clear date to allow re-editing
                      setStartDate(undefined);
                    }}
                    className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                    title="Edit start date"
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
                </div>
              )}
            </div>
          </div>

          {/* Add Schedule Form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#021d13]">
              {schedules.length > 0
                ? t('addAnotherSchedule')
                : t('setYourSchedule')}
            </h2>

            {/* Day Selection */}
            <div className="space-y-3">
              <label className="block text-label font-semibold">
                {t('selectDays')}
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
                    {t(day)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-label font-semibold">
                  {t('startTime')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeSelector(true);
                    setEditingTime('start');
                  }}
                  className="w-full px-4 py-4 rounded-[12px] border border-[#D9DBD5] bg-white text-left flex items-center justify-between h-12 transition-colors hover:border-gray-400"
                >
                  <span className="text-lg">{startTime}</span>
                  <Clock className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                <label className="block text-label font-semibold">
                  {t('endTime')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeSelector(true);
                    setEditingTime('end');
                  }}
                  className="w-full px-4 py-4 rounded-[12px] border border-[#D9DBD5] bg-white text-left flex items-center justify-between h-12 transition-colors hover:border-gray-400"
                >
                  <span className="text-lg">{endTime}</span>
                  <Clock className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Add Button */}
            {selectedDays.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-interactive font-semibold text-base underline underline-offset-4 hover:no-underline transition-all"
                >
                  {t('addPickupSlot')}
                </button>
              </div>
            )}
          </div>

          {/* Existing Schedules - Moved to bottom */}
          {schedules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#021d13]">
                Pickup slots
              </h2>
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5] min-h-[56px]"
                  >
                    <span className="font-semibold text-interactive">
                      {formatScheduleDisplay(schedule)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editSchedule(schedule)}
                        className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                        title={t('edit')}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
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
                        className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#CB0003] bg-white transition-colors hover:bg-red-50"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4 text-[#CB0003]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Time Selector Modal - Outside PageContainer for proper overlay */}
      {showTimeSelector && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              {t('select')}{' '}
              {editingTime === 'start' ? t('startTime') : t('endTime')}
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
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
                  className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center"
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
              className="w-full py-3 text-gray-600 text-center font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
