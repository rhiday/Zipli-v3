'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Camera } from 'lucide-react';

type DonationFormInputs = {
  name: string;
  description: string;
  quantity: number;
  expiry_date: string;
  pickup_time: string;
  image?: FileList;
};

export default function CreateDonationPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    trigger
  } = useForm<DonationFormInputs>({
    defaultValues: {
      quantity: 1,
    }
  });

  const imageFile = watch('image');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && imageFile && imageFile.length > 0) {
      setSelectedFileName(imageFile[0].name);
    } else {
      setSelectedFileName(null);
    }
  }, [imageFile]);

  const onSubmit = async (data: DonationFormInputs) => {
    setServerError(null);

    const now = new Date();
    const pickupDate = new Date(data.pickup_time);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (!data.pickup_time) {
      setServerError('Pickup time must be set.');
      return;
    }
     if (!data.expiry_date) {
      setServerError('Expiry date must be set.');
      return;
    }

    if (pickupDate <= now) {
      setServerError('Pickup time must be in the future.');
      return;
    }
    
    if (pickupDate > twoWeeksFromNow) {
      setServerError('Pickup time must be within 14 days.');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      let image_url = null;
      const imageToUpload = data.image?.[0];

      if (imageToUpload) {
        if (imageToUpload.size > 5 * 1024 * 1024) {
          setServerError('Image file size must be less than 5MB.');
          trigger("image");
          return;
        }
        
        if (!imageToUpload.type.startsWith('image/')) {
          setServerError('Only image files are allowed.');
          trigger("image");
          return;
        }
        
        const fileExt = imageToUpload.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('donations')
          .upload(fileName, imageToUpload);

        if (uploadError) throw uploadError;
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('donations')
            .getPublicUrl(uploadData.path);
          image_url = publicUrl;
        }
      }

      const { data: foodItem, error: foodItemError } = await supabase
        .from('food_items')
        .insert([
          {
            donor_id: user.id,
            name: data.name,
            description: data.description,
            image_url,
            expiry_date: new Date(data.expiry_date).toISOString(),
          }
        ])
        .select()
        .single();

      if (foodItemError) throw foodItemError;
      if (!foodItem) throw new Error('Failed to create food item');

      const { error: insertError } = await supabase
        .from('donations')
        .insert([
          {
            food_item_id: foodItem.id,
            donor_id: user.id,
            quantity: data.quantity,
            status: 'available',
            pickup_time: new Date(data.pickup_time).toISOString(),
          }
        ]);

      if (insertError) {
        console.error("Error inserting into donations:", insertError);
        throw insertError;
      }

      reset();
      setSelectedFileName(null);
      router.push('/donate');
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while creating the donation');
    }
  };

  const fileInputLabelStyle = "inline-flex items-center justify-center gap-2 rounded-md border-2 border-tertiary bg-base px-4 py-[14px] text-bodyLg text-primary placeholder:text-inactive transition-colors duration-150 ease-in-out hover:border-primary focus:outline-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:ring-offset-0 cursor-pointer w-full";
  const fileInputLabelErrorStyle = "border-negative hover:border-negative focus:border-negative focus:ring-negative";

  return (
    <div className="min-h-screen bg-base p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-titleMd font-display text-primary">Create New Donation</h1>

        {serverError && (
          <div className="mb-6 rounded-md bg-negative/10 p-4 text-body text-negative flex items-center gap-2">
             <AlertTriangle className="h-5 w-5 text-negative" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-label font-semibold text-secondary mb-1.5">
              Food Item Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Whole Wheat Bread, Mixed Vegetables"
              {...register("name", { required: "Food item name is required" })}
              error={!!errors.name}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-label font-semibold text-secondary mb-1.5">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Provide details about the item, condition, allergens, etc."
              rows={4}
              {...register("description", { required: "Description is required" })}
              error={!!errors.description}
              disabled={isSubmitting}
            />
            {errors.description && (
               <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-label font-semibold text-secondary mb-1.5">
              Quantity (Units/Approx. Weight)
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="e.g., 10 loaves, 5 kg"
              {...register("quantity", { 
                required: "Quantity is required",
                valueAsNumber: true,
                min: { value: 1, message: "Quantity must be at least 1" }
              })}
              error={!!errors.quantity}
              disabled={isSubmitting}
            />
            {errors.quantity && (
               <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="expiry_date" className="block text-label font-semibold text-secondary mb-1.5">
              Expiry Date
            </label>
            <Input
              id="expiry_date"
              type="datetime-local"
              {...register("expiry_date", { required: "Expiry date is required" })}
              error={!!errors.expiry_date}
              disabled={isSubmitting}
            />
            {errors.expiry_date && (
               <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> {errors.expiry_date.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pickup_time" className="block text-label font-semibold text-secondary mb-1.5">
              Pickup Time (must be within 14 days)
            </label>
            <Input
              id="pickup_time"
              type="datetime-local"
              {...register("pickup_time", { required: "Pickup time is required" })}
              error={!!errors.pickup_time}
              disabled={isSubmitting}
            />
            {errors.pickup_time && (
               <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                 <AlertTriangle className="h-4 w-4" /> {errors.pickup_time.message}
              </p>
            )}
          </div>

          <div>
            <span className="block text-label font-semibold text-secondary mb-1.5">
              Image (Optional, Max 5MB)
            </span>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="sr-only"
              {...register("image", {
                validate: {
                  lessThan5MB: (files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024 || 'Max size is 5MB',
                  isImage: (files) => !files || files.length === 0 || files[0].type.startsWith("image/") || 'Only image files allowed',
                }
              })}
              disabled={isSubmitting}
            />
            <label 
              htmlFor="image" 
              className={`${fileInputLabelStyle} ${errors.image ? fileInputLabelErrorStyle : ''}`}
            >
              <Camera className="h-5 w-5 mr-2" />
              <span>{selectedFileName ? selectedFileName : "Upload Image"}</span>
            </label>
            
            {errors.image && (
              <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {errors.image.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 