'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { AlertTriangle, Trash2, Pencil, Plus, Minus, CalendarIcon, Info, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logger } from '../../../../lib/logger';
import sharp from 'sharp';

type ItemInput = {
  name: string;
  description: string;
  quantity: number;
  allergens: string;
  food_type: string;
  displayState: 'editing' | 'summary';
  image?: FileList;
};

type TimeSlot = {
  start: string;
  end: string;
};

type DonationFormInputs = {
  items: ItemInput[];
  pickup_date?: Date;
  pickup_slots: TimeSlot[];
  instructions_for_driver?: string;
};

interface ProfileData {
  address?: string;
}

const FOOD_TYPE_OPTIONS = [
  'Prepared meals',
  'Fresh produce',
  'Cold packaged foods',
  'Bakery and Pastry',
  'Other',
];

export default function CreateDonationPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    trigger,
    setValue,
    getValues,
    control,
  } = useForm<DonationFormInputs>({
    defaultValues: {
      items: [{ name: '', description: '', quantity: 0.5, allergens: '', food_type: 'Other', displayState: 'editing', image: undefined }],
      pickup_date: undefined,
      pickup_slots: [{ start: '09:00', end: '10:00' }],
      instructions_for_driver: ''
    }
  });

  const items = watch('items');
  const pickupDateValue = watch('pickup_date');

  // Use useFieldArray for pickup slots
  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
    control,
    name: "pickup_slots"
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      logger.debug('Attempting to fetch user profile for donation form.');
      setLoadingProfile(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('address')
          .eq('id', user.id)
          .single();
        
        if (error) {
          logger.error('Error fetching profile in donation form:', error, { userId: user.id });
          setServerError('Could not load profile data.');
        } else {
          logger.debug('Profile data fetched successfully:', data);
          setProfile(data);
        }
      } else {
        logger.warn('User not authenticated when trying to fetch profile for donation form.');
        setServerError('Not authenticated.'); // Should not happen if page is protected
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, []); // Run only once on mount

  const handleAddItem = () => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.map(item => ({ ...item, displayState: 'summary' as const }));
    setValue('items', [
      ...updatedItems,
      { name: '', description: '', quantity: 1, allergens: '', food_type: 'Other', displayState: 'editing', image: undefined },
    ]);
  };

  // Function to handle switching an item to editing state
  const handleEditItem = (index: number) => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.map((item, idx) => ({
      ...item,
      displayState: idx === index ? 'editing' as const : 'summary' as const, // Set clicked to editing, others to summary
    }));
    setValue('items', updatedItems);
  };

  // Function to set a specific item to summary state
  const handleSetItemSummary = (index: number) => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.map((item, idx) => ({
      ...item,
      displayState: idx === index ? 'summary' as const : item.displayState, // Only change the specified item
    }));
    setValue('items', updatedItems);
  };

  // Function to delete an item
  const handleDeleteItem = (index: number) => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.filter((_, idx) => idx !== index);

    // If deleting the only item, reset to a single new editing item
    if (updatedItems.length === 0) {
      setValue('items', [{ name: '', description: '', quantity: 1, allergens: '', food_type: 'Other', displayState: 'editing', image: undefined }]);
    } else {
      // If the deleted item was the one being edited, make the last item editable
      const isEditingDeleted = currentItems[index]?.displayState === 'editing';
      if (isEditingDeleted && updatedItems.length > 0) {
        updatedItems[updatedItems.length - 1].displayState = 'editing';
      }
      setValue('items', updatedItems);
    }
  };

  // Function to toggle allergens in the string
  const handleAllergenToggle = (itemIndex: number, allergen: string) => {
    const currentAllergensString = getValues(`items.${itemIndex}.allergens`) || '';
    const currentAllergens = currentAllergensString.split(',').map(s => s.trim()).filter(Boolean);
    
    const isSelected = currentAllergens.includes(allergen);
    let updatedAllergens: string[];

    if (isSelected) {
      updatedAllergens = currentAllergens.filter(a => a !== allergen);
    } else {
      updatedAllergens = [...currentAllergens, allergen];
    }

    setValue(`items.${itemIndex}.allergens`, updatedAllergens.join(', '));
  };

  // Helper to format labels
  const formatAllergenLabel = (allergen: string): string => {
    return allergen
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-'); // Keep hyphenated for display like "Lactose-Free"
  };

  const onSubmit = async (data: DonationFormInputs) => {
    // Log a summary of the data, avoiding large FileList objects directly
    logger.debug('Donation form onSubmit triggered. Items count:', data.items.length, 'Pickup date selected:', !!data.pickup_date, 'Slots count:', data.pickup_slots.length);
    setServerError(null);
    let userIdForLog: string | undefined = 'N/A'; // Variable to hold user ID for logging in catch block

    // Check if date and at least one valid slot are provided
    if (!data.pickup_date || !data.pickup_slots || data.pickup_slots.length === 0 || !data.pickup_slots[0].start || !data.pickup_slots[0].end) {
      setServerError('Pickup date and at least one valid time slot (start and end) are required.');
      setStep(2);
      return;
    }

    // Combine date with the START time of the FIRST slot for validation and submission
    const [startHours, startMinutes] = data.pickup_slots[0].start.split(':').map(Number);
    const firstPickupDateTime = new Date(data.pickup_date);
    firstPickupDateTime.setHours(startHours, startMinutes, 0, 0);
    const finalPickupTimeISO = firstPickupDateTime.toISOString(); // For DB

    const now = new Date();
    const threeWeeksFromNow = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // Use 21 days

    // Validate using the combined date and time of the first slot
    if (firstPickupDateTime <= now) {
      setServerError('First pickup slot must start in the future.');
      setStep(2);
      return;
    }
    if (firstPickupDateTime > threeWeeksFromNow) {
      setServerError('Pickup date must be within 3 weeks.');
       setStep(2);
      return;
    }
    
    // Log all slots (for potential future use)
    console.log("Selected Slots:", data.pickup_slots);
    console.log("Instructions:", data.instructions_for_driver || "None");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');
      userIdForLog = user.id; // Assign user ID once authenticated
      
      logger.debug('Authenticated user for donation submission:', user.id);

      // Insert each item and its donation
      for (const [idx, item] of data.items.entries()) {
        let item_image_url: string | null = null;
        const imageToUpload = item.image?.[0];
        let foodItem: { id: string } | null = null;

        // STEP 1: Create food item first without the image to get foodItem.id
        const { data: foodItemData, error: foodItemError } = await supabase
          .from('food_items')
          .insert([
            {
              donor_id: user.id,
              name: item.name,
              description: item.description,
              image_url: null, // Will update after we have an image
              allergens: item.allergens,
              food_type: item.food_type || 'Other',
            }
          ])
          .select()
          .single();
  
        if (foodItemError) throw foodItemError;
        if (!foodItemData) throw new Error('Failed to create food item');
        foodItem = foodItemData as { id: string };

        // STEP 2: Handle user-uploaded image OR generate one with DALL-E
        if (imageToUpload) {
          if (imageToUpload.size > 5 * 1024 * 1024) {
            setServerError(`Image for item ${idx + 1} must be less than 5MB.`);
            return;
          }
          if (!imageToUpload.type.startsWith('image/')) {
            setServerError(`File for item ${idx + 1} must be an image.`);
            return;
          }
          
          // Compress and resize image to 512x512 JPEG
          const arrayBuffer = await imageToUpload.arrayBuffer();
          const compressedBuffer = await sharp(Buffer.from(arrayBuffer))
            .resize(512, 512)
            .jpeg({ quality: 80 })
            .toBuffer();

          const fileName = `${user.id}/item_${idx}_${Date.now()}.jpg`;
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('donations')
            .upload(fileName, compressedBuffer, { contentType: 'image/jpeg' });
            
          if (uploadError) throw uploadError;
          
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('donations')
              .getPublicUrl(uploadData.path);
            item_image_url = publicUrl;
          }
        } else {
          // No image uploaded, call API to generate DALL-E image
          try {
            console.log(`Generating DALL-E image for: ${item.name}`);
            const response = await fetch('/api/generate-food-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: item.name })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate image');
            }
            
            const data = await response.json();
            item_image_url = data.url;
            console.log(`Generated image URL: ${item_image_url}`);
          } catch (err: any) {
            console.error('Error generating image:', err);
            // Continue without image if generation fails
            // Or optionally set an error
            // setServerError(`Failed to generate image for ${item.name}: ${err.message}`);
            // return;
          }
        }

        // STEP 3: Update food item with image URL
        if (item_image_url) {
          const { error: updateError } = await supabase
            .from('food_items')
            .update({ image_url: item_image_url })
            .eq('id', foodItem.id);
            
          if (updateError) {
            console.error('Error updating food item with image:', updateError);
          }
        }

        // STEP 4: Create donation (existing code)
        const { error: insertError } = await supabase
          .from('donations')
          .insert([
            {
              food_item_id: foodItem.id,
              donor_id: user.id,
              quantity: item.quantity,
              status: 'available',
              pickup_time: finalPickupTimeISO,
              instructions_for_driver: data.instructions_for_driver,
              pickup_slots: data.pickup_slots
            }
          ]);
        if (insertError) {
          logger.error("Error inserting into donations table:", insertError, { food_item_id: foodItem.id, donor_id: user.id });
          throw insertError;
        }
      }

      logger.info('Donation submitted successfully by user:', user.id, { itemCount: data.items.length });
      reset();
      router.push('/donate/thank-you');
    } catch (err: any) {
      logger.error('Error during donation submission process:', {
        message: err.message,
        stack: err.stack, // Stack can be verbose, consider removing in production if too noisy
        userId: userIdForLog, // Use the user ID captured from the try block
        dataSummary: { itemCount: data.items.length, hasPickupDate: !!data.pickup_date, slotCount: data.pickup_slots.length }
      });
      setServerError(err.message || 'An error occurred while creating the donation');
    }
  };

  const fileInputLabelStyle = "inline-flex items-center justify-center gap-2 rounded-md border-2 border-tertiary bg-base px-4 py-[14px] text-bodyLg text-primary placeholder:text-inactive transition-colors duration-150 ease-in-out hover:border-primary focus:outline-none focus:border-interactive focus:ring-1 focus:ring-interactive focus:ring-offset-0 cursor-pointer w-full";
  const fileInputLabelErrorStyle = "border-negative hover:border-negative focus:border-negative focus:ring-negative";

  function ProgressBar({ step, total }: { step: number; total: number }) {
    return (
      <div className="flex items-center mb-8 mt-2 w-full max-w-xs sm:max-w-sm md:max-w-md">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full flex-1 mx-1',
              i === 0 ? 'ml-0' : '',
              i === total - 1 ? 'mr-0' : '',
              i < step ? 'bg-primary' : 'bg-cream'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-lg">
        <div className="px-2 md:px-4 mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-titleMd font-display text-primary">
            Create New Donation
          </h1>
        </div>
        <div className="px-6">
          <div className="w-full">
            <ProgressBar step={step} total={totalSteps} />
          </div>
        </div>
        {serverError && (
          <div className="mb-6 rounded-md bg-negative/10 p-4 text-body text-negative flex items-center gap-2">
             <AlertTriangle className="h-5 w-5 text-negative" />
            {serverError}
          </div>
        )}

        <form className="space-y-6 px-2 md:px-4">
          {step === 1 && (
            <>
              {items.map((item, idx) => (
                <div key={idx}>
                  {item.displayState === 'editing' ? (
                    <div className="mb-6 p-6 rounded-2xl border border-[var(--zipli-border-light,#F3F4F6)] bg-white shadow-md">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`items.${idx}.name`} className="block text-label font-semibold text-secondary mb-2">
                            Food Item Name
                          </label>
                          <Input
                            id={`items.${idx}.name`}
                            type="text"
                            placeholder="e.g., Whole Wheat Bread, Mixed Vegetables"
                            {...register(`items.${idx}.name`, { required: "Food item name is required" })}
                            error={!!errors.items?.[idx]?.name}
                            disabled={isSubmitting}
                          />
                          {errors.items?.[idx]?.name && (
                            <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> {errors.items[idx]?.name?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor={`items.${idx}.description`} className="block text-label font-semibold text-secondary mb-2">
                            Description
                          </label>
                          <Textarea
                            id={`items.${idx}.description`}
                            placeholder="Provide details about the item, condition, allergens, etc."
                            rows={4}
                            {...register(`items.${idx}.description`, { required: "Description is required" })}
                            error={!!errors.items?.[idx]?.description}
                            disabled={isSubmitting}
                          />
                          {errors.items?.[idx]?.description && (
                            <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> {errors.items[idx]?.description?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor={`items.${idx}.quantity`} className="block text-label font-semibold text-secondary mb-2">
                            Quantity (kg)
                          </label>
                          {/* New simple number input for quantity */}
                          <Input
                            id={`items.${idx}.quantity`}
                            type="number"
                            step="0.1" // Allow decimal increments like 0.1, 0.5
                            placeholder="e.g., 2.5"
                            {...register(`items.${idx}.quantity`, {
                              required: "Quantity is required",
                              valueAsNumber: true, // Ensure the value is treated as a number
                              min: { value: 0.1, message: "Quantity must be at least 0.1 kg" },
                              // Możesz dodać max jeśli potrzebujesz
                            })}
                            error={!!errors.items?.[idx]?.quantity}
                            disabled={isSubmitting}
                          />
                          {errors.items?.[idx]?.quantity && (
                            <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> {errors.items[idx]?.quantity?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-label font-semibold text-secondary mb-2">
                            Allergens
                          </label>
                          {/* Remove old Input */}
                          {/* Add Allergen Buttons */}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {['lactose-free', 'low-lactose', 'gluten-free', 'soy-free'].map((allergen) => {
                              const isSelected = (watch(`items.${idx}.allergens`) || '').includes(allergen);
                              return (
                                <Button
                                  key={allergen}
                                  type="button"
                                  variant={isSelected ? "primary" : "secondary"} // Change variant based on selection
                                  size="sm"
                                  className="text-xs h-7 px-2.5" // Adjust size/padding
                                  onClick={() => handleAllergenToggle(idx, allergen)}
                                  disabled={isSubmitting}
                                >
                                  {formatAllergenLabel(allergen)} {/* Use formatter for label */}
                                </Button>
                              );
                             })}
                          </div>
                        </div>
                        <div>
                          <label className="block text-label font-semibold text-secondary mb-2">
                            Type of Food
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {FOOD_TYPE_OPTIONS.map((type) => {
                              const isSelected = (watch(`items.${idx}.food_type`) || 'Other') === type;
                              return (
                                <Button
                                  key={type}
                                  type="button"
                                  variant={isSelected ? "primary" : "secondary"}
                                  size="sm"
                                  className="text-xs h-7 px-2.5 capitalize"
                                  onClick={() => setValue(`items.${idx}.food_type`, type)}
                                  disabled={isSubmitting}
                                >
                                  {type}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Add Image Input */}
                        <div>
                          <label className="block text-label font-semibold text-secondary mb-2">
                            Image (Optional)
                          </label>
                          <label 
                            htmlFor={`items.${idx}.image`} 
                            className={cn(
                              "mt-1 flex justify-center items-center flex-col gap-1 rounded-lg border-2 border-dashed border-inactive px-6 py-10 text-center cursor-pointer",
                              "hover:border-primary/50",
                              errors.items?.[idx]?.image ? "border-negative hover:border-negative/50 bg-negative/5" : "bg-cream/30",
                            )}
                          >
                            <input
                              id={`items.${idx}.image`}
                              type="file"
                              accept="image/*" 
                              className="hidden" // Hide the actual input
                              {...register(`items.${idx}.image`, {
                                validate: {
                                  lessThan5MB: (files) => files?.[0]?.size ? files[0].size < 5 * 1024 * 1024 : true,
                                  isImage: (files) => files?.[0]?.type ? files[0].type.startsWith('image/') : true,
                                }
                              })}
                              disabled={isSubmitting}
                            />
                             {/* Conditional Content */}
                            {watch(`items.${idx}.image`)?.[0] ? (
                              <span className="text-sm text-primary truncate max-w-full px-2">
                                {watch(`items.${idx}.image`)?.[0]?.name}
                              </span>
                             ) : (
                              <>
                                <Plus className="h-6 w-6 text-primary/70" />
                                <span className="text-sm text-secondary">
                                  Add a photo of your dish or container
                                </span>
                              </>
                            )}
                          </label>
                          {/* Keep error messages */} 
                          {errors.items?.[idx]?.image?.type === 'lessThan5MB' && (
                            <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> Image must be less than 5MB.
                            </p>
                          )}
                           {errors.items?.[idx]?.image?.type === 'isImage' && (
                            <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> File must be an image.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end items-center gap-2 mt-6">
                         <Button type="button" variant="ghost" size="sm" className="text-negative hover:bg-negative/10" onClick={() => handleDeleteItem(idx)}>
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete Item</span>
                         </Button>
                        <Button type="button" variant="secondary" onClick={() => handleSetItemSummary(idx)}>
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-cream flex justify-between items-center">
                      <div>
                        <p className="text-body font-semibold text-primary">{item.name || "Unnamed Item"}</p>
                        <p className="text-sm text-secondary">Quantity: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleEditItem(idx)} aria-label="Edit Item">
                           <Pencil className="h-4 w-4" />
                        </Button>
                         <Button type="button" variant="ghost" size="sm" className="text-negative hover:bg-negative/10" onClick={() => handleDeleteItem(idx)}>
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete Item</span>
                         </Button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddItem}
                >
                  + Add another item
                </Button>
              </div>
              <div className="flex justify-between items-center gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/donate')}
                  disabled={isSubmitting} 
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting} 
                >
                  Next
                </Button>
              </div>
            </>
          )}
          {/* == Step 2: Pickup Time == */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-primary">Pickup Scheduling</h2>
              
              <div className="space-y-6 mb-6"> {/* Increased spacing */}
                {/* Date Picker (Existing Code)*/}
                <div>
                   <label className="block text-label font-semibold text-secondary mb-2">
                     Pickup Date
                   </label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         variant={"secondary"}
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !pickupDateValue && "text-inactive"
                         )}
                         disabled={isSubmitting}
                       >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                         {pickupDateValue ? format(pickupDateValue, "PPP") : <span>Pick a date</span>}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0 bg-white">
                       <Calendar
                         mode="single"
                         selected={pickupDateValue}
                         onSelect={(date: Date | undefined) => setValue('pickup_date', date, { shouldValidate: true })}
                         disabled={(date: Date) => 
                           date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                           date > new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
                         }
                         initialFocus
                       />
                     </PopoverContent>
                   </Popover>
                   {errors.pickup_date && (
                     <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                       <AlertTriangle className="h-4 w-4" /> {errors.pickup_date.message}
                     </p>
                   )}
                </div>
                 
                {/* Time Slots Section */}
                <div>
                  <TooltipProvider>
                    <div className="flex items-center gap-1 mb-3">
                     <label className="block text-label font-semibold text-secondary">Available Time Slots</label>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Info className="h-3.5 w-3.5 text-inactive cursor-help" />
                       </TooltipTrigger>
                       <TooltipContent>
                         <p className="text-xs">Start time must be between 7am-10pm.<br/>Slots cannot exceed 4 hours.</p>
                       </TooltipContent>
                     </Tooltip>
                    </div>
                     <div className="space-y-4">
                      {slotFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-cream/30">
                          <div className="flex-1">
                             <label htmlFor={`pickup_slots.${index}.start`} className="block text-xs font-medium text-secondary mb-1">Start Time</label>
                            <input
                              id={`pickup_slots.${index}.start`}
                              type="time"
                              {...register(`pickup_slots.${index}.start`, { 
                                required: "Start time required",
                                validate: (startTime) => {
                                  if (!startTime) return true;
                                  const [startH, startM] = startTime.split(':').map(Number);
                                  const startMinutes = startH * 60 + startM;
                                  if (startMinutes < 7 * 60) { return "Start time cannot be before 7:00 AM"; }
                                  if (startMinutes > 22 * 60) { return "Start time cannot be after 10:00 PM"; }
                                  return true;
                                }
                              })}
                              disabled={isSubmitting}
                              className={cn(
                                "w-full p-2 border rounded-md", // Minimal styling: width, padding, border, rounding
                                errors.pickup_slots?.[index]?.start ? "border-negative" : "border-gray-300" 
                              )}
                            />
                            {errors.pickup_slots?.[index]?.start && (
                              <p className="mt-1 text-xs text-negative flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> {errors.pickup_slots[index]?.start?.message}</p>
                            )}
                          </div>
                          <div className="flex-1">
                             <label htmlFor={`pickup_slots.${index}.end`} className="block text-xs font-medium text-secondary mb-1">End Time</label>
                            <input
                              id={`pickup_slots.${index}.end`}
                              type="time"
                              {...register(`pickup_slots.${index}.end`, { 
                                required: "End time required",
                                validate: (endTime) => {
                                  const startTime = getValues(`pickup_slots.${index}.start`);
                                  if (!startTime || !endTime) return true;
                                  const [startH, startM] = startTime.split(':').map(Number);
                                  const [endH, endM] = endTime.split(':').map(Number);
                                  const startMinutes = startH * 60 + startM;
                                  const endMinutes = endH * 60 + endM;
                                  if (endMinutes <= startMinutes) { return "End time must be after start time"; }
                                  if (endMinutes > startMinutes + 4 * 60) { return "Slot duration cannot exceed 4 hours"; }
                                  return true;
                                }
                               })}
                              disabled={isSubmitting}
                              className={cn(
                                "w-full p-2 border rounded-md", // Minimal styling: width, padding, border, rounding
                                errors.pickup_slots?.[index]?.end ? "border-negative" : "border-gray-300"
                              )}
                            />
                            {errors.pickup_slots?.[index]?.end && (
                               <p className="mt-1 text-xs text-negative flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> {errors.pickup_slots[index]?.end?.message}</p>
                             )}
                           </div>
                           {slotFields.length > 1 && (
                             <Button 
                               type="button" 
                               variant="ghost" 
                               size="sm"
                               className="text-negative hover:bg-negative/10 p-1 h-auto self-center mb-1"
                               onClick={() => removeSlot(index)}
                               disabled={isSubmitting}
                               aria-label="Remove time slot"
                             >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                           )}
                          </div>
                       ))}
                     </div>
                   </TooltipProvider>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-sm"
                    onClick={() => appendSlot({ start: '', end: '' })}
                    disabled={isSubmitting || slotFields.length >= 6}
                  >
                    + Add another time slot
                  </Button>
                </div>
               </div>

              {/* Navigation Buttons (Existing Code) */}
              <div className="flex justify-between gap-2 pt-4">
                 <Button
                   type="button"
                   variant="secondary"
                   onClick={() => setStep(1)}
                   disabled={isSubmitting}
                 >
                  Back
                </Button>
                 <Button
                   type="button"
                   variant="primary"
                   onClick={async () => {
                     const isValid = await trigger(["pickup_date", "pickup_slots"]);
                     if (isValid) {
                       setStep(3);
                     }
                   }}
                   disabled={isSubmitting}
                 >
                  Next
                </Button>
              </div>
            </>
          )}
          {/* == Step 3: Expiry & Details == */}
          {step === 3 && (
            <>
              <div className="space-y-6 mb-6">
                {/* Donation Summary */}
                <div className="p-4 rounded-lg border bg-cream/50">
                   <h3 className="text-md font-semibold mb-2 text-primary">Donation Items</h3>
                   <ul className="space-y-1 list-disc list-inside text-sm text-secondary">
                    {items.map((item, idx) => (
                       <li key={idx}>{item.name || "Unnamed Item"} ({item.quantity} kg)</li>
                     ))}
                   </ul>
                 </div>

                {/* Pickup Summary - Updated */}
                <div className="p-4 rounded-lg border bg-cream/50">
                  <h3 className="text-md font-semibold mb-2 text-primary">Pickup Schedule</h3>
                  <p className="text-sm text-secondary mb-1">
                    Date: {pickupDateValue ? format(pickupDateValue, "PPP") : "No date selected"}
                  </p>
                  <p className="text-sm text-secondary mb-1">Time Slots:</p>
                  <ul className="space-y-1 list-disc list-inside ml-4 text-sm text-secondary">
                    {watch('pickup_slots').map((slot, index) => (
                      <li key={index}>
                        {slot.start || "--:--"} - {slot.end || "--:--"}
                      </li>
                    ))}
                    {watch('pickup_slots').length === 0 && <li>No time slots selected</li>}
                  </ul>
                </div>

                {/* Address */} 
                <div>
                  <label className="block text-label font-semibold text-secondary mb-1">Pickup Address</label>
                 {loadingProfile ? (
                   <p className="text-sm text-secondary italic">Loading address...</p>
                 ) : profile?.address ? (
                   <p className="text-sm text-primary bg-cream/50 p-3 rounded-md border">
                      {profile.address}
                   </p>
                 ) : (
                   <p className="text-sm text-negative italic">No address found on profile.</p>
                 )}
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className="text-xs h-auto p-0 mt-1 text-primary underline hover:text-primary/80"
                   >
                   <a href="/profile" target="_blank" className="block w-full h-full">Edit Address in Profile</a>
                 </Button>
                </div>

                {/* Instructions */}
                <div>
                  <label htmlFor="instructions_for_driver" className="block text-label font-semibold text-secondary mb-2">
                    Instructions for Driver (Optional)
                  </label>
                  <Textarea
                    id="instructions_for_driver"
                    placeholder="e.g., Use the back entrance, call upon arrival, specific parking info..."
                    rows={3}
                    {...register("instructions_for_driver")}
                    error={!!errors.instructions_for_driver}
                    disabled={isSubmitting}
                  />
                  {errors.instructions_for_driver && (
                   <p className="mt-1.5 text-sm text-negative flex items-center gap-1">
                     <AlertTriangle className="h-4 w-4" /> {errors.instructions_for_driver.message}
                   </p>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
                {/* Final Submit Button - For now, let's just use the existing onSubmit */}
                 <Button 
                   type="submit"
                   variant="primary" 
                   disabled={isSubmitting || loadingProfile}
                   onClick={handleSubmit(onSubmit)}
                  >
                   {isSubmitting ? "Submitting..." : "Submit Donation"}
                 </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
} 