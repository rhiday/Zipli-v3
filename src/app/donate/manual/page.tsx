'use client'
import React, { useState } from 'react';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';

export default function ManualDonationPage() {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <SecondaryNavbar title="Add food item" backHref="/donate" />
      <div className="px-6 pt-2">
        <Progress value={25} className="h-2 w-full" />
      </div>
      <main className="flex-1 flex flex-col gap-6 p-6">
        <div>
          <label htmlFor="food-name" className="block text-label font-semibold mb-2">Name of food</label>
          <Input id="food-name" placeholder="e.g. Bread, Rice, etc." />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-label font-semibold mb-2">Quantity</label>
          <Input id="quantity" type="number" min={1} placeholder="e.g. 5 (kg)" />
        </div>
        <div>
          <AllergensDropdown
            label="Allergies, intolerances & diets"
            options={["Lactose-free", "Vegan", "Halal", "Low-lactose"]}
            value={selectedAllergens}
            onChange={setSelectedAllergens}
          />
        </div>
      </main>
    </div>
  );
} 