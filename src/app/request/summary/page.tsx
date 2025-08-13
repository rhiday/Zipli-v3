'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import { SummaryCard, AllergenChips } from '@/components/ui/SummaryCard';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

export default function RequestSummaryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { requestData, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [updateAddressInProfile, setUpdateAddressInProfile] = useState(false);
  const [updateInstructionsInProfile, setUpdateInstructionsInProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.address) setAddress(currentUser.address);
      if ((currentUser as any).driver_instructions) {
        setInstructions((currentUser as any).driver_instructions as string);
      }
    }
  }, [currentUser]);

  const handleSubmitRequest = async () => {
    try {
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      if (!address.trim()) return;

      setIsSaving(true);

      // Optionally update profile
      const { updateUser } = useDatabase.getState();
      if (updateAddressInProfile || updateInstructionsInProfile) {
        const profileUpdates: any = {};
        if (updateAddressInProfile && address !== currentUser.address) profileUpdates.address = address;
        if (updateInstructionsInProfile && instructions !== (currentUser as any).driver_instructions) {
          profileUpdates.driver_instructions = instructions;
        }
        if (Object.keys(profileUpdates).length > 0) {
          updateUser({ ...currentUser, ...profileUpdates });
        }
      }

      // Create the request in the database
      const requestPayload = {
        user_id: currentUser.id,
        description: `Request for ${requestData.quantity} portions - ${requestData.allergens.join(', ')}`,
        people_count: parseInt(requestData.quantity) || 1,
        pickup_date: requestData.pickupDate,
        pickup_start_time: requestData.startTime,
        pickup_end_time: requestData.endTime,
        status: 'active' as const,
        is_recurring: requestData.recurringInterval !== '',
        address,
        instructions,
      };

      const response = await addRequest(requestPayload);

      if (response.error) {
        console.error('Error creating request:', response.error);
        return;
      }

      // Clear the store and navigate to success
      clearRequest();
      router.push('/request/success');
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <PageContainer
      header={(
        <>
          <SecondaryNavbar 
            title={t('requestSummary')} 
            backHref="/request/pickup-slot" 
            onBackClick={handleBackClick}
          />
          <div className="px-4 pt-2">
            <Progress value={100} className="h-2 w-full" />
          </div>
        </>
      )}
      contentClassName="p-4 space-y-6"
      footer={(
        <BottomActionBar>
          <div className="flex justify-end">
            <Button onClick={handleSubmitRequest} className="w-full" disabled={isSaving || !address.trim()}>
              {isSaving ? t('continuing') : t('submitRequest')}
            </Button>
          </div>
        </BottomActionBar>
      )}
      className="bg-white"
    >
          {/* Donation items (requested) */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#021d13]">{t('donationItems')}</h2>
            <div className="flex items-start justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
              <div className="space-y-1">
                <div className="font-semibold text-[#024209]">{t('donationLabel')}</div>
                <div className="text-sm text-gray-600">
                  {t('portions')}: {requestData.quantity || '—'}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                  {t('allergiesIntolerancesDiets')}: <AllergenChips allergens={requestData.allergens} />
                </div>
              </div>
              <button
                onClick={() => router.push('/request/new')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                aria-label="Edit"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z" fill="#024209"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Pickup schedule */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#021d13]">{t('pickupSchedule')}</h2>
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
              <span className="font-semibold text-interactive">
                {requestData.pickupDate
                  ? `${formatDate(requestData.pickupDate)}, ${requestData.startTime} - ${requestData.endTime}`
                  : t('dateNotSet')}
              </span>
              <button
                onClick={() => router.push('/request/pickup-slot')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg:black/5"
                aria-label="Edit schedule"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z" fill="#024209"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Delivery details */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[#021d13]">{t('deliveryDetails')}</h2>
            <div>
              <label htmlFor="address" className="block text-black font-semibold mb-2">{t('address')}</label>
              <Textarea
                id="address"
                placeholder={address ? '' : t('enterYourFullAddress')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="update-address-profile"
                  checked={updateAddressInProfile}
                  onChange={(e) => setUpdateAddressInProfile(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="update-address-profile" className="text-sm text-gray-600">
                  {t('updateAddressInProfile')}
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="driver-instructions" className="block text-black font-semibold mb-2">{t('instructionsForDriver')}</label>
              <Textarea
                id="driver-instructions"
                placeholder={t('pleaseRingTheDoorbell')}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="update-instructions-profile"
                  checked={updateInstructionsInProfile}
                  onChange={(e) => setUpdateInstructionsInProfile(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="update-instructions-profile" className="text-sm text-gray-600">
                  {t('updateInstructionsInProfile')}
                </label>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">{t('nextSteps')}</h3>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('requestSubmitted')}</p>
                <p className="text-xs text-gray-600">{t('requestAddedToSystem')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('matchingInProgress')}</p>
                <p className="text-xs text-gray-600">{t('lookingForMatches')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('getNotified')}</p>
                <p className="text-xs text-gray-600">{t('receiveNotificationWhenMatch')}</p>
              </div>
            </div>
          </div>
    </PageContainer>
  );
}