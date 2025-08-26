'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, Phone, Check } from 'lucide-react';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import type { DonationStatus } from '@/types/supabase';

interface PickupSlot {
  date: string;
  start_time: string;
  end_time: string;
}

interface PickupInfoProps {
  status: DonationStatus;
  claimedAt: string | null;
  pickedUpAt: string | null;
  receiverId: string | null;
  pickupSlots: PickupSlot[] | null;
  instructionsForDriver: string | null;
  onConfirmPickup?: () => void;
  receiverInfo?: {
    name: string;
    phone?: string;
  };
}

export function PickupInfoSection({
  status,
  claimedAt,
  pickedUpAt,
  receiverId,
  pickupSlots,
  instructionsForDriver,
  onConfirmPickup,
  receiverInfo,
}: PickupInfoProps) {
  const { t } = useCommonTranslation();

  // Don't show anything if donation is still available
  if (status === 'available') {
    return null;
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatPickupSlot = (slot: PickupSlot) => {
    const date = new Date(slot.date).toLocaleDateString();
    return `${date} ${slot.start_time} - ${slot.end_time}`;
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'claimed':
        return {
          title: t('donationClaimed'),
          description: t('awaitingPickup'),
          color: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-800',
          showConfirmButton: true,
        };
      case 'picked_up':
        return {
          title: t('donationPickedUp'),
          description: t('pickupCompleted'),
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          showConfirmButton: false,
        };
      case 'cancelled':
        return {
          title: t('donationCancelled'),
          description: t('donationWasCancelled'),
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          showConfirmButton: false,
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className={cn('rounded-lg border-2 p-4 mt-6', statusInfo.color)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={cn('font-semibold text-lg', statusInfo.textColor)}>
            {statusInfo.title}
          </h3>
          <p className={cn('text-sm', statusInfo.textColor)}>
            {statusInfo.description}
          </p>
        </div>
        {status === 'picked_up' && (
          <Check className={cn('w-6 h-6', statusInfo.textColor)} />
        )}
      </div>

      {/* Pickup Timeline */}
      <div className="space-y-3 mb-4">
        {claimedAt && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {t('claimedOn')}: {formatDateTime(claimedAt)}
            </span>
          </div>
        )}

        {pickedUpAt && (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              {t('pickedUpOn')}: {formatDateTime(pickedUpAt)}
            </span>
          </div>
        )}
      </div>

      {/* Receiver Info */}
      {receiverInfo && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">
            {t('receiverInfo')}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{receiverInfo.name}</span>
            </div>
            {receiverInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{receiverInfo.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup Slots */}
      {pickupSlots && pickupSlots.length > 0 && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">
            {t('pickupSchedule')}
          </h4>
          <div className="space-y-1">
            {pickupSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{formatPickupSlot(slot)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Instructions */}
      {instructionsForDriver && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">
            {t('driverInstructions')}
          </h4>
          <p className="text-sm text-gray-600">{instructionsForDriver}</p>
        </div>
      )}

      {/* Confirm Pickup Button */}
      {statusInfo.showConfirmButton && onConfirmPickup && (
        <Button
          onClick={onConfirmPickup}
          className="w-full mt-2"
          variant="primary"
        >
          {t('confirmPickup')}
        </Button>
      )}
    </div>
  );
}
