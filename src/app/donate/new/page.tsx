'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
    pickup_time: '',
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
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

    const now = new Date();
    const pickupDate = new Date(formData.pickup_time);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (!formData.pickup_time || pickupDate <= now) {
      setError('Pickup time must be set and in the future.');
      setLoading(false);
      return;
    }
    if (pickupDate > twoWeeksFromNow) {
      setError('Pickup time must be within the next 14 days.');
      setLoading(false);
      return;
    }
    if (!formData.expiry_date) {
        setError('Expiry date must be set.');
        setLoading(false);
        return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      let image_url = null;

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
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
            expiry_date: new Date(formData.expiry_date).toISOString(),
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
            pickup_time: new Date(formData.pickup_time).toISOString(),
          }
        ]);

      if (insertError) {
        console.error("Error inserting into donations:", insertError);
        throw insertError;
      }

      // Redirect to donations list
      router.push('/donate');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-base p-6 md:p-8 shadow">
        <h1 className="mb-6 text-titleMd font-display text-primary">Create New Donation</h1>

        {error && (
          <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-label font-medium text-primary mb-1">
              Food Item Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Whole Wheat Bread, Mixed Vegetables"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-label font-medium text-primary mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Provide details about the item, condition, allergens, etc."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-label font-medium text-primary mb-1">
              Quantity (Units/Approx. Weight)
            </label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              required
              min="1"
              placeholder="e.g., 10 loaves, 5 kg"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="expiry_date" className="block text-label font-medium text-primary mb-1">
              Expiry Date
            </label>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="datetime-local"
              required
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="pickup_time" className="block text-label font-medium text-primary mb-1">
              Pickup Time (must be within 14 days)
            </label>
            <Input
              id="pickup_time"
              name="pickup_time"
              type="datetime-local"
              required
              value={formData.pickup_time}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-label font-medium text-primary mb-1">
              Image (Optional)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-primary-75 file:mr-4 file:rounded-md file:border-0 file:bg-primary-10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-25 file:cursor-pointer"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
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