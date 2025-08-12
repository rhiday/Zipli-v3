'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  className = "",
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-lg font-medium text-gray-900">
          {label}
        </Label>
      )}
      
      {/* Date Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {dateLabel}
        </Label>
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50",
                !date && "text-muted-foreground"
              )}
            >
              <div className="pointer-events-none">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <span className="ml-3">
                {date ? format(date, 'dd.M.yyyy') : "Select date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                onDateChange?.(selectedDate);
                setIsDateOpen(false);
              }}
              disabled={{ before: new Date() }}
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
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50",
                  !startTime && "text-muted-foreground"
                )}
              >
                <div className="pointer-events-none">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <span className="ml-3">
                  {startTime || "Start time"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
              <div className="max-h-60 overflow-y-auto">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                      startTime === option && 'bg-[#eafcd6] font-semibold'
                    )}
                    onClick={() => {
                      onStartTimeChange?.(option);
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
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50",
                  !endTime && "text-muted-foreground"
                )}
              >
                <div className="pointer-events-none">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <span className="ml-3">
                  {endTime || "End time"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
              <div className="max-h-60 overflow-y-auto">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                      endTime === option && 'bg-[#eafcd6] font-semibold'
                    )}
                    onClick={() => {
                      onEndTimeChange?.(option);
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

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

TimeSlotSelector.displayName = 'TimeSlotSelector';