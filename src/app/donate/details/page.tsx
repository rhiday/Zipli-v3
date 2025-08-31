'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { Textarea } from '@/components/ui/Textarea';
import { ItemPreview } from '@/components/ui/ItemPreview';
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

  const handleImageUpload = (imageUrl: string) => {
    updateDonationItem(currentItem.id, { imageUrl: imageUrl || undefined });
  };

  const handleDescriptionChange = (description: string) => {
    updateDonationItem(currentItem.id, { description });
  };

  const handleNext = async () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      // All items completed, save to database and proceed to pickup slots
      setIsSaving(true);
      try {
        // Update all food items with photos and descriptions
        for (const item of donationItems) {
          if (item.food_item_id) {
            await updateFoodItem(item.food_item_id, {
              image_url: item.imageUrl,
              description: item.description,
            });
          }
        }
        router.push('/donate/pickup-slot');
      } catch (error) {
        console.error('Failed to update items:', error);
        setIsSaving(false);
      }
    }
  };

  const handleSkip = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      router.push('/donate/pickup-slot');
    }
  };

  return (
    <PageContainer
      header={
        <SecondaryNavbar
          title={t('addPhotoDescription')}
          onBackClick={() => router.back()}
        />
      }
      footer={
        <BottomActionBar>
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
              {t('skip')}
            </Button>
            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving
                ? t('savingEllipsis')
                : currentItemIndex < totalItems - 1
                  ? t('next')
                  : t('continue')}
            </Button>
          </div>
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <div className="space-y-4">
        <Progress value={((currentItemIndex + 1) / totalItems) * 100} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('itemXOfY', {
              current: currentItemIndex + 1,
              total: totalItems,
            })}
          </p>
        </div>

        {/* Current Item Preview */}
        <ItemPreview
          name={currentItem.name}
          quantity={currentItem.quantity}
          allergens={currentItem.allergens}
          imageUrl={currentItem.imageUrl}
          description={currentItem.description}
        />

        {/* Photo Upload */}
        <PhotoUpload
          onImageUpload={handleImageUpload}
          uploadedImage={currentItem.imageUrl}
          hint={t('photosHelpIdentify')}
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
