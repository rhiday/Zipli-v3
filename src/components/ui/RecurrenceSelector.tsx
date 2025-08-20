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

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { t } = useLanguage();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Ensure value has a valid type
  const safeValue = value || { type: 'never' };

  const recurrenceOptions = [
    { type: 'never' as const, label: t('doesNotRepeat') || 'Does not repeat' },
    { type: 'daily' as const, label: t('daily') || 'Daily' },
    { type: 'weekly' as const, label: t('weekly') || 'Weekly' },
    { type: 'custom' as const, label: t('custom') || 'Custom...' },
  ];

  const handleRecurrenceTypeChange = (type: RecurrencePattern['type']) => {
    if (type === 'custom') {
      setIsCustomModalOpen(true);
      return;
    }

    const newPattern: RecurrencePattern = { type };

    if (type === 'weekly') {
      newPattern.weeklyDays = [1]; // Default to Monday
    }

    onChange(newPattern);
  };

  const handleWeeklyDaysChange = (days: number[]) => {
    onChange({
      ...safeValue,
      weeklyDays: days,
    });
  };

  const handleCustomPatternSave = (
    customPattern: RecurrencePattern['customPattern']
  ) => {
    onChange({
      type: 'custom',
      customPattern,
    });
  };

  const getCustomPatternSummary = () => {
    if (!safeValue.customPattern) return '';

    const { frequency, unit, endType, endDate, maxOccurrences } =
      safeValue.customPattern;

    let summary = t('every') || 'Every';
    summary += ` ${frequency} ${
      frequency === 1
        ? unit === 'days'
          ? t('day')
          : t('week')
        : unit === 'days'
          ? t('days')
          : t('weeks')
    }`;

    if (endType === 'date' && endDate) {
      summary += `, ${t('until') || 'until'} ${new Date(endDate).toLocaleDateString()}`;
    } else if (endType === 'occurrences' && maxOccurrences) {
      summary += `, ${maxOccurrences} ${t('times') || 'times'}`;
    }

    return summary;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recurrence Type Options */}
      <div className="space-y-2">
        {recurrenceOptions.map((option) => (
          <label
            key={option.type}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name="recurrenceType"
              checked={safeValue.type === option.type}
              onChange={() => handleRecurrenceTypeChange(option.type)}
              className="w-4 h-4 text-interactive border-border focus:ring-interactive focus:ring-2"
            />
            <span className="text-bodyLg">
              {option.label}
              {option.type === 'custom' && safeValue.type === 'custom' && (
                <span className="text-secondary text-body ml-2">
                  ({getCustomPatternSummary()})
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      {/* Weekly Day Selector */}
      {safeValue.type === 'weekly' && (
        <div className="mt-6 p-4 bg-cloud rounded-md border">
          <WeeklyDaySelector
            selectedDays={safeValue.weeklyDays || []}
            onChange={handleWeeklyDaysChange}
          />
        </div>
      )}

      {/* Custom Recurrence Modal */}
      <CustomRecurrenceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleCustomPatternSave}
        initialPattern={safeValue.customPattern}
      />
    </div>
  );
};
