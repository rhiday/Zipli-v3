'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { Input } from '@/components/ui/Input';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { useDonationStore } from '@/store/donation';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { PlusIcon, Package } from 'lucide-react';

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  allergens: string[];
  description: string | null;
  imageUrl?: string;
  imageUrls?: string[];
}

export default function AddMoreProductsPage() {
  const router = useRouter();
  const {
    donationItems,
    addDonationItem,
    updateDonationItem,
    deleteDonationItem,
  } = useDonationStore();
  const { t } = useCommonTranslation();

  const [currentItem, setCurrentItem] = useState<
    Omit<DonationItem, 'id'> & { id: string | 'new' }
  >({
    id: 'new',
    name: '',
    quantity: '',
    allergens: [],
    description: null,
    imageUrl: undefined,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCurrentItemChange = (
    field: keyof Omit<DonationItem, 'id'>,
    value: any
  ) => {
    setCurrentItem((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset error state when user makes changes to required fields
      if (
        hasAttemptedSave &&
        ((field === 'allergens' && value.length > 0) ||
          (field === 'name' && value.trim()) ||
          (field === 'quantity' && value.trim()))
      ) {
        setHasAttemptedSave(false);
      }

      return updated;
    });
  };

  const handleSaveItem = async () => {
    setHasAttemptedSave(true);
    if (
      !currentItem.name.trim() ||
      !currentItem.quantity.trim() ||
      currentItem.allergens.length === 0
    )
      return;
    setIsSaving(true);

    try {
      if (currentItem.id === 'new') {
        addDonationItem({
          ...currentItem,
          quantity: `${currentItem.quantity} kg`,
        });
      } else {
        updateDonationItem({
          ...currentItem,
          id: currentItem.id,
          quantity: `${currentItem.quantity} kg`,
        });
      }
      setShowAddForm(false);
      setCurrentItem({
        id: 'new',
        name: '',
        quantity: '',
        allergens: [],
        description: null,
        imageUrl: undefined,
      });
      setHasAttemptedSave(false);
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProductClick = () => {
    setCurrentItem({
      id: 'new',
      name: '',
      quantity: '',
      allergens: [],
      description: null,
      imageUrl: undefined,
    });
    setHasAttemptedSave(false);
    setShowAddForm(true);
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = donationItems.find((item) => item.id === id);
    if (itemToEdit) {
      setCurrentItem({
        ...itemToEdit,
        description: itemToEdit.description ?? '',
        quantity: itemToEdit.quantity.replace(' kg', ''),
      });
      setShowAddForm(true);
    }
  };

  const handleDeleteItem = (id: string) => {
    deleteDonationItem(id);
    if (currentItem.id === id) {
      setCurrentItem({
        id: 'new',
        name: '',
        quantity: '',
        allergens: [],
        description: null,
        imageUrl: undefined,
      });
      setShowAddForm(false);
    }
  };

  const handleBackClick = () => {
    router.push('/donate/manual');
  };

  const handleContinue = () => {
    // If we have items, proceed to details to add photos
    // If no items, skip directly to pickup slots
    if (donationItems.length > 0) {
      router.push('/donate/details');
    } else {
      router.push('/donate/pickup-slot');
    }
  };

  const handleSkip = () => {
    // If we already have items from manual step, go to details for photos
    // Otherwise skip to pickup slots
    if (donationItems.length > 0) {
      router.push('/donate/details');
    } else {
      router.push('/donate/pickup-slot');
    }
  };

  // Check if all mandatory fields are filled
  const isFormValid =
    currentItem.name.trim() !== '' &&
    currentItem.quantity.trim() !== '' &&
    currentItem.allergens.length > 0;

  const formContent = (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          {t('nameOfFood')}
        </label>
        <Input
          id="name"
          value={currentItem.name}
          onChange={(e) => handleCurrentItemChange('name', e.target.value)}
          placeholder={t('enterFoodName')}
          className={
            hasAttemptedSave && !currentItem.name ? 'border-red-500' : ''
          }
        />
      </div>

      <div>
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          {t('quantityKg')}
        </label>
        <Input
          id="quantity"
          type="number"
          value={currentItem.quantity}
          onChange={(e) => handleCurrentItemChange('quantity', e.target.value)}
          placeholder={t('enterQuantity')}
          className={
            hasAttemptedSave && !currentItem.quantity ? 'border-red-500' : ''
          }
        />
      </div>

      <AllergensDropdown
        label={t('allergiesIntolerancesDiets')}
        options={[
          t('notSpecified'),
          t('glutenFree'),
          t('lactoseFree'),
          t('milkFree'),
          t('lowLactose'),
          t('eggFree'),
          t('soyFree'),
          t('noPeanuts'),
          t('noOtherNuts'),
          t('noFish'),
          t('noCrustaceans'),
          t('noCelery'),
          t('noMustard'),
          t('noSesamSeeds'),
          t('noSulphurDioxide'),
          t('noLupin'),
          t('noMolluscs'),
        ]}
        value={currentItem.allergens}
        onChange={(allergens) =>
          handleCurrentItemChange('allergens', allergens)
        }
        placeholder={t('selectAllergens')}
        error={
          hasAttemptedSave && currentItem.allergens.length === 0
            ? t('fieldRequired')
            : undefined
        }
      />
    </div>
  );

  return (
    <PageContainer
      header={
        <SecondaryNavbar
          title="Add More Products"
          onBackClick={handleBackClick}
          backHref="#"
        />
      }
      footer={
        <BottomActionBar>
          {!showAddForm ? (
            <div className="flex justify-between gap-3">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Continue
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveItem}
                disabled={isSaving || !isFormValid}
              >
                {isSaving ? t('savingEllipsis') : t('addItem')}
              </Button>
            </div>
          )}
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step 2 of 4: Add More Products</span>
          <span>{donationItems.length} items added</span>
        </div>
        <Progress value={50} className="h-2" />
      </div>

      {!showAddForm ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Want to add more products?
            </h2>
            <p className="text-gray-600 text-sm">
              You can add additional items to your donation or proceed to the
              next step
            </p>
          </div>

          {donationItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Items ({donationItems.length})
              </h3>
              {donationItems.map((item) => (
                <ItemPreview
                  key={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  description={item.description || undefined}
                  imageUrl={item.imageUrl}
                  allergens={item.allergens}
                  onEdit={() => handleEditItem(item.id)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleAddProductClick}
              className="flex items-center justify-center gap-2 text-interactive font-semibold text-base self-center"
            >
              <span className="flex items-center gap-2 border-b border-interactive pb-1">
                <PlusIcon size={20} />
                Add Another Product
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentItem.id !== 'new' ? 'Edit Product' : 'Add New Product'}
          </h3>
          {formContent}
        </div>
      )}
    </PageContainer>
  );
}
