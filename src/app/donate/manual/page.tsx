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
    
    if (existingFood && existingFood.allergens) {
      return Array.isArray(existingFood.allergens) 
        ? existingFood.allergens 
        : String(existingFood.allergens).split(',').map(a => a.trim());
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
      'salad': name.includes('nut') ? ['Tree nuts'] : ['None'],
    };

    // Check for pattern matches
    for (const [pattern, allergens] of Object.entries(allergenSuggestions)) {
      if (name.includes(pattern)) {
        return allergens;
      }
    }

    return ['None']; // Default to None for unrecognized items
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
      
      // Auto-suggest allergens when food name changes
      if (field === 'name' && value.trim() && prev.allergens.length === 0) {
        const suggestedAllergens = suggestAllergensForFood(value);
        if (suggestedAllergens.length > 0) {
          updated.allergens = suggestedAllergens;
        }
      }
      
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
    if (showAddAnotherForm) {
      setShowAddAnotherForm(false);
    } else {
      window.history.back();
    }
  };

  const isFormVisible = !hasItems || showAddAnotherForm;

  return (
    <div className="min-h-screen pb-20">
      <SecondaryNavbar 
        title="Add food item" 
        backHref="/donate"
        onBackClick={hasItems || showAddAnotherForm ? handleBackClick : undefined}
      />
      <div className="px-6 pt-2">
        <Progress value={isEditMode ? 100 : 25} className="h-2 w-full" />
      </div>
      
      {hasItems && !showAddAnotherForm ? (
        <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
          <h2 className="text-lg font-semibold text-[#021d13]">
            Your donation:
          </h2>
          <div className="flex flex-col gap-4">
            {donationItems.map((item) => (
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

          <button
            onClick={handleAddAnotherItem}
            className="flex items-center justify-center gap-2 py-2 text-interactive font-semibold border-b border-interactive"
          >
            <PlusIcon className="w-4 h-4" />
            Add another item
          </button>
        </main>
      ) : (
        // Add/Edit Form View
        <main className="flex-1 flex flex-col gap-6 p-6">
          <h2 className="text-lg font-semibold text-[#021d13]">
            {isEditMode ? 'Edit food item' : 'Add food item'}
          </h2>
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
            <label htmlFor="quantity" className="block text-label font-semibold mb-2">Quantity (kg)</label>
            <Input
              id="quantity"
              placeholder="e.g. 10"
              value={currentItem.quantity}
              onChange={(e) => handleCurrentItemChange('quantity', e.target.value)}
            />
          </div>

          <AllergensDropdown
            label="Allergens"
            options={['None', 'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree nuts', 'Peanuts', 'Wheat', 'Soybeans']}
            value={currentItem.allergens}
            onChange={(v) => handleCurrentItemChange('allergens', v)}
            placeholder="Select allergens"
            error={hasAttemptedSave && currentItem.allergens.length === 0 ? "Please select allergens or choose 'None'" : undefined}
          />

          <PhotoUpload
            isMobile={true}
            onImageUpload={handleImageUpload}
            uploadedImage={currentItem.imageUrl}
            hint="Photos help receivers identify your food items"
          />
        </main>
      )}

      <div className="sticky bottom-0 left-0 w-full bg-white p-6 mt-auto flex gap-4">
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={() => router.push('/donate')}
        >
          Cancel
        </Button>
        {isFormVisible ? (
          <Button
            onClick={handleSaveItem}
            disabled={isSaving || !currentItem.name.trim() || !String(currentItem.quantity).trim() || currentItem.allergens.length === 0}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add to donation'}
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/donate/pickup-slot')}
            disabled={isSaving || donationItems.length === 0}
            className="flex-1"
          >
            Continue
          </Button>
        )}
      </div>

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