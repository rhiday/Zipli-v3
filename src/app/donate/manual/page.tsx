// pumpkin: test commit to trigger push
'use client'
export const dynamic = "force-dynamic";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { useDonationStore } from '@/store/donation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDatabase, useDatabaseActions, DonationWithFoodItem } from '@/store/databaseStore';

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
  const { donationItems, addDonationItem, updateDonationItem, deleteDonationItem } = useDonationStore();
  const { getDonationById, updateDonation, updateFoodItem } = useDatabaseActions();

  const [currentItem, setCurrentItem] = useState<Omit<DonationItem, 'id'> & { id: string | 'new' }>({
    id: 'new',
    name: '',
    quantity: '',
    allergens: [],
    description: null,
    imageUrl: undefined,
  });
  const [showItemList, setShowItemList] = useState(false);
  const [showAddAnotherForm, setShowAddAnotherForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (donationItems.length > 0 && !isEditMode) {
      setShowItemList(true);
    } else {
      setShowItemList(false);
    }
  }, [donationItems, isEditMode]);

  useEffect(() => {
    const editItemId = searchParams.get('id');
    if (editItemId) {
      setIsEditMode(true);
      const donation = getDonationById(editItemId);
      
      if (donation) {
        const { food_item, quantity, id } = donation;
        setCurrentItem({
          id,
          name: food_item.name,
          quantity: quantity.toString(),
          allergens: food_item.allergens ? food_item.allergens.split(',') : [],
          description: food_item.description || null,
          imageUrl: food_item.image_url,
        });
        setShowItemList(true); 
        setShowAddAnotherForm(true);
      }
    }
  }, [searchParams, getDonationById]);

  const handleCurrentItemChange = (field: keyof Omit<DonationItem, 'id'>, value: any) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (imageUrl: string) => {
    handleCurrentItemChange('imageUrl', imageUrl || undefined);
  };

  const handleSaveItem = async () => {
    if (!currentItem.name.trim() || !currentItem.quantity.trim()) return;
    setIsSaving(true);

    try {
      if (isEditMode && currentItem.id !== 'new') {
        const donation = getDonationById(currentItem.id);
        if (!donation) throw new Error('Donation not found');

        updateFoodItem({
          id: donation.food_item_id,
          name: currentItem.name,
          allergens: currentItem.allergens.join(','),
          description: currentItem.description || undefined,
          image_url: currentItem.imageUrl,
        });

        updateDonation({
          id: currentItem.id,
          quantity: currentItem.quantity,
        });

        setShowSuccessDialog(true);
      } else {
        // This is for adding a new item, not editing.
        if (currentItem.id === 'new') {
          // This part uses the old zustand store, which you might want to refactor later
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
        setShowAddAnotherForm(false);
        setCurrentItem({
          id: 'new',
          name: '',
          quantity: '',
          allergens: [],
          description: null,
          imageUrl: undefined,
        });
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
    setShowAddAnotherForm(true);
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = donationItems.find(item => item.id === id);
    if (itemToEdit) {
      setCurrentItem({
        ...itemToEdit,
        description: itemToEdit.description ?? '',
        quantity: itemToEdit.quantity.replace(' kg', ''),
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
    if (showAddAnotherForm) {
      setShowAddAnotherForm(false);
    } else if (showItemList) {
      setShowItemList(false);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <SecondaryNavbar 
        title="Add food item" 
        backHref="/donate"
        onBackClick={showItemList || showAddAnotherForm ? handleBackClick : undefined}
      />
      <div className="px-6 pt-2">
        <Progress value={isEditMode ? 100 : 25} className="h-2 w-full" />
      </div>
      
      {showItemList ? (
        // Item List View (with optional add another form)
        <main className="flex-1 flex flex-col gap-6 p-6">
          <h2 className="text-lg font-semibold text-[#021d13]">
            {isEditMode ? 'Edit food item' : 'Your donation:'}
          </h2>
          <div className="flex flex-col gap-4">
            {isEditMode ? null : donationItems.map((item) => (
              <ItemPreview
                key={item.id}
                name={item.name}
                quantity={item.quantity}
                description={item.description ?? undefined}
                imageUrl={item.imageUrl}
                onEdit={() => handleEditItem(item.id)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
          
          {showAddAnotherForm ? (
            // Add Another Item Form
            <div className="flex flex-col gap-6 mt-6">
              <h3 className="text-lg font-semibold text-[#021d13]">
                {currentItem.id === 'new' ? 'Add another food item' : 'Edit food item'}
              </h3>
              <div>
                <label htmlFor="food-name-2" className="block text-label font-semibold mb-2">Name of food</label>
                <Input 
                  id="food-name-2" 
                  placeholder="e.g. Bread, Rice, etc." 
                  value={currentItem.name}
                  onChange={(e) => handleCurrentItemChange('name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-label font-semibold mb-2">Description</label>
                <Input 
                  id="description" 
                  placeholder="e.g. A delicious and healthy meal."
                  value={currentItem.description ?? ''}
                  onChange={(e) => handleCurrentItemChange('description', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="quantity-2" className="block text-label font-semibold mb-2">Quantity</label>
                <Input 
                  id="quantity-2" 
                  type="number" 
                  min={1} 
                  placeholder="e.g. 5 (kg)" 
                  value={currentItem.quantity}
                  onChange={(e) => handleCurrentItemChange('quantity', e.target.value)}
                />
              </div>
              <div className="mb-8">
                <AllergensDropdown
                  label="Allergies, intolerances & diets"
                  options={["Lactose-free", "Vegan", "Halal", "Low-lactose"]}
                  value={currentItem.allergens}
                  onChange={(value) => handleCurrentItemChange('allergens', value)}
                  hint="Select all that apply."
                />
              </div>
              <div>
                <PhotoUpload 
                  onImageUpload={handleImageUpload} 
                  uploadedImage={currentItem.imageUrl || null}
                />
              </div>
            </div>
          ) : (
            !isEditMode && (
              <button 
                onClick={handleAddAnotherItem}
                className="flex items-center justify-center gap-2 text-interactive font-semibold text-base py-1 border-b border-interactive self-center"
              >
                <span className="text-xl">+</span>
                Add another item
              </button>
            )
          )}
        </main>
      ) : (
        // Form View
        <main className="flex-1 flex flex-col gap-6 p-6">
          <div>
            <label htmlFor="food-name" className="block text-label font-semibold mb-2">Name of food</label>
            <Input 
              id="food-name" 
              placeholder="e.g. Bread, Rice, etc." 
              value={currentItem.name}
              onChange={(e) => handleCurrentItemChange('name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-label font-semibold mb-2">Description</label>
            <Input 
              id="description" 
              placeholder="e.g. A delicious and healthy meal."
              value={currentItem.description ?? ''}
              onChange={(e) => handleCurrentItemChange('description', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-label font-semibold mb-2">Quantity</label>
            <Input 
              id="quantity" 
              type="number" 
              min={1} 
              placeholder="e.g. 5 (kg)" 
              value={currentItem.quantity}
              onChange={(e) => handleCurrentItemChange('quantity', e.target.value)}
            />
          </div>
          <div className="mb-8">
            <AllergensDropdown
              label="Allergies, intolerances & diets"
              options={["Lactose-free", "Vegan", "Halal", "Low-lactose"]}
              value={currentItem.allergens}
              onChange={(value) => handleCurrentItemChange('allergens', value)}
              hint="Select all that apply."
            />
          </div>
          <div>
            <PhotoUpload 
              onImageUpload={handleImageUpload} 
              uploadedImage={currentItem.imageUrl || null}
            />
          </div>
        </main>
      )}
      
      <div className="flex-grow" />

      <div className="p-6">
        <Button
          onClick={handleSaveItem}
          disabled={isSaving || !currentItem.name.trim() || !currentItem.quantity.trim()}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isSaving ? 'Saving...' : isEditMode ? 'Save changes' : 'Add to donation'}
        </Button>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes saved</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => router.push('/donor/dashboard')}
              className="w-full"
            >
              Go back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManualDonationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManualDonationPageInner />
    </Suspense>
  );
}

export default ManualDonationPage; 