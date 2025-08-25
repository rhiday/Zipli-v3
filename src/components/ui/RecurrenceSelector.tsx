'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { WeeklyDaySelector } from './WeeklyDaySelector';
import { CustomRecurrenceModal } from './CustomRecurrenceModal';

interface RecurrencePattern {
  type: 'never' | 'daily' | 'weekly' | 'custom';
  weeklyDays?: number[];
  customPattern?: {
    frequency: number;
    unit: 'days' | 'weeks';
    endType: 'never' | 'date' | 'occurrences';
    endDate?: string;
    maxOccurrences?: number;
  };
}

interface RecurrenceSelectorProps {
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
  className?: string;
}

const RECURRENCE_OPTIONS = [
  { key: 'never', label: 'Does not repeat' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'custom', label: 'Custom' },
] as const;

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { t } = useLanguage();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleOptionSelect = (type: RecurrencePattern['type']) => {
    if (type === 'custom') {
      setIsCustomModalOpen(true);
      return;
    }

    const newPattern: RecurrencePattern = { type };

    if (type === 'weekly') {
      // Default to Monday if switching to weekly
      newPattern.weeklyDays = value.weeklyDays?.length ? value.weeklyDays : [1];
    }

    onChange(newPattern);
  };

  const handleWeeklyDaysChange = (days: number[]) => {
    onChange({
      ...value,
      weeklyDays: days,
    });
  };

  const handleCustomPattern = (
    customPattern: RecurrencePattern['customPattern']
  ) => {
    onChange({
      type: 'custom',
      customPattern,
    });
    setIsCustomModalOpen(false);
  };

  const getDisplayText = () => {
    switch (value.type) {
      case 'never':
        return t('doesNotRepeat') || 'Does not repeat';
      case 'daily':
        return t('daily')  || 'Daily';
      case 'weekly':
        if (value.weeklyDays?.length) {
          const dayNames = value.weeklyDays.map((dayIndex) => {
            const dayMap = {
              0: 'sunday',
              1: 'monday',
              2: 'tuesday',
              3: 'wednesday',
              4: 'thursday',
              5: 'friday',
              6: 'saturday',
            };
            return (
              t(dayMap[dayIndex as keyof typeof dayMap] as any) ||
              dayMap[dayIndex as keyof typeof dayMap]
            );
          });
          return `${t('weekly')  || 'Weekly'} (${dayNames.join(', ')})`;
        }
        return t('weekly')  || 'Weekly';
      case 'custom':
        if (value.customPattern) {
          const { frequency, unit, endType } = value.customPattern;
          const unitText =
            frequency === 1
              ? unit === 'days'
                ? t('day') || 'day'
                : t('week') || 'week'
              : unit === 'days'
                ? t('days') || 'days'
                : t('weeks') || 'weeks';

          let baseText = `${t('every')  || 'Every'} ${frequency} ${unitText}`;

          if (endType === 'date' && value.customPattern.endDate) {
            baseText += ` ${t('until') || 'until'} ${value.customPattern.endDate}`;
          } else if (
            endType === 'occurrences' &&
            value.customPattern.maxOccurrences
          ) {
            baseText += ` (${value.customPattern.maxOccurrences} ${t('times') || 'times'})`;
          }

          return baseText;
        }
        return t('custom')  || 'Custom';
      default:
        return t('doesNotRepeat') || 'Does not repeat';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Options */}
      <div className="space-y-2">
        {RECURRENCE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleOptionSelect(option.key)}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-[12px] border text-left transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2',
              value.type === option.key
                ? 'bg-[#F5F9EF] border-interactive text-interactive'
                : 'bg-base border-border text-primary hover:bg-cloud hover:border-interactive'
            )}
          >
            <span className="font-medium">
              {option.key === 'never' && (t('doesNotRepeat') || option.label)}
              {option.key === 'daily' && (t('daily') || option.label)}
              {option.key === 'weekly' && (t('weekly') || option.label)}
              {option.key === 'custom' && (t('custom') || option.label)}
            </span>

            {value.type === option.key && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-interactive">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
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

      {/* Current Selection Summary */}
      {value.type !== 'never' && (
        <div className="p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
          <p className="text-sm text-secondary mb-1">
            {t('recurrencePattern') || 'Recurrence pattern'}:
          </p>
          <p className="font-medium text-interactive">{getDisplayText()}</p>
        </div>
      )}

      {/* Custom Recurrence Modal */}
      <CustomRecurrenceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleCustomPattern}
        initialPattern={value.customPattern}
      />
    </div>
  );
};
