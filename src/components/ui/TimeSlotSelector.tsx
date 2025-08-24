'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid, isAfter, addDays } from 'date-fns';
import {
  validatePickupDateTime,
  sanitizeTimeString,
} from '@/lib/date-time-validation';

// Generate time options (00:00 to 23:30 in 30-minute intervals)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

interface TimeSlotSelectorProps {
  label?: string;
  dateLabel?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  onDateChange?: (date: Date | undefined) => void;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  datePlaceholder?: string; // e.g. "DD/MM/YYYY"
  dateFormat?: string; // e.g. 'dd/MM/yyyy'
  minDate?: Date;
  maxDate?: Date;
  validateOnChange?: boolean;
  onValidationError?: (errors: string[]) => void;
  businessHoursOnly?: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  label,
  dateLabel,
  startTimeLabel,
  endTimeLabel,
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
  error,
  className = '',
  datePlaceholder = 'DD/MM/YYYY',
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
  validateOnChange = true,
  onValidationError,
  businessHoursOnly = true,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  // Filter time options for business hours if needed
  const getFilteredTimeOptions = () => {
    if (!businessHoursOnly) return timeOptions;

    return timeOptions.filter((time) => {
      const [hours] = time.split(':').map(Number);
      return hours >= 8 && hours <= 20; // Business hours: 8 AM to 8 PM
    });
  };

  const validateTimeSlot = () => {
    if (!date || !startTime || !endTime) return;

    const validation = validatePickupDateTime(date, startTime, endTime);
    if (!validation.isValid) {
      onValidationError?.(validation.errors);
    }
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    if (validateOnChange && selectedDate && startTime && endTime) {
      setTimeout(validateTimeSlot, 0);
    }
  };

  const handleStartTimeChange = (time: string) => {
    try {
      const sanitizedTime = sanitizeTimeString(time);
      onStartTimeChange?.(sanitizedTime);
      if (validateOnChange && date && endTime) {
        setTimeout(validateTimeSlot, 0);
      }
    } catch (error) {
      onValidationError?.(['Invalid time format']);
    }
  };

  const handleEndTimeChange = (time: string) => {
    try {
      const sanitizedTime = sanitizeTimeString(time);
      onEndTimeChange?.(sanitizedTime);
      if (validateOnChange && date && startTime) {
        setTimeout(validateTimeSlot, 0);
      }
    } catch (error) {
      onValidationError?.(['Invalid time format']);
    }
  };

  // Create disabled dates object for Calendar component
  const getDisabledDates = () => {
    const disabled: any = {};

    // Use minDate if provided, otherwise disable past dates
    if (minDate) {
      disabled.before = minDate;
    } else {
      disabled.before = new Date();
    }

    // Use maxDate if provided, otherwise limit to 1 year
    if (maxDate) {
      disabled.after = maxDate;
    } else {
      disabled.after = addDays(new Date(), 365);
    }

    return disabled;
  };

  const filteredTimeOptions = getFilteredTimeOptions();

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <Label className="text-lg font-medium text-gray-900">{label}</Label>
      )}

      {/* Date Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {dateLabel}
        </Label>
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              disabled={disabled}
              className={cn(
                'rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base',
                !date && 'text-muted-foreground'
              )}
            >
              {date ? (
                <span className="text-black">{format(date, dateFormat)}</span>
              ) : (
                <span className="text-gray-400">{datePlaceholder}</span>
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
              selected={date}
              onSelect={(selectedDate) => {
                handleDateChange(selectedDate);
                setIsDateOpen(false);
              }}
              disabled={getDisabledDates()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {startTimeLabel}
          </Label>
          <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                disabled={disabled}
                className={cn(
                  'rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base',
                  !startTime && 'text-muted-foreground'
                )}
              >
                <span className="text-black">{startTime || '--:--'}</span>
                <div className="pointer-events-none">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white border-gray-200"
              align="start"
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredTimeOptions.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                      startTime === option && 'bg-[#eafcd6] font-semibold'
                    )}
                    onClick={() => {
                      handleStartTimeChange(option);
                      setIsStartTimeOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* End Time */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {endTimeLabel}
          </Label>
          <Popover open={isEndTimeOpen} onOpenChange={setIsEndTimeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                disabled={disabled}
                className={cn(
                  'rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base',
                  !endTime && 'text-muted-foreground'
                )}
              >
                <span className="text-black">{endTime || '--:--'}</span>
                <div className="pointer-events-none">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white border-gray-200"
              align="start"
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredTimeOptions.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                      endTime === option && 'bg-[#eafcd6] font-semibold'
                    )}
                    onClick={() => {
                      handleEndTimeChange(option);
                      setIsEndTimeOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

TimeSlotSelector.displayName = 'TimeSlotSelector';
