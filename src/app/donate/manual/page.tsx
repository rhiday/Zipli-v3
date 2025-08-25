// pumpkin: test commit to trigger push
'use client';
export const dynamic = 'force-dynamic';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { Progress } from '@/components/ui/progress';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { useDatabase } from '@/store';
import { useDonationStore } from '@/store/donation';
import { PlusIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { Textarea } from '@/components/ui/Textarea';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { useAutoSave } from '@/lib/auto-save';
import AutoSaveFormWrapper from '@/components/forms/AutoSaveFormWrapper';
import { toast } from '@/hooks/use-toast';

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  allergens: string[];
  description: string | null;
  imageUrl?: string;
}

function ManualDonationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    donationItems,
    addDonationItem,
    updateDonationItem,
    deleteDonationItem,
    isEditMode: storeEditMode,
    editingDonationId,
    setEditMode,
  } = useDonationStore();
  const updateDonation = useDatabase((state) => state.updateDonation);
  const updateFoodItem = useDatabase((state) => state.updateFoodItem);
  const donations = useDatabase((state) => state.donations);
  const foodItems = useDatabase((state) => state.foodItems);
  const currentUser = useDatabase((state) => state.currentUser);
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
  const [showAddAnotherForm, setShowAddAnotherForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const hasItems = donationItems.length > 0;

  useEffect(() => {
    // Handle edit mode from store
    if (storeEditMode && editingDonationId && currentUser) {
      setIsEditMode(true);
      const foundDonation = donations
        .filter(
          (d) => d.id === editingDonationId && d.donor_id === currentUser.id
        )
        .map((d) => {
          const foodItem = foodItems.find((fi) => fi.id === d.food_item_id);
          return { ...d, food_item: foodItem! };
        })[0];

      if (foundDonation) {
        const { food_item, quantity, id } = foundDonation;
        const currentAllergens = food_item.allergens || [];
        setCurrentItem({
          id,
          name: food_item.name,
          quantity: String(quantity).replace(' kg', ''),
          allergens: Array.isArray(currentAllergens)
            ? currentAllergens
            : String(currentAllergens).split(','),
          description: food_item.description,
          imageUrl: food_item.image_url || undefined,
        });
        setShowAddAnotherForm(true);
      }
    }

    // Legacy support for URL-based editing
    const editItemId = searchParams.get('id');
    if (editItemId && currentUser && !storeEditMode) {
      setIsEditMode(true);
      const foundDonation = donations
        .filter((d) => d.id === editItemId && d.donor_id === currentUser.id)
        .map((d) => {
          const foodItem = foodItems.find((fi) => fi.id === d.food_item_id);
          return { ...d, food_item: foodItem! };
        })[0];

      if (foundDonation) {
        const { food_item, quantity, id } = foundDonation;
        const currentAllergens = food_item.allergens || [];
        setCurrentItem({
          id,
          name: food_item.name,
          quantity: String(quantity).replace(' kg', ''),
          allergens: Array.isArray(currentAllergens)
            ? currentAllergens
            : String(currentAllergens).split(','),
          description: food_item.description,
          imageUrl: food_item.image_url || undefined,
        });
        setShowAddAnotherForm(true);
      }
    }
  }, [
    searchParams,
    currentUser,
    donations,
    foodItems,
    storeEditMode,
    editingDonationId,
  ]);

  // Smart allergen suggestions based on food name
  const suggestAllergensForFood = (foodName: string): string[] => {
    const name = foodName.toLowerCase().trim();
    if (!name) return [];

    // Check if it matches an existing food item
    const existingFood = foodItems.find(
      (item) =>
        item.name.toLowerCase() === name ||
        item.name.toLowerCase().includes(name) ||
        name.includes(item.name.toLowerCase())
    );

    if (
      existingFood &&
      existingFood.allergens &&
      existingFood.allergens.length > 0
    ) {
      const allergens = Array.isArray(existingFood.allergens)
        ? existingFood.allergens
        : String(existingFood.allergens)
            .split(',')
            .map((a) => a.trim());
      // Filter out None if other allergens are present
      return allergens.filter((a) => a.toLowerCase() !== 'none');
    }

    // Smart pattern matching for common food types
    const allergenSuggestions: { [key: string]: string[] } = {
      // Dairy products
      milk: ['Milk'],
      cheese: ['Milk'],
      butter: ['Milk'],
      cream: ['Milk'],
      yogurt: ['Milk'],
      quark: ['Milk'],

      // Gluten/Wheat
      bread: ['Wheat'],
      pasta: ['Wheat'],
      pizza: ['Wheat', 'Milk'],
      noodles: ['Wheat'],
      flour: ['Wheat'],
      sandwich: ['Wheat'],
      wrap: ['Wheat'],
      pie: ['Wheat', 'Eggs'],
      cake: ['Wheat', 'Eggs', 'Milk'],

      // Fish & seafood
      fish: ['Fish'],
      salmon: ['Fish'],
      tuna: ['Fish'],
      cod: ['Fish'],
      shrimp: ['Shellfish'],
      crab: ['Shellfish'],
      lobster: ['Shellfish'],
      soup: ['Fish'], // Many soups contain fish stock

      // Nuts
      nuts: ['Tree nuts'],
      almond: ['Tree nuts'],
      walnut: ['Tree nuts'],
      peanut: ['Peanuts'],
      hazelnut: ['Tree nuts'],

      // Eggs
      egg: ['Eggs'],
      mayonnaise: ['Eggs'],
      meatball: ['Eggs', 'Wheat'],

      // Soy
      tofu: ['Soybeans'],
      soy: ['Soybeans'],
      miso: ['Soybeans'],
      tempeh: ['Soybeans'],

      // Vegan options
      vegan: ['None'],
      plant: ['None'],
      vegetable: ['None'],
      fruit: ['None'],
      salad: name.includes('nut') ? ['Tree nuts'] : [],
    };

    // Check for pattern matches
    for (const [pattern, allergens] of Object.entries(allergenSuggestions)) {
      if (name.includes(pattern)) {
        return allergens;
      }
    }

    return []; // Default to empty for unrecognized items
  };

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

      // Auto-suggest allergens only if user hasn't set any allergens yet
      if (field === 'name' && value.trim() && prev.allergens.length === 0) {
        const suggestedAllergens = suggestAllergensForFood(value);
        if (suggestedAllergens.length > 0) {
          updated.allergens = suggestedAllergens;
        } else {
          updated.allergens = ['None']; // Default to None if no suggestions
        }
      } else if (field === 'name' && !value.trim()) {
        updated.allergens = []; // Clear allergens if name is cleared
      }

      return updated;
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    handleCurrentItemChange('imageUrl', imageUrl || undefined);
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
      if (isEditMode && currentItem.id !== 'new') {
        const donation = donations.find((d) => d.id === currentItem.id);
        if (!donation) throw new Error('Donation not found');

        await updateFoodItem(donation.food_item_id, {
          name: currentItem.name,
          allergens: JSON.stringify(currentItem.allergens),
          description: currentItem.description || undefined,
          image_url: currentItem.imageUrl,
        });

        await updateDonation(currentItem.id, {
          quantity: Number(currentItem.quantity) || 0,
        });

        // Clear auto-saved data on successful save
        clear();
        clearItemsList();

        // In edit mode, continue to pickup slots instead of showing success dialog
        if (storeEditMode) {
          router.push('/donate/pickup-slot');
        } else {
          setShowSuccessDialog(true);
        }
      } else {
        // This is for adding a new item, not editing.
        if (currentItem.id === 'new') {
          // This part uses the old zustand store, which you might want to refactor later
          addDonationItem({
            ...currentItem,
            quantity: Number(currentItem.quantity),
            unit: 'kg',
          });
        } else {
          updateDonationItem({
            ...currentItem,
            id: currentItem.id,
            quantity: Number(currentItem.quantity),
            unit: 'kg',
          });
        }
        setShowAddAnotherForm(false);
        setCurrentItem({
          id: 'new',
          name: '',
          quantity: '',
          allergens: [],
          description: null,
          imageUrl: undefined,
        });
        setHasAttemptedSave(false);
        clear(); // Clear auto-saved data after adding item
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      // We can add a user-facing error message here later.
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAnotherItem = () => {
    // Reset current item when adding a new one
    setCurrentItem({
      id: 'new',
      name: '',
      quantity: '',
      allergens: [],
      description: null,
      imageUrl: undefined,
    });
    setHasAttemptedSave(false);
    setShowAddAnotherForm(true);
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = donationItems.find((item) => item.id === id);
    if (itemToEdit) {
      setCurrentItem({
        ...itemToEdit,
        description: itemToEdit.description ?? '',
        quantity: itemToEdit.quantity.toString(),
      });
      setShowAddAnotherForm(true);
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
      setShowAddAnotherForm(false);
    }
  };

  const handleBackClick = () => {
    if (isEditMode) {
      router.push('/donor/dashboard');
    } else {
      router.back();
    }
  };

  const isFormVisible = !hasItems || showAddAnotherForm;

  // Check if all mandatory fields are filled
  const isFormValid =
    currentItem.name.trim() !== '' &&
    currentItem.quantity.trim() !== '' &&
    currentItem.allergens.length > 0;

  // Auto-save current item data
  const { hasUnsaved, restore, clear } = useAutoSave({
    key: `donation-item-${currentItem.id}`,
    data: currentItem,
    enabled: showAddAnotherForm,
    intervalMs: 2000, // Save every 2 seconds when form is visible
  });

  // Auto-save donation items list
  const { clear: clearItemsList } = useAutoSave({
    key: 'donation-items-list',
    data: donationItems,
    enabled: true,
    intervalMs: 5000, // Save items list every 5 seconds
  });

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

      <PhotoUpload
        onImageUpload={handleImageUpload}
        uploadedImage={currentItem.imageUrl}
        hint={t('photosHelpIdentify')}
      />

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <Textarea
          id="description"
          value={currentItem.description || ''}
          onChange={(e) =>
            handleCurrentItemChange('description', e.target.value)
          }
          placeholder={t('enterDescription')}
        />
      </div>
    </div>
  );

  return (
    <>
      <PageContainer
        header={
          <SecondaryNavbar
            title={isEditMode ? t('editFoodItem') : t('addFoodItem')}
            onBackClick={handleBackClick}
            backHref="#" // Dummy href, onBackClick will override
          />
        }
        footer={
          <BottomActionBar>
            {hasItems && !showAddAnotherForm ? (
              <div className="flex justify-end">
                <Button onClick={() => router.push('/donate/pickup-slot')}>
                  {t('continue')}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveItem}
                  disabled={isSaving || !isFormValid}
                >
                  {isSaving
                    ? t('savingEllipsis')
                    : isEditMode
                      ? t('saveChanges')
                      : t('addItem')}
                </Button>
              </div>
            )}
          </BottomActionBar>
        }
        className="bg-white"
        contentClassName="p-4 space-y-6"
      >
        {hasItems && !showAddAnotherForm ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">
              {t('currentItemsInDonation')}
            </h2>
            {donationItems.map((item) => (
              <ItemPreview
                key={item.id}
                name={item.name}
                quantity={`${item.quantity} ${item.unit || 'kg'}`}
                description={item.description || undefined}
                imageUrl={item.imageUrl}
                allergens={item.allergens}
                onEdit={() => handleEditItem(item.id)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleAddAnotherItem}
                className="flex items-center justify-center gap-2 text-interactive font-semibold text-base self-center"
              >
                <span className="flex items-center gap-2 border-b border-interactive pb-1">
                  <PlusIcon size={20} />
                  {t('addAnotherItem')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <AutoSaveFormWrapper
            formId={`donation-form-${currentItem.id}`}
            formData={currentItem}
            enabled={showAddAnotherForm}
            intervalMs={2000}
            onRestore={(data) => {
              setCurrentItem((prev) => ({ ...prev, ...data }));
              toast({
                title: 'Form data restored',
                description: 'Your previous work has been recovered',
                variant: 'success',
              });
            }}
            onClear={() => {
              setCurrentItem({
                id: 'new',
                name: '',
                quantity: '',
                allergens: [],
                description: null,
                imageUrl: undefined,
              });
            }}
            showStatus={true}
          >
            <div>
              <Progress
                value={(donationItems.length + 1) * 50}
                className="mb-4"
              />
              {formContent}
            </div>
          </AutoSaveFormWrapper>
        )}
      </PageContainer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('changesSaved')}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/donate')} className="w-full">
              {t('goBackToDashboard')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ManualDonationPage() {
  const { t } = useCommonTranslation();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualDonationPageInner />
    </Suspense>
  );
}

export default ManualDonationPage;
