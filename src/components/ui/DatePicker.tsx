'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'DD/MM/YYYY',
  className,
  label,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;

  // Update calendar position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCalendarPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on click outside and handle positioning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days from previous month
    const startDayOfWeek = start.getDay();
    const prevMonthDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - (i + 1));
      prevMonthDays.push(date);
    }

    return [...prevMonthDays, ...days];
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const formatDisplayValue = () => {
    if (selectedDate) {
      return format(selectedDate, 'dd.MM.yyyy');
    }
    return '';
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-label font-semibold mb-3">{label}</label>
      )}

      {/* Input Field */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-4 rounded-[12px] border border-[#D9DBD5] bg-white text-left flex items-center justify-between',
          'hover:border-[#024209] focus:border-[#024209] focus:ring-2 focus:ring-[#024209]/20 focus:outline-none',
          'transition-colors duration-200',
          className
        )}
      >
        <span className={cn('text-lg', !selectedDate && 'text-gray-400')}>
          {formatDisplayValue() || placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-400" />
      </button>

      {/* Calendar Popover - Using Portal for proper layering */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[99999] bg-white rounded-[12px] shadow-xl border border-[#D9DBD5] p-6"
            style={{
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              minWidth: '320px',
              width: `${Math.max(320, calendarPosition.width)}px`,
            }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-0 mb-3">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2 h-10 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0">
              {getDaysInMonth().map((date, index) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected =
                  selectedDate && isSameDay(date, selectedDate);
                const isDisabled = isDateDisabled(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      !isDisabled && isCurrentMonth && handleDateSelect(date)
                    }
                    disabled={isDisabled || !isCurrentMonth}
                    className={cn(
                      'h-10 text-sm transition-all duration-200 flex items-center justify-center rounded-md',
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
                      !isDisabled && isCurrentMonth && 'hover:bg-[#F5F9EF]',
                      isSelected &&
                        'bg-[#024209] text-white hover:bg-[#024209]',
                      isToday && !isSelected && 'font-semibold text-[#024209]',
                      isDisabled && 'text-gray-300 cursor-not-allowed'
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between mt-6 pt-4 border-t border-[#D9DBD5]">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="text-[#024209] hover:text-[#024209]/80 text-sm font-medium"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
