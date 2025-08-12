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
import { useDatabase, DonationWithFoodItem } from '@/store/databaseStore';
import { PlusIcon, Clock, MapPin } from 'lucide-react';

import DonationCard from '@/components/donations/DonationCard';
import { Textarea } from '@/components/ui/Textarea';


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
  const updateDonation = useDatabase(state => state.updateDonation);
  const updateFoodItem = useDatabase(state => state.updateFoodItem);
  const donations = useDatabase(state => state.donations);
  const foodItems = useDatabase(state => state.foodItems);
  const currentUser = useDatabase(state => state.currentUser);

  const [currentItem, setCurrentItem] = useState<Omit<DonationItem, 'id'> & { id: string | 'new' }>({
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
    const editItemId = searchParams.get('id');
    if (editItemId && currentUser) {
      setIsEditMode(true);
      const foundDonation = donations
        .filter(d => d.id === editItemId && d.donor_id === currentUser.id)
        .map(d => {
          const foodItem = foodItems.find(fi => fi.id === d.food_item_id);
          return { ...d, food_item: foodItem! };
        })[0];
      
      if (foundDonation) {
        const { food_item, quantity, id } = foundDonation;
        const currentAllergens = food_item.allergens || [];
        setCurrentItem({
          id,
          name: food_item.name,
          quantity: String(quantity).replace(' kg', ''),
          allergens: Array.isArray(currentAllergens) ? currentAllergens : String(currentAllergens).split(','),
          description: food_item.description || null,
          imageUrl: food_item.image_url,
        });
        setShowAddAnotherForm(true);
      }
    }
  }, [searchParams, currentUser, donations, foodItems]);

  // Smart allergen suggestions based on food name
  const suggestAllergensForFood = (foodName: string): string[] => {
    const name = foodName.toLowerCase().trim();
    if (!name) return [];

    // Check if it matches an existing food item
    const existingFood = foodItems.find(item => 
      item.name.toLowerCase() === name ||
      item.name.toLowerCase().includes(name) ||
      name.includes(item.name.toLowerCase())
    );
    
    if (existingFood && existingFood.allergens && existingFood.allergens.length > 0) {
      const allergens = Array.isArray(existingFood.allergens) 
        ? existingFood.allergens 
        : String(existingFood.allergens).split(',').map(a => a.trim());
      // Filter out 'None' if other allergens are present
      return allergens.filter(a => a.toLowerCase() !== 'none');
    }

    // Smart pattern matching for common food types
    const allergenSuggestions: { [key: string]: string[] } = {
      // Dairy products
      'milk': ['Milk'],
      'cheese': ['Milk'],
      'butter': ['Milk'],
      'cream': ['Milk'],
      'yogurt': ['Milk'],
      'quark': ['Milk'],
      
      // Gluten/Wheat
      'bread': ['Wheat'],
      'pasta': ['Wheat'],
      'pizza': ['Wheat', 'Milk'],
      'noodles': ['Wheat'],
      'flour': ['Wheat'],
      'sandwich': ['Wheat'],
      'wrap': ['Wheat'],
      'pie': ['Wheat', 'Eggs'],
      'cake': ['Wheat', 'Eggs', 'Milk'],
      
      // Fish & seafood
      'fish': ['Fish'],
      'salmon': ['Fish'],
      'tuna': ['Fish'],
      'cod': ['Fish'],
      'shrimp': ['Shellfish'],
      'crab': ['Shellfish'],
      'lobster': ['Shellfish'],
      'soup': ['Fish'], // Many soups contain fish stock
      
      // Nuts
      'nuts': ['Tree nuts'],
      'almond': ['Tree nuts'],
      'walnut': ['Tree nuts'],
      'peanut': ['Peanuts'],
      'hazelnut': ['Tree nuts'],
      
      // Eggs
      'egg': ['Eggs'],
      'mayonnaise': ['Eggs'],
      'meatball': ['Eggs', 'Wheat'],
      
      // Soy
      'tofu': ['Soybeans'],
      'soy': ['Soybeans'],
      'miso': ['Soybeans'],
      'tempeh': ['Soybeans'],
      
      // Vegan options
      'vegan': ['None'],
      'plant': ['None'],
      'vegetable': ['None'],
      'fruit': ['None'],
      'salad': name.includes('nut') ? ['Tree nuts'] : [],
    };

    // Check for pattern matches
    for (const [pattern, allergens] of Object.entries(allergenSuggestions)) {
      if (name.includes(pattern)) {
        return allergens;
      }
    }

    return []; // Default to empty for unrecognized items
  };

  const handleCurrentItemChange = (field: keyof Omit<DonationItem, 'id'>, value: any) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset error state when user makes changes to required fields
      if (hasAttemptedSave && ((field === 'allergens' && value.length > 0) || 
          (field === 'name' && value.trim()) || 
          (field === 'quantity' && value.trim()))) {
        setHasAttemptedSave(false);
      }
      
