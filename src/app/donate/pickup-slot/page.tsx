'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditIcon } from '@/components/ui/icons/EditIcon';
import { DeleteIcon } from '@/components/ui/icons/DeleteIcon';
import { useDonationStore } from '@/store/donation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

interface PickupSlot {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
}

export default function PickupSlotPage() {
  const router = useRouter();
  const { addDonation, currentUser } = useDatabase();
  const {
    donationItems,
    pickupSlots,
    addPickupSlot,
    updatePickupSlot,
    deletePickupSlot,
    clearDonation,
  } = useDonationStore();
  const { t } = useCommonTranslation();

  // Helper function to safely format dates
  const formatSlotDate = (date: Date | undefined | string) => {
    if (!date) return null;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return null;
      return format(dateObj, 'dd.M.yyyy');
    } catch {
      return null;
    }
  };
  const [currentSlot, setCurrentSlot] = useState<
    Omit<PickupSlot, 'id'> & { id: string | 'new' }
  >({
    id: 'new',
    date: undefined,
    startTime: '09:00',
    endTime: '14:00',
  });
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(pickupSlots.length === 0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  const handleCurrentSlotChange = (
    field: keyof Omit<PickupSlot, 'id'>,
    value: any
  ) => {
    setCurrentSlot((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSlot = () => {
    if (!currentSlot.date) return; // Basic validation

    if (currentSlot.id === 'new') {
      addPickupSlot(currentSlot);
    } else {
      updatePickupSlot(currentSlot as PickupSlot);
    }
    // Always keep form open for next slot (unless editing)
    setCurrentSlot({
      id: 'new',
      date: undefined,
      startTime: '09:00',
      endTime: '14:00',
    });
    setShowAddForm(true);
  };

  const handleDeleteSlot = (id: string) => {
    deletePickupSlot(id);
    // If this was the last pickup slot, show the add form
    if (pickupSlots.length === 1) {
      setShowAddForm(true);
    }
  };

  const handleEditSlot = (id: string) => {
    const slotToEdit = pickupSlots.find((slot) => slot.id === id);
    if (slotToEdit) {
      setCurrentSlot(slotToEdit);
      setShowAddForm(true);
    }
  };

  const handleAddTimeSlotClick = () => {
    setShowAddForm(true);
  };

  const handleSubmitDonation = async () => {
    // For now, just navigate to summary page
    // The actual donation creation should happen after reviewing in summary
    // This avoids the complexity of managing food_item_ids here

    // Auto-save current slot if form is filled out
    if (
      currentSlot.date &&
      currentSlot.startTime &&
      currentSlot.endTime &&
      showAddForm
    ) {
      if (currentSlot.id === 'new') {
        addPickupSlot(currentSlot);
      } else {
        updatePickupSlot(currentSlot as PickupSlot);
      }
    }

    // Check if we have at least one slot (including the one we just saved)
    const totalSlots =
      pickupSlots.length + (currentSlot.date && showAddForm ? 1 : 0);
    if (totalSlots === 0) return;

    // Navigate to summary page where the actual donation will be created
    router.push('/donate/summary');
  };

  const isFormValid =
    currentSlot.date && currentSlot.startTime && currentSlot.endTime;

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('addPickupSlot')}
            backHref="/donate/manual"
            onBackClick={handleBackClick}
          />
          <div className="px-4 pt-2">
            <Progress value={50} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitDonation}
              disabled={
                pickupSlots.length === 0 &&
                (!showAddForm ||
                  !currentSlot.date ||
                  !currentSlot.startTime ||
                  !currentSlot.endTime)
              }
            >
              {t('continue')}
            </Button>
          </div>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <main className="contents">
        <h2 className="text-xl font-semibold mb-2">{t('pickupSlot')}</h2>
        <div className="flex flex-col gap-4">
          {pickupSlots.map((slot) => (
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
                  aria-label="Edit"
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

        {/* Show "Add pickup slot" button when no slots exist and form is not shown */}
        {pickupSlots.length === 0 && !showAddForm && (
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

        {showAddForm && (
          <div className="flex flex-col gap-6">
            {(pickupSlots.length > 0 || currentSlot.id !== 'new') && (
              <h3 className="text-lg font-semibold text-[#021d13] mt-4">
                {currentSlot.id !== 'new'
                  ? t('editPickupSlot')
                  : t('addAnotherPickupSlot')}
              </h3>
            )}
            {/* Date Picker */}
            <div>
              <label className="block text-black font-semibold mb-3">
                {t('dateLabel')}
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className="rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base"
                  >
                    {currentSlot.date &&
                    currentSlot.date instanceof Date &&
                    !isNaN(currentSlot.date.getTime()) ? (
                      <span className="text-black">
                        {format(currentSlot.date, 'dd/MM/yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-400">DD/MM/YYYY</span>
                    )}
                    <div className="pointer-events-none">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#024209] bg-white">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 bg-white border-gray-200"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    weekStartsOn={1}
                    selected={currentSlot.date}
                    onSelect={(date) => {
                      handleCurrentSlotChange('date', date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-black font-semibold mb-3">
                  {t('startTimeLabel')}
                </label>
                <Popover
                  open={openPopover === 'start'}
                  onOpenChange={(isOpen) =>
                    setOpenPopover(isOpen ? 'start' : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      className="rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base"
                    >
                      <span className="text-black">
                        {currentSlot.startTime}
                      </span>
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
                      {timeOptions.map((option) => (
                        <div
                          key={option}
                          className={cn(
                            'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                            currentSlot.startTime === option &&
                              'bg-[#eafcd6] font-semibold'
                          )}
                          onClick={() => {
                            handleCurrentSlotChange('startTime', option);
                            setOpenPopover(null);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-black font-semibold mb-3">
                  {t('endTimeLabel')}
                </label>
                <Popover
                  open={openPopover === 'end'}
                  onOpenChange={(isOpen) =>
                    setOpenPopover(isOpen ? 'end' : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      className="rounded-[12px] border-[#D9DBD5] bg-white px-4 py-3 w-full justify-between items-center font-normal text-base"
                    >
                      <span className="text-black">{currentSlot.endTime}</span>
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
                      {timeOptions.map((option) => (
                        <div
                          key={option}
                          className={cn(
                            'px-4 py-2 cursor-pointer hover:bg-[#eafcd6] text-black',
                            currentSlot.endTime === option &&
                              'bg-[#eafcd6] font-semibold'
                          )}
                          onClick={() => {
                            handleCurrentSlotChange('endTime', option);
                            setOpenPopover(null);
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
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleSaveSlot}
                disabled={!isFormValid}
                className={
                  `text-interactive font-semibold text-base underline underline-offset-4 px-2 py-1 rounded transition-colors ` +
                  (isFormValid
                    ? 'hover:bg-[#eafcd6] cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed')
                }
              >
                {currentSlot.id !== 'new'
                  ? t('save')
                  : t('addPickupSlotButton')}
              </button>
            </div>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
