'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function CreateDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 1,
    expiry_date: '',
    pickup_time_start: '',
    pickup_time_end: '',
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      let image_url = null;

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('donations')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('donations')
            .getPublicUrl(data.path);
          image_url = publicUrl;
        }
      }

      // Create food item first
      const { data: foodItem, error: foodItemError } = await supabase
        .from('food_items')
        .insert([
          {
            donor_id: user.id,
            name: formData.name,
            description: formData.description,
            image_url,
            expiry_date: formData.expiry_date,
          }
        ])
        .select()
        .single();

      if (foodItemError) throw foodItemError;
      if (!foodItem) throw new Error('Failed to create food item');

      // Create donation
      const { error: insertError } = await supabase
        .from('donations')
        .insert([
          {
            food_item_id: foodItem.id,
            donor_id: user.id,
            quantity: formData.quantity,
            status: 'available',
            pickup_time_start: formData.pickup_time_start,
            pickup_time_end: formData.pickup_time_end,
          }
        ]);

      if (insertError) throw insertError;

      // Redirect to donations list
      router.push('/donate');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Create New Donation</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Food Item Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="text"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              id="expiry_date"
              name="expiry_date"
              type="datetime-local"
              required
              value={formData.expiry_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="pickup_time_start" className="block text-sm font-medium text-gray-700">
              Pickup Time Start
            </label>
            <input
              id="pickup_time_start"
              name="pickup_time_start"
              type="datetime-local"
              required
              value={formData.pickup_time_start}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="pickup_time_end" className="block text-sm font-medium text-gray-700">
              Pickup Time End
            </label>
            <input
              id="pickup_time_end"
              name="pickup_time_end"
              type="datetime-local"
              required
              value={formData.pickup_time_end}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image (Optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 