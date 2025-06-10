'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { ItemPreview } from '@/components/ui/ItemPreview';

interface DonationItem {
  id: string;
  name: string;
  quantity: string;
  allergens: string[];
  imageUrl?: string;
}

export default function ManualDonationPage() {
  const router = useRouter();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);
  const [showItemList, setShowItemList] = useState(false);
  const [showAddAnotherForm, setShowAddAnotherForm] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl || null);
  };

  const handleAddItem = () => {
    if (!foodName.trim() || !quantity.trim()) return;
    
    const newItem: DonationItem = {
      id: Date.now().toString(),
      name: foodName,
      quantity: `${quantity} kg`,
      allergens: selectedAllergens,
      imageUrl: uploadedImage || undefined,
    };
    
    setDonationItems(prev => [...prev, newItem]);
    setShowItemList(true);
    setShowAddAnotherForm(false);
    
    // Clear form
    setFoodName('');
    setQuantity('');
    setSelectedAllergens([]);
    setUploadedImage(null);
  };

  const handleAddAnotherItem = () => {
    setShowAddAnotherForm(true);
  };

  const handleEditItem = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', id);
  };

  const handleDeleteItem = (id: string) => {
    setDonationItems(prev => prev.filter(item => item.id !== id));
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
              <h3 className="text-lg font-semibold text-[#021d13]">Add another food item</h3>
              <div>
                <label htmlFor="food-name-2" className="block text-label font-semibold mb-2">Name of food</label>
                <Input 
                  id="food-name-2" 
                  placeholder="e.g. Bread, Rice, etc." 
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="quantity-2" className="block text-label font-semibold mb-2">Quantity</label>
                <Input 
                  id="quantity-2" 
                  type="number" 
                  min={1} 
                  placeholder="e.g. 5 (kg)" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="mb-8">
                <AllergensDropdown
                  label="Allergies, intolerances & diets"
                  options={["Lactose-free", "Vegan", "Halal", "Low-lactose"]}
                  value={selectedAllergens}
                  onChange={setSelectedAllergens}
                  hint="Select all that apply."
                />
              </div>
              <div>
                <PhotoUpload 
                  onImageUpload={handleImageUpload} 
                  uploadedImage={uploadedImage}
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
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-label font-semibold mb-2">Quantity</label>
            <Input 
              id="quantity" 
              type="number" 
              min={1} 
              placeholder="e.g. 5 (kg)" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <AllergensDropdown
              label="Allergies, intolerances & diets"
              options={["Lactose-free", "Vegan", "Halal", "Low-lactose"]}
              value={selectedAllergens}
              onChange={setSelectedAllergens}
              hint="Select all that apply."
            />
          </div>
          <div>
            <PhotoUpload 
              onImageUpload={handleImageUpload} 
              uploadedImage={uploadedImage}
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
            onClick={handleAddItem}
            disabled={!foodName.trim() || !quantity.trim()}
            className="bg-[#a6f175] text-[#021d13] font-manrope font-semibold rounded-full px-8 py-3 text-lg shadow-md hover:bg-[#c2f7a1] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add item
          </button>
        )}
      </div>
    </div>
  );
} 