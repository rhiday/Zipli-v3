'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { AlertTriangle, Trash2, Pencil, Plus, Minus, CalendarIcon, Info, ChevronLeft, Mic, StopCircle, Brain, X } from 'lucide-react';
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
import { v4 as uuidv4 } from 'uuid';

const FOOD_TYPE_OPTIONS = [
  'Prepared meals',
  'Fresh produce',
  'Cold packaged foods',
  'Bakery and Pastry',
  'Other',
] as const;

export type FoodTypeOption = typeof FOOD_TYPE_OPTIONS[number];

export type ItemInput = {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  foodType: FoodTypeOption;
  allergens?: string[];
  image?: FileList | null;
  displayState: 'editing' | 'summary';
  imagePreviewUrl?: string | null;
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

// Helper function to detect iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || 
  // iPad on iOS 13 detection
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

const getRecordingMimeType = () => {
  if (isIOS()) {
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/aac')) { // Fallback, though your logs say false
      return 'audio/aac';
    }
  }
  // Default for other browsers or if mp4 not supported on iOS (unlikely)
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  return ''; // Should indicate an error or unsupported browser
};

export default function CreateDonationPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'voiceInput' | 'formDetails'>('voiceInput');
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const totalSteps = 3;

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
      items: [{ id: uuidv4(), itemName: '', description: '', quantity: 1, foodType: 'Other', displayState: 'editing', image: undefined, imagePreviewUrl: null }],
      pickup_date: undefined,
      pickup_slots: [{ start: '09:00', end: '10:00' }],
      instructions_for_driver: ''
    }
  });

  const items = watch('items');
  const pickupDateValue = watch('pickup_date');

  // Effect to manage image preview URLs
  useEffect(() => {
    const currentItems = getValues().items;
    currentItems.forEach((item, index) => {
      const file = item.image?.[0];
      if (file) {
        const oldPreviewUrl = getValues(`items.${index}.imagePreviewUrl`);
        if (oldPreviewUrl) {
          URL.revokeObjectURL(oldPreviewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setValue(`items.${index}.imagePreviewUrl`, newPreviewUrl, {
          shouldDirty: false, 
          shouldTouch: false, 
          shouldValidate: false 
        });
      } else {
        const existingPreviewUrl = getValues(`items.${index}.imagePreviewUrl`);
        if (existingPreviewUrl) {
          URL.revokeObjectURL(existingPreviewUrl);
          setValue(`items.${index}.imagePreviewUrl`, null, {
            shouldDirty: false, 
            shouldTouch: false, 
            shouldValidate: false 
          });
        }
      }
    });

    return () => {
      const itemsOnCleanup = getValues().items;
      itemsOnCleanup.forEach((item, index) => {
        const previewUrl = getValues(`items.${index}.imagePreviewUrl`);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [items, setValue, getValues, JSON.stringify(items.map(item => (item.image?.[0]?.name || '') + (item.image?.[0]?.size || '')))]); // More sensitive dependency with null checks for linter

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
    control,
    name: "pickup_slots"
  });

  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch profile data (runs when formDetails view is shown or if needed earlier)
  useEffect(() => {
    if (currentView === 'formDetails') { // Only fetch when form is visible
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
          setServerError('Not authenticated.');
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [currentView]);

  const handleInitialVoiceInput = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    setIsTranscribing(false);
    setIsProcessingDetails(false);
    setServerError(null);

    try {
      // Log supported MIME types for debugging
      const supportedTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac'];
      supportedTypes.forEach(type => {
        console.log(`[CLIENT DEBUG] MediaRecorder.isTypeSupported('${type}') on donate page: ${MediaRecorder.isTypeSupported(type)}`);
      });
      const recordingMimeType = getRecordingMimeType();
      console.log(`[CLIENT DEBUG] Donate Page - Using MIME Type: ${recordingMimeType}`);
      if (!recordingMimeType) {
        setServerError('Audio recording format not supported on this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: recordingMimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        const recordingMimeType = getRecordingMimeType(); // Get it again to be sure
        const audioBlob = new Blob(audioChunksRef.current, { type: recordingMimeType || 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        console.log('[CLIENT DEBUG] Donate Page - Audio Blob Created', { type: audioBlob.type, size: audioBlob.size });

        if (audioBlob.size === 0) {
          logger.warn('Audio blob is empty for donation item, skipping transcription.');
          setServerError("Recording was empty or too short. Please try speaking clearly for a bit longer.");
          setIsTranscribing(false);
          setIsProcessingDetails(false);
          audioChunksRef.current = [];
          return;
        }

        const audioFormData = new FormData();
        // Determine file extension based on MIME type for OpenAI
        let fileExtension = '.webm';
        if (audioBlob.type.includes('mp4')) fileExtension = '.mp4';
        else if (audioBlob.type.includes('aac')) fileExtension = '.aac';
        // Add other mappings if necessary based on getRecordingMimeType

        audioFormData.append('audio', audioBlob, `initial_donation_item${fileExtension}`);

        let transcript = '';
        try {
          const transcribeResponse = await fetch('/api/transcribe-audio', { method: 'POST', body: audioFormData });
          if (!transcribeResponse.ok) throw new Error((await transcribeResponse.json()).error || 'Transcription API call failed');
          transcript = (await transcribeResponse.json()).transcript;
          console.log('[CLIENT DEBUG] Donate Page - Transcript received:', transcript); // Log the transcript
          if (!transcript || transcript.trim() === '.' || transcript.trim().toLowerCase() === 'you') { // Added more checks for poor/empty transcripts
            throw new Error('Transcription was empty or unclear. Please try speaking again clearly.');
          }

          setIsTranscribing(false);
          setIsProcessingDetails(true);

          const processResponse = await fetch('/api/process-item-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) });
          if (!processResponse.ok) throw new Error((await processResponse.json()).error || 'Processing details API call failed');
          const result = await processResponse.json(); // Expected: { itemName, description, quantity, unit, foodType }

          // Check if AI successfully extracted an item name
          if (!result.itemName || result.itemName.trim().toLowerCase() === 'not provided' || result.itemName.trim() === '') {
            throw new Error('Could not understand the item details from your voice input. Please try describing the item again, including its name, description, and quantity.');
          }

          const currentItems = getValues('items');
          // Check if this is the very first item being added (i.e., items array has 1 default placeholder)
          const isFirstEverItem = currentItems.length === 1 && 
                                !currentItems[0].itemName && 
                                currentItems[0].description === '' && 
                                currentItems[0].quantity === 1 && // Default quantity
                                currentItems[0].displayState === 'editing';

          if (isFirstEverItem) {
            setValue('items.0.itemName', result.itemName || '', { shouldValidate: true });
            setValue('items.0.description', result.description || '', { shouldValidate: true });
            setValue('items.0.quantity', result.quantity || 1, { shouldValidate: true });
            setValue('items.0.foodType', result.foodType || 'Other', { shouldValidate: true });
            setValue('items.0.allergens', []); // Allergens are manual for now after voice
            setValue('items.0.displayState', 'editing');
          } else {
            // It's a new item to be appended. Set all existing items to summary.
            const updatedExistingItems = currentItems.map(item => ({ ...item, displayState: 'summary' as const }));
            
            setValue('items', [
              ...updatedExistingItems,
              {
                id: uuidv4(),
                itemName: result.itemName || '',
                description: result.description || '',
                quantity: result.quantity || 1,
                foodType: result.foodType || 'Other',
                displayState: 'editing',
                image: null,
              }
            ], { shouldValidate: true });
          }
          
          setServerError(null);
          setCurrentView('formDetails');
          setStep(1);
        } catch (err: any) {
          console.error('Voice processing error:', err);
          setServerError(`Voice input failed: ${err.message}`);
        } finally {
          setIsTranscribing(false);
          setIsProcessingDetails(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setServerError('Microphone access denied or error. Please enable microphone permissions.');
      setIsRecording(false);
    }
  };
  
  const handleAddItem = async () => {
    const itemsArray = getValues('items');
    const editingItemIndex = itemsArray.findIndex(item => item.displayState === 'editing');

    if (editingItemIndex !== -1) {
      // Validate the current item before switching to voice input
      const isValid = await trigger([
        `items.${editingItemIndex}.itemName`,
        `items.${editingItemIndex}.description`,
        `items.${editingItemIndex}.quantity`,
        // food_type, allergens, image are not part of this specific validation before adding new
      ]);
      if (!isValid) {
        // Optional: set an error or simply prevent proceeding
        // For now, if validation fails, we just don't switch to voice input
        // User should see errors from react-hook-form
        return;
      }
      // Set the current editing item to summary
      setValue(`items.${editingItemIndex}.displayState`, 'summary', { shouldTouch: true });
    } else if (itemsArray.length > 0) {
      // If no item is actively being edited, but items exist, set all to summary.
      // This handles cases where user might have manually set an item to summary then clicks add.
      const allSummaryItems = itemsArray.map(item => ({ ...item, displayState: 'summary' as const }));
      setValue('items', allSummaryItems, { shouldTouch: true });
    }

    setCurrentView('voiceInput');
    // No new blank item is added here; voice input will create and append the new item.
  };

  const handleEditItem = (index: number) => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.map((item, idx) => ({
      ...item,
      displayState: idx === index ? 'editing' as const : 'summary' as const,
    }));
    setValue('items', updatedItems);
  };

  const handleSetItemSummary = (index: number) => {
    const currentItems = getValues('items');
    const updatedItems = currentItems.map((item, idx) => ({
      ...item,
      displayState: idx === index ? 'summary' as const : item.displayState,
    }));
    setValue('items', updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const currentItems = getValues('items');
    let updatedItems = currentItems.filter((_, idx) => idx !== index);

    if (updatedItems.length === 0) {
        setCurrentView('voiceInput');
        reset({
            items: [{ id: uuidv4(), itemName: '', description: '', quantity: 1, foodType: 'Other', displayState: 'editing', image: null }],
            pickup_date: undefined,
            pickup_slots: [{ start: '09:00', end: '10:00' }],
            instructions_for_driver: ''
        });
        return;
    }
    const isEditingDeleted = currentItems[index]?.displayState === 'editing';
    if (isEditingDeleted && updatedItems.length > 0) {
        updatedItems[updatedItems.length - 1].displayState = 'editing';
    }
    setValue('items', updatedItems);
  };
  
  const handleAllergenToggle = (itemIndex: number, allergenToToggle: string) => {
    const currentAllergensArray = getValues(`items.${itemIndex}.allergens`) || []; // Ensures it's always string[]
    const isSelected = currentAllergensArray.includes(allergenToToggle);
    let updatedAllergensArray: string[];
    if (isSelected) {
      updatedAllergensArray = currentAllergensArray.filter(a => a !== allergenToToggle);
    } else {
      updatedAllergensArray = [...currentAllergensArray, allergenToToggle];
    }
    // Set the value back as a string array, consistent with ItemInput type
    setValue(`items.${itemIndex}.allergens`, updatedAllergensArray, { shouldValidate: true, shouldDirty: true });
  };

  const formatAllergenLabel = (allergen: string): string => allergen.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');

  const onSubmit = async (data: DonationFormInputs) => {
    logger.debug('Donation form onSubmit triggered.', { itemCount: data.items.length, pickupDateSelected: !!data.pickup_date, slotCount: data.pickup_slots.length });
    setServerError(null);
    let userIdForLog: string | undefined = 'N/A';

    if (!data.pickup_date || !data.pickup_slots || data.pickup_slots.length === 0 || !data.pickup_slots[0].start || !data.pickup_slots[0].end) {
      setServerError('Pickup date and at least one valid time slot are required.');
      setStep(2); // Ensure user is on pickup step to see the error
      return;
    }
    const [startHours, startMinutes] = data.pickup_slots[0].start.split(':').map(Number);
    const firstPickupDateTime = new Date(data.pickup_date);
    firstPickupDateTime.setHours(startHours, startMinutes, 0, 0);
    const finalPickupTimeISO = firstPickupDateTime.toISOString();
    const now = new Date();
    const threeWeeksFromNow = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    if (firstPickupDateTime <= now) {
      setServerError('First pickup slot must start in the future.'); setStep(2); return;
    }
    if (firstPickupDateTime > threeWeeksFromNow) {
      setServerError('Pickup date must be within 3 weeks.'); setStep(2); return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('Not authenticated');
      userIdForLog = user.id;
      logger.debug('Authenticated user for donation submission:', user.id);

      for (const [idx, item] of data.items.entries()) {
        let item_image_url: string | null = null;
        const imageToUpload = item.image?.[0];
        let foodItem: { id: string } | null = null;

        const { data: foodItemData, error: foodItemError } = await supabase
          .from('food_items')
          .insert([{ 
            donor_id: user.id, 
            name: item.itemName, 
            description: item.description, 
            image_url: null, 
            allergens: item.allergens?.join(', ') || null,
            food_type: item.foodType || 'Other', 
            quantity: item.quantity
          }])
          .select()
          .single();
        if (foodItemError) throw foodItemError;
        if (!foodItemData) throw new Error('Failed to create food item');
        foodItem = foodItemData as { id: string };

        if (imageToUpload) {
          const formData = new FormData();
          formData.append('image', imageToUpload);
          const res = await fetch('/api/compress-image', { method: 'POST', body: formData });
          if (!res.ok) { setServerError(`Failed to compress image for item ${idx + 1}.`); return; }
          const compressedBlob = await res.blob();
          const compressedFile = new File([compressedBlob], `item_${idx}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const fileName = `${user.id}/item_${idx}_${Date.now()}.jpg`;
          const { error: uploadError, data: uploadData } = await supabase.storage.from('donations').upload(fileName, compressedFile, { contentType: 'image/jpeg' });
          if (uploadError) throw uploadError;
          if (uploadData) item_image_url = supabase.storage.from('donations').getPublicUrl(uploadData.path).data.publicUrl;

        } else {
          try {
            const response = await fetch('/api/generate-food-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item.itemName }) });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate image');
            item_image_url = (await response.json()).url;
          } catch (err: any) { console.error('Error generating image:', err); }
        }

        if (item_image_url) {
          const { error: updateError } = await supabase.from('food_items').update({ image_url: item_image_url }).eq('id', foodItem.id);
          if (updateError) console.error('Error updating food item with image:', updateError);
        }

        const { error: insertError } = await supabase.from('donations').insert([
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
        if (insertError) { logger.error("Error inserting into donations table:", insertError); throw insertError; }
      }

      logger.info('Donation submitted successfully by user:', user.id, { itemCount: data.items.length });
      reset(); // Reset form to default state
      setCurrentView('voiceInput'); // Go back to voice input for a new donation
      router.push('/donate/thank-you');
    } catch (err: any) {
      logger.error('Error during donation submission process:', { message: err.message, userId: userIdForLog });
      setServerError(err.message || 'An error occurred while creating the donation');
    }
  };

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
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-lg">
        {currentView === 'voiceInput' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Describe Your Donation Item</h1>
            <p className="text-secondary mb-8 max-w-md">
              Tell us about the item(s) you'd like to donate.
              For each item, please state its name, a brief description, quantity (e.g., 2, 5), and food type.
              For example: "I have 2 boxes of macaroni and cheese, unopened, it's a canned good."
              Or: "About 3 apples, fresh produce."
            </p>
            <Button 
              type="button" 
              onClick={handleInitialVoiceInput} 
              disabled={isTranscribing || isProcessingDetails}
              className="px-8 py-6 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-3 shadow-lg"
            >
              {isRecording ? (
                <><StopCircle className="w-7 h-7 animate-pulse" /> Stop Recording</>
              ) : isTranscribing ? (
                <><Mic className="w-7 h-7 animate-pulse" /> Transcribing...</>
              ) : isProcessingDetails ? (
                <><Brain className="w-7 h-7 animate-pulse" /> Processing Details...</>
              ) : (
                <><Mic className="w-7 h-7" /> Start Voice Input</>
              )}
            </Button>
            {serverError && (
              <div className="mt-6 rounded-md bg-negative/10 p-4 text-body text-negative flex items-center gap-2 max-w-md">
                <AlertTriangle className="h-5 w-5 text-negative" />
                {serverError}
              </div>
            )}
            <Button variant="ghost" onClick={() => router.push('/donate')} className="mt-12 text-secondary hover:text-primary">
                Or, go back to dashboard
            </Button>
          </div>
        )}

        {currentView === 'formDetails' && (
          <>
            <div className="px-2 md:px-4 mb-6 flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => { setCurrentView('voiceInput'); reset(); /* Reset form if going back */ }} 
                className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
                aria-label="Go back to voice input"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-titleMd font-display text-primary">
                Confirm & Add Details
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
                              <label htmlFor={`items.${idx}.itemName`} className="block text-label font-semibold text-secondary mb-2">Food Item Name</label>
                              <Input id={`items.${idx}.itemName`} type="text" placeholder="e.g., Whole Wheat Bread" {...register(`items.${idx}.itemName`, { required: "Food item name is required" })} error={!!errors.items?.[idx]?.itemName} disabled={isSubmitting} />
                              {errors.items?.[idx]?.itemName && <p className="mt-1.5 text-sm text-negative flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {errors.items[idx]?.itemName?.message}</p>}
                            </div>
                            <div>
                              <label htmlFor={`items.${idx}.description`} className="block text-label font-semibold text-secondary mb-2">Description</label>
                              <Textarea id={`items.${idx}.description`} placeholder="Details about the item..." rows={4} {...register(`items.${idx}.description`, { required: "Description is required" })} error={!!errors.items?.[idx]?.description} disabled={isSubmitting} />
                              {errors.items?.[idx]?.description && <p className="mt-1.5 text-sm text-negative flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {errors.items[idx]?.description?.message}</p>}
                            </div>
                            <div>
                              <label htmlFor={`items.${idx}.quantity`} className="block text-label font-semibold text-secondary mb-2">Quantity (kg)</label>
                              <Input id={`items.${idx}.quantity`} type="number" step="0.1" placeholder="e.g., 2.5" {...register(`items.${idx}.quantity`, { valueAsNumber: true, required: "Qty is required", min: { value: 1, message: "Min 1" } })} error={!!errors.items?.[idx]?.quantity} disabled={isSubmitting} />
                              {errors.items?.[idx]?.quantity && <p className="mt-1.5 text-sm text-negative"><AlertTriangle className="h-4 w-4 inline" /> {errors.items[idx]?.quantity?.message}</p>}
                            </div>
                            <div>
                              <label className="block text-label font-semibold text-secondary mb-2">Allergens</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {['lactose-free', 'low-lactose', 'gluten-free', 'soy-free'].map((allergen) => (<Button key={allergen} type="button" variant={(watch(`items.${idx}.allergens`) || '').includes(allergen) ? "primary" : "secondary"} size="sm" className="text-xs h-7 px-2.5" onClick={() => handleAllergenToggle(idx, allergen)} disabled={isSubmitting}>{formatAllergenLabel(allergen)}</Button>))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-label font-semibold text-secondary mb-2">Type of Food</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {FOOD_TYPE_OPTIONS.map((type) => (<Button key={type} type="button" variant={(watch(`items.${idx}.foodType`) || 'Other') === type ? "primary" : "secondary"} size="sm" className="text-xs h-7 px-2.5 capitalize" onClick={() => setValue(`items.${idx}.foodType`, type)} disabled={isSubmitting}>{type}</Button>))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-label font-semibold text-secondary mb-2">Image (Optional)</label>
                              <div className={cn(
                                "mt-1 flex justify-center items-center rounded-lg border-2 border-dashed border-inactive relative",
                                errors.items?.[idx]?.image ? "border-negative hover:border-negative/50 bg-negative/5" : "bg-cream/30",
                                watch(`items.${idx}.imagePreviewUrl`) ? "p-0 w-28 h-28" : "px-6 py-10"
                              )}>
                                <input 
                                  id={`items.${idx}.image`} 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  {...register(`items.${idx}.image`, { 
                                    validate: { 
                                      lessThan5MB: (files) => files?.[0]?.size ? files[0].size < 5 * 1024 * 1024 : true, 
                                      isImage: (files) => files?.[0]?.type ? files[0].type.startsWith('image/') : true 
                                    }
                                  })} 
                                  disabled={isSubmitting} 
                                />
                                {watch(`items.${idx}.imagePreviewUrl`) ? (
                                  <div className="relative w-24 h-24 flex justify-center items-center">
                                    <img 
                                      src={watch(`items.${idx}.imagePreviewUrl`)!} 
                                      alt="Selected image preview" 
                                      className="w-full h-full object-contain rounded-md" 
                                    />
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm"
                                      className="absolute top-0.5 right-0.5 p-0.5 h-5 w-5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-opacity"
                                      onClick={() => {
                                        setValue(`items.${idx}.image`, null, { shouldValidate: true, shouldDirty: true });
                                        // The useEffect will handle revoking and setting imagePreviewUrl to null
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                      <span className="sr-only">Remove image</span>
                                    </Button>
                                  </div>
                                ) : (
                                  <label htmlFor={`items.${idx}.image`} className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                    <Plus className="h-6 w-6 text-primary/70" />
                                    <span className="text-sm text-secondary">Add photo</span>
                                  </label>
                                )}
                              </div>
                              {watch(`items.${idx}.image`)?.[0] && !watch(`items.${idx}.imagePreviewUrl`) && (
                                <span className="text-xs text-secondary truncate max-w-full px-2 mt-1">{watch(`items.${idx}.image`)?.[0]?.name}</span>
                              )}
                              {errors.items?.[idx]?.image?.type === 'lessThan5MB' && <p className="mt-1.5 text-sm text-negative"><AlertTriangle className="h-4 w-4 inline" /> Image must be less than 5MB.</p>}
                              {errors.items?.[idx]?.image?.type === 'isImage' && <p className="mt-1.5 text-sm text-negative"><AlertTriangle className="h-4 w-4 inline" /> File must be an image.</p>}
                            </div>
                          </div>
                          <div className="flex justify-end items-center gap-2 mt-6">
                            <Button type="button" variant="ghost" size="sm" className="text-negative hover:bg-negative/10" onClick={() => handleDeleteItem(idx)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete Item</span></Button>
                            <Button type="button" variant="secondary" onClick={() => handleSetItemSummary(idx)}>Done</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 rounded-xl border border-border bg-cream flex justify-between items-center">
                          <div>
                            <p className="text-body font-semibold text-primary">{item.itemName || "Unnamed Item"} ({item.quantity} kg)</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleEditItem(idx)} aria-label="Edit Item"><Pencil className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="sm" className="text-negative hover:bg-negative/10" onClick={() => handleDeleteItem(idx)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete Item</span></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end mb-4">
                    <Button type="button" variant="ghost" onClick={handleAddItem}>+ Add another item</Button>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={() => { setCurrentView('voiceInput'); reset(); }} disabled={isSubmitting}>Start Over with Voice</Button>
                    <Button type="button" variant="primary" onClick={async () => {
                      // Validate all required fields for the current item in step 1
                      const itemsArray = getValues('items');
                      const editingItemIndex = itemsArray.findIndex(item => item.displayState === 'editing');
                      const currentItemIndex = editingItemIndex !== -1 ? editingItemIndex : (itemsArray.length -1); // Default to last if none editing (e.g. after voice add)

                      if (currentItemIndex >= 0) {
                        const isValid = await trigger([
                          `items.${currentItemIndex}.itemName`,
                          `items.${currentItemIndex}.description`,
                          `items.${currentItemIndex}.quantity`
                          // food_type has a default, allergens/image are optional
                        ]);
                        if (isValid) setStep(2);
                      } else { // Should not happen if there's at least one item
                        setStep(2);
                      }
                    }} disabled={isSubmitting}>Next: Pickup Details</Button>
                  </div>
                </>
              )}
              {step === 2 && (
                 <>
                    <h2 className="text-lg font-semibold mb-4 text-primary">Pickup Scheduling</h2>
                    <div className="mb-4">
                        <label htmlFor="pickup_date" className="block text-label font-semibold text-secondary mb-2">Pickup Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"secondary"}
                                className={cn(
                                "w-full justify-start text-left font-normal h-11 px-4 py-3 rounded-lg border-border bg-white hover:bg-cream/30 focus:border-primary transition-colors",
                                !pickupDateValue && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {pickupDateValue ? format(pickupDateValue, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-md border bg-white shadow-md">
                            <Calendar
                                mode="single"
                                selected={pickupDateValue}
                                onSelect={(date) => setValue('pickup_date', date, { shouldValidate: true })}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || date > new Date(new Date().setDate(new Date().getDate() + 21))}
                            />
                            </PopoverContent>
                        </Popover>
                        {errors.pickup_date && <p className="mt-1.5 text-sm text-negative"><AlertTriangle className="h-4 w-4 inline" /> {errors.pickup_date.message}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-label font-semibold text-secondary">Pickup Time Slots</label>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-secondary cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="text-xs">Provide one or more time windows when you'll be available for pickup. Each slot should be at least 1 hour long.</p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {slotFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                <Input type="time" {...register(`pickup_slots.${index}.start`, { required: 'Start time required' })} className="w-1/2 h-11 px-4 py-3 rounded-lg border-border bg-white" disabled={isSubmitting}/>
                                <Input type="time" {...register(`pickup_slots.${index}.end`, { required: 'End time required' })} className="w-1/2 h-11 px-4 py-3 rounded-lg border-border bg-white" disabled={isSubmitting}/>
                                <Button type="button" variant="ghost" size="sm" className="text-negative hover:bg-negative/10 p-1.5" onClick={() => removeSlot(index)} disabled={slotFields.length <= 1 || isSubmitting}><Minus className="h-4 w-4" /></Button>
                            </div>
                        ))}
                         {errors.pickup_slots && <p className="mt-1.5 text-sm text-negative"><AlertTriangle className="h-4 w-4 inline" /> Please ensure all time slots are valid.</p>}
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendSlot({ start: '09:00', end: '10:00' })} disabled={isSubmitting}>+ Add Slot</Button>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="instructions_for_driver" className="block text-label font-semibold text-secondary mb-2">Instructions for Driver (Optional)</label>
                        <Textarea id="instructions_for_driver" placeholder="e.g., 'Ring the bell', 'Leave at front desk'" {...register('instructions_for_driver')} className="rounded-lg border-border bg-white" disabled={isSubmitting}/>
                    </div>

                     <div className="flex justify-between gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isSubmitting}>Back to Item Details</Button>
                        <Button type="button" variant="primary" onClick={async () => { const isValid = await trigger(["pickup_date", "pickup_slots"]); if (isValid) setStep(3); }} disabled={isSubmitting}>Next: Review & Submit</Button>
                    </div>
                 </>
              )}
              {step === 3 && (
                <>
                    <h2 className="text-lg font-semibold mb-4 text-primary">Review Your Donation</h2>
                    
                    <div className="mb-6 p-6 rounded-2xl border border-[var(--zipli-border-light,#F3F4F6)] bg-white shadow-md space-y-4">
                        <div>
                            <h3 className="text-md font-semibold text-secondary mb-2">Donation Items:</h3>
                            {items.map((item, index) => (
                                <div key={index} className="py-2 border-b border-border last:border-b-0">
                                    <p className="font-medium text-primary">{item.itemName || "Unnamed Item"} - {item.quantity} kg</p>
                                    <p className="text-sm text-secondary">{item.description}</p>
                                    {item.foodType && <p className="text-xs text-tertiary">Type: {item.foodType}</p>}
                                    {item.allergens && item.allergens.length > 0 && <p className="text-xs text-tertiary">Allergens: {item.allergens.join(', ')}</p>}
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-md font-semibold text-secondary mb-2">Pickup Details:</h3>
                            <p>Date: {pickupDateValue ? format(pickupDateValue, "PPP") : "Not set"}</p>
                            <p>Time Slots:</p>
                            <ul className="list-disc list-inside pl-4">
                                {getValues('pickup_slots').map((slot, i) => (
                                    <li key={i}>{slot.start} - {slot.end}</li>
                                ))}
                            </ul>
                            {getValues('instructions_for_driver') && (
                                <p>Instructions: {getValues('instructions_for_driver')}</p>
                            )}
                        </div>

                        {loadingProfile && <p>Loading address...</p>}
                        {!loadingProfile && profile && profile.address && (
                             <div>
                                <h3 className="text-md font-semibold text-secondary mb-2">Pickup Address:</h3>
                                <p>{profile.address}</p>
                            </div>
                        )}
                        {!loadingProfile && (!profile || !profile.address) && (
                            <div className="p-3 rounded-md bg-warning/10 text-warning border border-warning/30">
                                <p className="text-sm">Your pickup address is not set. Please <Button variant="ghost" className="p-0 h-auto text-sm text-warning hover:underline" onClick={() => router.push('/profile/edit')}>update your profile</Button>.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={isSubmitting}>Back to Pickup</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting || loadingProfile || (!profile?.address && !loadingProfile)} onClick={handleSubmit(onSubmit)}>{isSubmitting ? "Submitting..." : "Submit Donation"}</Button>
                    </div>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
} 