<<<<<<< HEAD
=======
      // Auto-suggest allergens only if user hasn't set any allergens yet
      if (field === 'name' && value.trim() && prev.allergens.length === 0) {
        const suggestedAllergens = suggestAllergensForFood(value);
        if (suggestedAllergens.length > 0) {
          updated.allergens = suggestedAllergens;
        } else {
          updated.allergens = ['None']; // Default to 'None' if no suggestions
        }
      } else if (field === 'name' && !value.trim()) {
        updated.allergens = []; // Clear allergens if name is cleared
      }
      
>>>>>>> 21f3ce4 (feat: improve allergen handling and image fallbacks)
      return updated;
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    handleCurrentItemChange('imageUrl', imageUrl || undefined);
  };

  const handleSaveItem = async () => {
    setHasAttemptedSave(true);
    if (!currentItem.name.trim() || !currentItem.quantity.trim() || currentItem.allergens.length === 0) return;
    setIsSaving(true);

    try {
      if (isEditMode && currentItem.id !== 'new') {
        const donation = donations.find(d => d.id === currentItem.id);
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
        setHasAttemptedSave(false);
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
    if (isEditMode) {
      router.push('/donor/dashboard');
    } else {
      router.back();
    }
  };

  const isFormVisible = !hasItems || showAddAnotherForm;

  const formContent = (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name of food</label>
        <Input
          id="name"
          value={currentItem.name}
          onChange={(e) => handleCurrentItemChange('name', e.target.value)}
          placeholder="e.g. Bread, Rice, etc."
          className={hasAttemptedSave && !currentItem.name ? "border-red-500" : ""}
        />
      </div>

      <div>
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity (kg)</label>
        <Input
          id="quantity"
          type="number"
          value={currentItem.quantity}
          onChange={(e) => handleCurrentItemChange('quantity', e.target.value)}
          placeholder="e.g. 10"
          className={hasAttemptedSave && !currentItem.quantity ? "border-red-500" : ""}
        />
      </div>
      
      <AllergensDropdown
        label="Allergens"
        options={['Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree nuts', 'Peanuts', 'Wheat', 'Soybeans']}
        value={currentItem.allergens}
        onChange={(allergens) => handleCurrentItemChange('allergens', allergens)}
        placeholder="Select allergens"
        error={undefined}
      />

      <PhotoUpload
        onImageUpload={handleImageUpload}
        uploadedImage={currentItem.imageUrl}
        hint="Photos help receivers identify your food items"
      />

      <div>
        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
        <Textarea
          id="description"
          value={currentItem.description || ''}
          onChange={(e) => handleCurrentItemChange('description', e.target.value)}
          placeholder="e.g. A delicious and healthy meal."
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-dvh bg-white">
      <SecondaryNavbar 
        title={isEditMode ? "Edit food item" : "Add food item"} 
        onBackClick={handleBackClick}
        backHref="#" // Dummy href, onBackClick will override
      />
      
      <main className="flex-grow overflow-y-auto p-4">
        {hasItems && !showAddAnotherForm ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Current Items in Donation</h2>
            {donationItems.map(item => (
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
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleAddAnotherItem}
                className="flex items-center justify-center gap-2 text-interactive font-semibold text-base self-center"
              >
                <span className="flex items-center gap-2 border-b border-interactive pb-1">
                  <PlusIcon size={20} />
                  Add another item
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Progress value={(donationItems.length + 1) * 50} className="mb-4" />
            {formContent}
          </div>
        )}
      </main>
      
      <footer className="px-4 pb-6 pt-4 bg-white">
        {hasItems && !showAddAnotherForm ? (
          <div className="flex justify-end">
            <Button onClick={() => router.push('/donate/pickup-slot')}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add item')}
            </Button>
          </div>
        )}
      </footer>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes saved</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => router.push('/donate')}
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