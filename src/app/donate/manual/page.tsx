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

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  allergens: string[];
  imageUrl?: string;
}

function ManualDonationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { donationItems, addDonationItem, updateDonationItem, deleteDonationItem } = useDonationStore();
  
  const [currentItem, setCurrentItem] = useState<Omit<DonationItem, 'id'> & { id: string | 'new' }>({
    id: 'new',
    name: '',
    quantity: '',
    allergens: [],
    imageUrl: undefined,
  });
  const [showItemList, setShowItemList] = useState(false);
  const [showAddAnotherForm, setShowAddAnotherForm] = useState(false);

  useEffect(() => {
    if (donationItems.length > 0) {
      setShowItemList(true);
    } else {
      setShowItemList(false);
    }
  }, [donationItems]);

  useEffect(() => {
    const editItemId = searchParams.get('edit');
    if (editItemId) {
      handleEditItem(editItemId);
    }
  }, [searchParams]);

  const handleCurrentItemChange = (field: keyof Omit<DonationItem, 'id'>, value: any) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (imageUrl: string) => {
    handleCurrentItemChange('imageUrl', imageUrl || undefined);
  };

  const handleSaveItem = () => {
    if (!currentItem.name.trim() || !currentItem.quantity.trim()) return;

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
    
    setShowAddAnotherForm(false);
    
    // Clear form
    setCurrentItem({
      id: 'new',
      name: '',
      quantity: '',
      allergens: [],
      imageUrl: undefined,
    });
  };

  const handleAddAnotherItem = () => {
    // Reset current item when adding a new one
    setCurrentItem({
      id: 'new',
      name: '',
      quantity: '',
      allergens: [],
      imageUrl: undefined,
    });
    setShowAddAnotherForm(true);
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = donationItems.find(item => item.id === id);
    if (itemToEdit) {
      setCurrentItem({ ...itemToEdit, quantity: itemToEdit.quantity.replace(' kg', '') });
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
        <Progress value={25} className="h-2 w-full" />
      </div>
      
      {showItemList ? (
        // Item List View (with optional add another form)
        <main className="flex-1 flex flex-col gap-6 p-6">
          <h2 className="text-lg font-semibold text-[#021d13]">Your donation:</h2>
          <div className="flex flex-col gap-4">
            {donationItems.map((item) => (
              <ItemPreview
                key={item.id}
                name={item.name}
                quantity={item.quantity}
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
            <button 
              onClick={handleAddAnotherItem}
              className="flex items-center justify-center gap-2 text-interactive font-semibold text-base py-1 border-b border-interactive self-center"
            >
              <span className="text-xl">+</span>
              Add another item
            </button>
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
      
      <div className="sticky bottom-0 left-0 w-full bg-white pt-4 pb-10 pr-6 flex justify-end z-10">
        {showItemList && !showAddAnotherForm ? (
          <button 
            onClick={() => router.push('/donate/pickup-slot')}
            className="bg-[#a6f175] text-[#021d13] font-manrope font-semibold rounded-full px-8 py-3 text-lg shadow-md hover:bg-[#c2f7a1] transition"
          >
            Continue
          </button>
        ) : (
          <button 
            onClick={handleSaveItem}
            disabled={!currentItem.name.trim() || !currentItem.quantity.trim()}
            className="bg-[#a6f175] text-[#021d13] font-manrope font-semibold rounded-full px-8 py-3 text-lg shadow-md hover:bg-[#c2f7a1] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentItem.id === 'new' ? 'Add item' : 'Save changes'}
          </button>
        )}
      </div>
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