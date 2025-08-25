'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditIcon } from '@/components/ui/icons/EditIcon';
import { DeleteIcon } from '@/components/ui/icons/DeleteIcon';
import { useCommonTranslation } from '@/hooks/useTranslations';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

export interface PickupSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

interface PickupSlotManagerProps {
  slots: PickupSlot[];
  onAddSlot: (slot: Omit<PickupSlot, 'id'>) => void;
  onUpdateSlot: (slot: PickupSlot) => void;
  onDeleteSlot: (id: string) => void;
  className?: string;
  title?: string;
  description?: string;
}

export const PickupSlotManager: React.FC<PickupSlotManagerProps> = ({
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  className,
  title,
  description,
}) => {
  const { t } = useCommonTranslation();
  const [showAddForm, setShowAddForm] = useState(slots.length === 0);
  const [currentSlot, setCurrentSlot] = useState<
    Omit<PickupSlot, 'id'> & { id: string | 'new' }
  >({
    id: 'new',
    date: undefined,
    startTime: '09:00',
    endTime: '17:00',
  });

  // Helper function to safely format dates
  const safeFormatDate = (date: Date | undefined): string => {
    if (!date || isNaN(date.getTime())) return '';
    return format(date, 'PPP');
  };

  const formatSlotDate = (date: Date | undefined): string => {
    if (!date || isNaN(date.getTime())) return '';
    return format(date, 'dd/MM/yyyy');
  };

  const handleEditSlot = (id: string) => {
    const slotToEdit = slots.find((slot) => slot.id === id);
    if (slotToEdit) {
      setCurrentSlot(slotToEdit);
      setShowAddForm(true);
    }
  };

  const handleDeleteSlot = (id: string) => {
    onDeleteSlot(id);
    // If this was the last pickup slot, show the add form
    if (slots.length === 1) {
      setShowAddForm(true);
    }
  };

  const handleSaveSlot = () => {
    if (!isFormValid()) return;

    if (currentSlot.id === 'new') {
      onAddSlot(currentSlot);
    } else {
      onUpdateSlot(currentSlot as PickupSlot);
    }

    // Reset form
    setCurrentSlot({
      id: 'new',
      date: undefined,
      startTime: '09:00',
      endTime: '17:00',
    });
    setShowAddForm(false);
  };

  const handleAddTimeSlotClick = () => {
    setCurrentSlot({
      id: 'new',
      date: undefined,
      startTime: '09:00',
      endTime: '17:00',
    });
    setShowAddForm(true);
  };

  const isFormValid = () => {
    return currentSlot.date && currentSlot.startTime && currentSlot.endTime;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}
        </div>
      )}

      {/* Existing Pickup Slots - Compact View */}
      {slots.length > 0 && (
        <div className="flex flex-col gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 h-[56px] rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
            >
              <span className="font-semibold text-interactive">
                {formatSlotDate(slot.date)
                  ? `${formatSlotDate(slot.date)}, ${slot.startTime} - ${slot.endTime}`
                  : t('dateNotSet')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditSlot(slot.id)}
                  className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                  aria-label={t('edit')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z"
                      fill="#024209"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="flex items-center justify-center rounded-full w-[42px] h-[32px] transition-colors bg-white border border-[#CB0003] text-[#CB0003] hover:bg-black/5"
                  aria-label={t('delete')}
                >
                  <svg
                    width="14"
                    height="15"
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.7325 4.6664H3.26824V12.9017C3.26824 13.0797 3.40931 13.224 3.58335 13.224H10.4174C10.5914 13.224 10.7325 13.0797 10.7325 12.9017V4.6664ZM12.0241 12.9017C12.0241 13.8094 11.3048 14.5452 10.4174 14.5452H3.58335C2.69602 14.5452 1.97667 13.8094 1.97667 12.9017V4.6664H0.645774C0.289119 4.6664 0 4.37065 0 4.00581C0 3.64097 0.289119 3.34521 0.645774 3.34521H13.3542L13.3709 3.34542C13.7198 3.35446 14 3.64667 14 4.00581C14 4.36495 13.7198 4.65715 13.3709 4.66619L13.3542 4.6664H12.0241V12.9017Z"
                      fill="#CB0003"
                    />
                    <path
                      d="M9.18653 3.51198V2.59606C9.18653 2.43967 9.03048 2.31287 8.83803 2.31286H5.16197C4.9695 2.31286 4.81345 2.43966 4.81345 2.59606V3.51198L4.81325 3.52575C4.80425 3.8141 4.51376 4.04561 4.15673 4.04561C3.79969 4.04561 3.5092 3.8141 3.5002 3.52575L3.5 3.51198V2.59606C3.5 1.85022 4.24409 1.24561 5.16197 1.24561H8.83803C9.75587 1.24561 10.5 1.85022 10.5 2.59606V3.51198C10.5 3.80669 10.206 4.04561 9.84325 4.04561C9.48055 4.0456 9.18653 3.80669 9.18653 3.51198Z"
                      fill="#CB0003"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show "Add pickup slot" button when no slots exist and form is not shown */}
      {slots.length === 0 && !showAddForm && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleAddTimeSlotClick}
            variant="secondary"
            className="text-interactive border-interactive hover:bg-[#eafcd6]"
          >
            {t('addPickupSlotButton')}
          </Button>
        </div>
      )}

      {/* Add/Edit Slot Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900">
              {currentSlot.id === 'new'
                ? t('addPickupSlot')
                : t('editPickupSlot')}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setCurrentSlot({
                  id: 'new',
                  date: undefined,
                  startTime: '09:00',
                  endTime: '17:00',
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dateLabel')}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !currentSlot.date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentSlot.date
                      ? safeFormatDate(currentSlot.date)
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentSlot.date}
                    onSelect={(date) =>
                      setCurrentSlot({ ...currentSlot, date })
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('startTimeLabel')}
                </label>
                <select
                  value={currentSlot.startTime}
                  onChange={(e) =>
                    setCurrentSlot({
                      ...currentSlot,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('endTimeLabel')}
                </label>
                <select
                  value={currentSlot.endTime}
                  onChange={(e) =>
                    setCurrentSlot({ ...currentSlot, endTime: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveSlot}
                disabled={!isFormValid()}
                className="flex-1"
              >
                {currentSlot.id === 'new' ? t('addSlot') : t('save')}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setCurrentSlot({
                    id: 'new',
                    date: undefined,
                    startTime: '09:00',
                    endTime: '17:00',
                  });
                }}
                variant="secondary"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Another Slot Button */}
      {slots.length > 0 && !showAddForm && (
        <Button
          variant="secondary"
          onClick={handleAddTimeSlotClick}
          className="w-full"
        >
          {t('addAnotherPickupSlot')}
        </Button>
      )}
    </div>
  );
};
