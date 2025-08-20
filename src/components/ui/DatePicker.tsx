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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DatePickerProps {
  label?: string;
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string; // e.g. "DD/MM/YYYY"
  dateFormat?: string; // e.g. 'dd/MM/yyyy'
  disablePastDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  date,
  onDateChange,
  disabled = false,
  error,
  className = '',
  placeholder = 'dd.mm.yyyy',
  dateFormat = 'dd/MM/yyyy',
  disablePastDates = true,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDisabledDates = () => {
    const disabled: any = {};

    if (disablePastDates) {
      disabled.before = new Date();
    }

    if (minDate) {
      disabled.before = minDate;
    }

    if (maxDate) {
      disabled.after = maxDate;
    }

    return disabled;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 block">
          {label}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            disabled={disabled}
            className={cn(
              'rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base h-12',
              !date && 'text-muted-foreground',
              error && 'border-red-500'
            )}
          >
            {date ? (
              <span className="text-black">{format(date, dateFormat)}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
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
              onDateChange?.(selectedDate);
              setIsOpen(false);
            }}
            disabled={getDisabledDates()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
