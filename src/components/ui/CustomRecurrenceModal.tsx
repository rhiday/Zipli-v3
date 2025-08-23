'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

interface CustomRecurrencePattern {
  frequency: number;
  unit: 'days' | 'weeks';
  endType: 'never' | 'date' | 'occurrences';
  endDate?: string;
  maxOccurrences?: number;
}

interface CustomRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: CustomRecurrencePattern) => void;
  initialPattern?: CustomRecurrencePattern;
}

export const CustomRecurrenceModal: React.FC<CustomRecurrenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPattern,
}) => {
  const { t } = useLanguage();

  const [pattern, setPattern] = useState<CustomRecurrencePattern>(
    initialPattern || {
      frequency: 1,
      unit: 'weeks',
      endType: 'never',
    }
  );

  const handleSave = () => {
    onSave(pattern);
    onClose();
  };

  const updatePattern = (updates: Partial<CustomRecurrencePattern>) => {
    setPattern((prev) => ({ ...prev, ...updates }));
  };

  const getFrequencyText = () => {
    if (pattern.frequency === 1) {
      return pattern.unit === 'days' ? t('day') : t('week');
    }
    return pattern.unit === 'days' ? t('days') : t('weeks');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('customRecurrence') || 'Custom recurrence'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {t('repeatEvery') || 'Repeat every'}
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={pattern.frequency}
                onChange={(e) =>
                  updatePattern({ frequency: parseInt(e.target.value) || 1 })
                }
                className="w-20"
              />
              <Select
                value={pattern.unit}
                onValueChange={(value: 'days' | 'weeks') =>
                  updatePattern({ unit: value })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">{getFrequencyText()}</SelectItem>
                  <SelectItem value="weeks">{getFrequencyText()}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {t('ends')  || 'Ends'}
            </Label>

            <div className="space-y-3">
              {/* Never */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  checked={pattern.endType === 'never'}
                  onChange={() => updatePattern({ endType: 'never' })}
                  className="w-4 h-4 text-interactive"
                />
                <span className="text-sm">{t('never')  || 'Never'}</span>
              </label>

              {/* On date */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  checked={pattern.endType === 'date'}
                  onChange={() => updatePattern({ endType: 'date' })}
                  className="w-4 h-4 text-interactive"
                />
                <span className="text-sm">{t('on') || 'On'}</span>
                <Input
                  type="date"
                  value={pattern.endDate || ''}
                  onChange={(e) => updatePattern({ endDate: e.target.value })}
                  disabled={pattern.endType !== 'date'}
                  className="flex-1"
                />
              </label>

              {/* After occurrences */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  checked={pattern.endType === 'occurrences'}
                  onChange={() => updatePattern({ endType: 'occurrences' })}
                  className="w-4 h-4 text-interactive"
                />
                <span className="text-sm">{t('after')  || 'After'}</span>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={pattern.maxOccurrences || ''}
                  onChange={(e) =>
                    updatePattern({
                      maxOccurrences: parseInt(e.target.value) || undefined,
                    })
                  }
                  disabled={pattern.endType !== 'occurrences'}
                  className="w-20"
                />
                <span className="text-sm">
                  {t('occurrences') || 'occurrences'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')  || 'Cancel'}
          </Button>
          <Button onClick={handleSave}>{t('done')  || 'Done'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
