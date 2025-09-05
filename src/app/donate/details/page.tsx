'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EnhancedMultiplePhotoUpload } from '@/components/ui/EnhancedMultiplePhotoUpload';
import { Textarea } from '@/components/ui/Textarea';
import { useDonationStore } from '@/store/donation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { PlusIcon } from 'lucide-react';

export default function DonationDetailsPage() {
  const router = useRouter();
  const { updateFoodItem } = useDatabase();
  const { donationItems, updateDonationItem } = useDonationStore();
  const { t } = useCommonTranslation();

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentItem = donationItems[currentItemIndex];
  const totalItems = donationItems.length;

  if (!currentItem) {
    router.push('/donate/manual');
    return null;
  }

  const handleImagesUpload = (imageUrls: string[]) => {
    const updatedItem = {
      ...currentItem,
      imageUrls,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined, // Sync first image for backward compatibility
    };
    updateDonationItem(updatedItem);
  };

  const handleDescriptionChange = (description: string) => {
    updateDonationItem({ ...currentItem, description });
  };

  const handleNext = async () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      // All items completed, proceed to pickup slots
      router.push('/donate/pickup-slot');
    }
  };

  const handleBackClick = () => {
    if (currentItemIndex > 0) {
      // If not on first item, go to previous item
      setCurrentItemIndex(currentItemIndex - 1);
    } else {
      // If on first item, go back to manual page
      router.push('/donate/manual');
    }
  };

  return (
    <PageContainer
      header={
        <SecondaryNavbar
          title={t('addPhotoDescription')}
          onBackClick={handleBackClick}
        />
      }
      footer={
        <BottomActionBar>
          <Button onClick={handleNext} disabled={isSaving} className="w-full">
            {isSaving
              ? t('savingEllipsis')
              : currentItemIndex < totalItems - 1
                ? t('next')
                : t('continue')}
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <div className="space-y-4">
        <Progress value={((currentItemIndex + 1) / totalItems) * 100} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('itemProgress')
              .replace('{current}', `${currentItemIndex + 1}`)
              .replace('{total}', `${totalItems}`)}
          </p>
        </div>

        {/* Photo Upload */}
        <EnhancedMultiplePhotoUpload
          onImagesUpload={(imageUrls, compressionInfo) => {
            handleImagesUpload(imageUrls);
            if (compressionInfo) {
              console.log(
                'Compression saved:',
                compressionInfo.reduce(
                  (acc, info) =>
                    acc + (info.originalSize - info.compressedSize),
                  0
                ),
                'bytes'
              );
            }
          }}
          uploadedImages={currentItem.imageUrls || []}
          hint={t('photosHelpIdentify')}
          maxImages={5}
          onError={(error) => {
            console.error('Photo upload error:', error);
          }}
        />

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-label font-semibold mb-2"
          >
            {t('description')} ({t('optional')})
          </label>
          <Textarea
            id="description"
            value={currentItem.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={t('enterDescription')}
            rows={4}
          />
        </div>
      </div>
    </PageContainer>
  );
}
