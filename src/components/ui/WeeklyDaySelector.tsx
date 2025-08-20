'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface WeeklyDaySelectorProps {
  selectedDays: number[]; // 0=Sunday, 1=Monday, etc.
  onChange: (days: number[]) => void;
  className?: string;
}

const DAYS = [
  { index: 1, key: 'monday', short: 'M' },
  { index: 2, key: 'tuesday', short: 'T' },
  { index: 3, key: 'wednesday', short: 'W' },
  { index: 4, key: 'thursday', short: 'T' },
  { index: 5, key: 'friday', short: 'F' },
  { index: 6, key: 'saturday', short: 'S' },
  { index: 0, key: 'sunday', short: 'S' },
];

export const WeeklyDaySelector: React.FC<WeeklyDaySelectorProps> = ({
  selectedDays,
  onChange,
  className = '',
}) => {
  const { t } = useLanguage();

  const toggleDay = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((day) => day !== dayIndex)
      : [...selectedDays, dayIndex];

    onChange(newSelectedDays);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm text-secondary">
        {t('selectDaysOfWeek') || 'Select days of the week'}
      </p>

      <div className="flex justify-center gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.index);

          return (
            <button
              key={day.index}
              type="button"
              onClick={() => toggleDay(day.index)}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all duration-200',
                'border focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2',
                isSelected
                  ? 'bg-interactive text-white border-interactive hover:bg-interactive/90'
                  : 'bg-base text-primary border-border hover:bg-cloud hover:border-interactive'
              )}
              aria-label={t(day.key as any) || day.key}
            >
              {day.short}
            </button>
          );
        })}
      </div>

      {selectedDays.length > 0 && (
        <p className="text-sm text-secondary text-center">
          {selectedDays.length === 1
            ? t('selectedDay') || 'Selected day'
            : `${selectedDays.length} ${t('selectedDays') || 'selected days'}`}
        </p>
      )}
    </div>
  );
};
