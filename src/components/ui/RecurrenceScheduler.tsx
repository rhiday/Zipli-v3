'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from './Input';
import { WeeklyDaySelector } from './WeeklyDaySelector';
import { Calendar } from './calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

// Data structure for database integration
export interface RecurrenceSchedule {
  type: 'daily' | 'weekly' | 'custom';
  // For daily: start and end dates with time range
  dailySchedule?: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  // For weekly: array of day indices with time ranges
  weeklySchedule?: Array<{
    dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
    startTime: string;
    endTime: string;
  }>;
  // For custom: array of specific dates with time ranges
  customSchedule?: Array<{
    date: string; // ISO date string
    startTime: string;
    endTime: string;
  }>;
  // Legacy fields for backward compatibility
  weeklyDays?: number[];
  customDates?: string[];
}

interface RecurrenceSchedulerProps {
  value: RecurrenceSchedule;
  onChange: (schedule: RecurrenceSchedule) => void;
  className?: string;
  label?: string;
  error?: string;
  hint?: string;
}

const RECURRENCE_OPTIONS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'custom', label: 'Custom' },
] as const;

export const RecurrenceScheduler: React.FC<RecurrenceSchedulerProps> = ({
  value,
  onChange,
  className = '',
  label = 'Recurrence Schedule',
  error,
  hint,
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Initialize selected dates from value
  useEffect(() => {
    if (value.customDates) {
      setSelectedDates(value.customDates.map((dateStr) => new Date(dateStr)));
    }
  }, [value.customDates]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleOptionSelect = (type: RecurrenceSchedule['type']) => {
    const newSchedule: RecurrenceSchedule = { type };

    if (type === 'weekly') {
      // Default to Monday if switching to weekly
      newSchedule.weeklyDays = value.weeklyDays?.length
        ? value.weeklyDays
        : [1];
    } else if (type === 'custom') {
      // Keep existing custom dates or initialize empty
      newSchedule.customDates = value.customDates || [];
    }

    onChange(newSchedule);

    // Close dropdown after selection, except for custom which needs date selection
    if (type !== 'custom') {
      setOpen(false);
    }
  };

  const handleWeeklyDaysChange = (days: number[]) => {
    onChange({
      ...value,
      weeklyDays: days,
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const currentDates = value.customDates || [];

    // Toggle date selection
    const newDates = currentDates.includes(dateStr)
      ? currentDates.filter((d) => d !== dateStr)
      : [...currentDates, dateStr].sort();

    // Update selected dates for visual feedback
    const newSelectedDates = selectedDates.some(
      (d) => format(d, 'yyyy-MM-dd') === dateStr
    )
      ? selectedDates.filter((d) => format(d, 'yyyy-MM-dd') !== dateStr)
      : [...selectedDates, date];

    setSelectedDates(newSelectedDates);

    onChange({
      ...value,
      customDates: newDates,
    });

    // Close the calendar popup
    setCalendarOpen(false);
  };

  const removeCustomDate = (dateStr: string) => {
    const newDates = (value.customDates || []).filter((d) => d !== dateStr);
    setSelectedDates(
      selectedDates.filter((d) => format(d, 'yyyy-MM-dd') !== dateStr)
    );

    onChange({
      ...value,
      customDates: newDates,
    });
  };

  const getDisplayText = () => {
    switch (value.type) {
      case 'daily':
        return 'Default';
      case 'weekly':
        if (value.weeklyDays?.length) {
          const dayMap = {
            0: 'Sun',
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thu',
            5: 'Fri',
            6: 'Sat',
          };
          const days = value.weeklyDays
            .sort((a, b) => a - b)
            .map((d) => dayMap[d as keyof typeof dayMap])
            .join(', ');
          return `Weekly (${days})`;
        }
        return 'Default';
      case 'custom':
        const count = value.customDates?.length || 0;
        return count > 0 ? `Custom (${count} dates selected)` : 'Custom';
      default:
        return 'Select schedule...';
    }
  };

  const isDateDisabled = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className={cn('w-full space-y-4', className)} ref={containerRef}>
      <div className="w-full">
        <label className="block text-label font-semibold mb-2">{label}</label>
        <div className="relative">
          <Input
            readOnly
            value={getDisplayText()}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
            variant={error ? 'error' : 'default'}
          />
          {open && (
            <div className="absolute left-0 right-0 mt-2 bg-base border border-border rounded-md shadow-lg z-20 overflow-hidden">
              {RECURRENCE_OPTIONS.map((option, index) => (
                <div
                  key={option.key}
                  className={cn(
                    'flex items-center px-4 py-3 cursor-pointer transition-all duration-200',
                    'hover:bg-cloud active:bg-positive/10',
                    value.type === option.key &&
                      'bg-positive/20 border-l-4 border-positive',
                    index !== RECURRENCE_OPTIONS.length - 1 &&
                      'border-b border-border/50'
                  )}
                  onClick={() => handleOptionSelect(option.key)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 transition-colors',
                        value.type === option.key
                          ? 'border-positive bg-positive'
                          : 'border-border hover:border-positive'
                      )}
                    >
                      {value.type === option.key && (
                        <div className="w-full h-full rounded-full bg-primary scale-50" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-bodyLg font-medium transition-colors',
                        value.type === option.key
                          ? 'text-primary'
                          : 'text-secondary hover:text-primary'
                      )}
                    >
                      {option.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-1 text-[14px] font-manrope text-negative">
            {error}
          </div>
        )}
        {!error && hint && (
          <div className="mt-1 text-[14px] font-manrope text-secondary">
            {hint}
          </div>
        )}
      </div>

      {/* Weekly Day Selector */}
      {value.type === 'weekly' && (
        <div className="pt-2">
          <WeeklyDaySelector
            selectedDays={value.weeklyDays || []}
            onChange={handleWeeklyDaysChange}
          />
        </div>
      )}

      {/* Custom Date Selection */}
      {value.type === 'custom' && (
        <div className="space-y-4">
          {/* Date Picker */}
          <div>
            <p className="text-label text-secondary mb-2">
              Select specific dates
            </p>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'w-full flex items-center justify-between h-12 px-4 py-3 rounded-md border bg-base text-left',
                    'border-border hover:bg-cloud transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2'
                  )}
                >
                  <span className="text-body text-primary">
                    Click to select dates
                  </span>
                  <CalendarIcon className="h-4 w-4 text-secondary" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-base" align="start">
                <Calendar
                  mode="single"
                  selected={undefined}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  modifiers={{
                    selected: selectedDates,
                  }}
                  modifiersStyles={{
                    selected: {
                      backgroundColor: 'rgb(166, 241, 117)',
                      color: 'rgb(2, 29, 19)',
                      fontWeight: 'bold',
                    },
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Dates Display */}
          {value.customDates && value.customDates.length > 0 && (
            <div>
              <p className="text-label text-secondary mb-2">Selected dates:</p>
              <div className="flex flex-wrap gap-2">
                {value.customDates.map((dateStr) => (
                  <div
                    key={dateStr}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-positive/20 rounded-full"
                  >
                    <span className="text-label text-primary">
                      {format(new Date(dateStr), 'MMM dd, yyyy')}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCustomDate(dateStr)}
                      className="ml-1 hover:bg-primary/10 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary for Daily */}
      {value.type === 'daily' && (
        <div className="p-3 rounded-md bg-positive/10 border border-positive/20">
          <p className="text-label text-primary">
            Request will repeat every day between the selected date range
          </p>
        </div>
      )}
    </div>
  );
};

RecurrenceScheduler.displayName = 'RecurrenceScheduler';
