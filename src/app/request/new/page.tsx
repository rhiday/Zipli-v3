'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { ChevronLeft, CalendarIcon, Mic, StopCircle, Brain, AlertTriangle } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { logger } from '../../../../lib/logger';

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
    } else if (MediaRecorder.isTypeSupported('audio/aac')) { // Fallback
      return 'audio/aac';
    }
  }
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  return ''; 
};

// Define Form Input Types
type RequestFormInputs = {
  itemName: string; 
  quantity: number; 
  notes: string; // This will map to the primary description field from voice
  people_count: number;
  pickup_date?: Date;
  pickup_start_time: string;
  pickup_end_time: string;
  is_recurring: boolean;
  pickup_instructions?: string;
};

export default function CreateRequestPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'voiceInput' | 'formDetails'>('voiceInput');

  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<RequestFormInputs>({
    defaultValues: {
      itemName: '',
      quantity: 1,
      notes: '',
      people_count: 1,
      pickup_date: undefined,
      pickup_start_time: '09:00',
      pickup_end_time: '10:00',
      is_recurring: false,
      pickup_instructions: '',
    }
  });

  const pickupDateValue = watch('pickup_date');

  // Voice Input Handler (adapted from donate page)
  const handleRequestVoiceInput = async () => {
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
        console.log(`[CLIENT DEBUG] MediaRecorder.isTypeSupported('${type}') on request page: ${MediaRecorder.isTypeSupported(type)}`);
      });
      const recordingMimeType = getRecordingMimeType();
      console.log(`[CLIENT DEBUG] Request Page - Using MIME Type: ${recordingMimeType}`);
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
        const recordingMimeType = getRecordingMimeType(); // Get it again
        const audioBlob = new Blob(audioChunksRef.current, { type: recordingMimeType || 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        console.log('[CLIENT DEBUG] Request Page - Audio Blob Created', { type: audioBlob.type, size: audioBlob.size });

        if (audioBlob.size === 0) {
          logger.warn('Audio blob is empty, skipping transcription for request.');
          setServerError("Recording was empty or too short. Please try speaking clearly for a bit longer.");
          setIsTranscribing(false);
          setIsProcessingDetails(false);
          audioChunksRef.current = [];
          return;
        }

        const audioFormData = new FormData();
        let fileExtension = '.webm';
        if (audioBlob.type.includes('mp4')) fileExtension = '.mp4';
        else if (audioBlob.type.includes('aac')) fileExtension = '.m4a';

        audioFormData.append('audio', audioBlob, `request_item${fileExtension}`);

        let transcript = '';
        try {
          const transcribeResponse = await fetch('/api/transcribe-audio', { method: 'POST', body: audioFormData });
          if (!transcribeResponse.ok) throw new Error((await transcribeResponse.json()).error || 'Transcription API call failed');
          transcript = (await transcribeResponse.json()).transcript;
          console.log('[CLIENT DEBUG] Request Page - Transcript received:', transcript);
          if (!transcript || transcript.trim() === '.' || transcript.trim().toLowerCase() === 'you') {
            throw new Error('Transcription was empty or unclear. Please try speaking again clearly.');
          }

          setIsTranscribing(false);
          setIsProcessingDetails(true);

          const processResponse = await fetch('/api/process-request-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) });
          if (!processResponse.ok) throw new Error((await processResponse.json()).error || 'Processing request details API call failed');
          const result = await processResponse.json(); // Expected: { itemName, quantity, notes }

          if (!result.itemName || result.itemName.trim().toLowerCase() === 'unknown item' || result.itemName.trim() === '') {
            throw new Error('Could not understand the item from your voice input. Please try describing your request again.');
          }

          setValue('itemName', result.itemName || '', { shouldValidate: true });
          setValue('quantity', result.quantity || 1, { shouldValidate: true });
          setValue('notes', result.notes || '', { shouldValidate: true }); // This populates the main description field
          
          setServerError(null);
          setCurrentView('formDetails');
        } catch (err: any) {
          console.error('Voice processing error for request:', err);
          setServerError(`Voice input failed: ${err.message}`);
        } finally {
          setIsTranscribing(false);
          setIsProcessingDetails(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error accessing microphone for request:', err);
      setServerError('Microphone access denied or error. Please enable microphone permissions.');
      setIsRecording(false);
    }
  };

  const onSubmit = async (data: RequestFormInputs) => {
    setServerError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      if (!data.notes || !data.pickup_date || !data.pickup_start_time || !data.pickup_end_time || !data.itemName) {
          setServerError('Please fill in item name, description/notes, date, start time, and end time.');
          return;
      }
      
      const formattedPickupDate = data.pickup_date ? format(data.pickup_date, "yyyy-MM-dd") : null;
      if (!formattedPickupDate) {
        setServerError('Pickup date is invalid.');
        return;
      }

      const payload = {
        user_id: user.id,
        item_name: data.itemName,
        quantity: data.quantity,
        description: data.notes,
        people_count: data.people_count,
        pickup_date: formattedPickupDate,
        pickup_start_time: data.pickup_start_time,
        pickup_end_time: data.pickup_end_time,
        status: 'active',
        is_recurring: data.is_recurring,
        pickup_instructions: data.pickup_instructions,
      };

      const { data: newRequest, error: insertError } = await supabase
        .from('requests')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        logger.error('Supabase insert error for request:', { error: insertError, requestPayload: payload });
        throw insertError;
      }

      if (newRequest) {
        router.push('/request/success');
      } else {
        setServerError('Failed to create request, but no error was reported from insert.');
        logger.warn('Request creation attempt returned no newRequest and no insertError.', { payload });
      }

    } catch (err: any) {
      let displayedMessage = 'An error occurred while creating the request.';
      if (err && err.message) {
        displayedMessage = err.message;
        // Append details and hint if they exist (common in Supabase errors)
        if (typeof err.details === 'string' && err.details) displayedMessage += ` --- Details: ${err.details}`;
        if (typeof err.hint === 'string' && err.hint) displayedMessage += ` --- Hint: ${err.hint}`;
      }
      logger.error('Error in onSubmit for request:', { error: err, formData: data });
      setServerError(displayedMessage);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {currentView === 'voiceInput' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Describe Your Request</h1>
            <p className="text-secondary mb-8 max-w-md">
              Tell us what you need. Include the item name, quantity, and any important notes or reasons for your request.
              For example: "I need 5 kg of rice for my family" or "Requesting 10 blankets, winter is coming".
            </p>
            <Button 
              type="button" 
              onClick={handleRequestVoiceInput} 
              disabled={!isRecording && (isTranscribing || isProcessingDetails)}
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
            <Button variant="ghost" onClick={() => router.push('/request')} className="mt-12 text-secondary hover:text-primary">
                Or, go back to requests dashboard
            </Button>
          </div>
        )}

        {currentView === 'formDetails' && (
          <div className="rounded-lg bg-base p-6 md:p-8 shadow">
            <div className="mb-6 flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => { setCurrentView('voiceInput'); reset(); }} 
                className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
                aria-label="Go back to voice input"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-titleMd font-display text-primary">
                Confirm & Add Details to Request
              </h1>
            </div>

            {serverError && !errors && (
              <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="itemName" className="block text-label font-medium text-primary mb-1">
                  Requested Item Name
                </Label>
                <Input
                  id="itemName"
                  {...register('itemName', { required: "Item name is required" })}
                  placeholder="e.g., Rice, Blankets"
                  error={!!errors.itemName}
                />
                {errors.itemName && <p className="mt-1 text-sm text-negative">{errors.itemName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="block text-label font-medium text-primary mb-1">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    {...register('quantity', { required: "Quantity is required", valueAsNumber: true, min: { value: 1, message: "Minimum 1"} })}
                    error={!!errors.quantity}
                  />
                  {errors.quantity && <p className="mt-1 text-sm text-negative">{errors.quantity.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="block text-label font-medium text-primary mb-1">
                  Notes / Description of Need
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes', { required: "Description is required" })}
                  rows={4}
                  placeholder="Please describe the item needed, dietary restrictions, urgency, etc."
                  error={!!errors.notes}
                />
                {errors.notes && <p className="mt-1 text-sm text-negative">{errors.notes.message}</p>}
              </div>

              <div>
                <Label htmlFor="people_count" className="block text-label font-medium text-primary mb-1">
                  Number of People to Feed (if applicable)
                </Label>
                <Input
                  id="people_count"
                  type="number"
                  min="1"
                  {...register('people_count', { valueAsNumber: true, min: { value: 1, message: "Minimum 1"} })}
                  error={!!errors.people_count}
                />
                 {errors.people_count && <p className="mt-1 text-sm text-negative">{errors.people_count.message}</p>}
              </div>

              <div>
                <Label htmlFor="pickup_date_button" className="block text-label font-medium text-primary mb-1">
                  Preferred Pickup/Delivery Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="pickup_date_button"
                      variant={"secondary"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-primary-25 hover:bg-primary-5 focus:ring-1 focus:ring-primary bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400",
                        !pickupDateValue && "text-primary-50"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary-75" />
                      {pickupDateValue ? format(pickupDateValue, "PPP") : <span className="text-primary-75">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-base border-primary-25" align="start">
                    <Calendar
                      mode="single"
                      selected={pickupDateValue}
                      onSelect={(date) => setValue('pickup_date', date, { shouldValidate: true })}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                  </PopoverContent>
                </Popover>
                {errors.pickup_date && <p className="mt-1 text-sm text-negative">{errors.pickup_date.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="pickup_start_time" className="block text-label font-medium text-primary mb-1">
                    Start Time
                    </Label>
                    <Input
                    id="pickup_start_time"
                    type="time"
                    {...register('pickup_start_time', { required: "Start time is required" })}
                    className="border-primary-25 hover:bg-primary-5 focus:ring-1 focus:ring-primary bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400"
                    error={!!errors.pickup_start_time}
                    disabled={isSubmitting}
                    />
                    {errors.pickup_start_time && <p className="mt-1 text-sm text-negative">{errors.pickup_start_time.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pickup_end_time" className="block text-label font-medium text-primary mb-1">
                    End Time
                    </Label>
                    <Input
                    id="pickup_end_time"
                    type="time"
                    {...register('pickup_end_time', { required: "End time is required" })}
                    className="border-primary-25 hover:bg-primary-5 focus:ring-1 focus:ring-primary bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400"
                    error={!!errors.pickup_end_time}
                    disabled={isSubmitting}
                    />
                    {errors.pickup_end_time && <p className="mt-1 text-sm text-negative">{errors.pickup_end_time.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="pickup_instructions" className="block text-label font-medium text-primary mb-1">
                  Pickup Instructions (Optional)
                </Label>
                <Textarea
                  id="pickup_instructions"
                  {...register('pickup_instructions')}
                  rows={3}
                  placeholder="e.g., Please ring the bell, items are fragile, etc."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  {...register('is_recurring')}
                  className="h-4 w-4 rounded border-primary-30 text-primary focus:ring-primary-50"
                  disabled={isSubmitting}
                />
                <Label htmlFor="is_recurring" className="text-sm font-medium text-primary">
                  Weekly recurring request.
                </Label>
              </div>

              <div className="flex justify-between items-center pt-4">
                 <Button type="button" variant="secondary" onClick={() => { setCurrentView('voiceInput'); reset(); }} disabled={isSubmitting}>Start Over with Voice</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 