'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ChevronLeft, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    people_count: 1,
    pickup_date: undefined as Date | undefined,
    pickup_start_time: '09:00',
    pickup_end_time: '10:00',
    is_recurring: false,
    pickup_instructions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'people_count' ? parseInt(value, 10) || 1 : value
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, pickup_date: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      if (!formData.description || !formData.pickup_date || !formData.pickup_start_time || !formData.pickup_end_time) {
          setError('Please fill in description, date, start time, and end time.');
          setLoading(false);
          return;
      }
      
      const formattedPickupDate = formData.pickup_date ? format(formData.pickup_date, "yyyy-MM-dd") : null;
      if (!formattedPickupDate) {
        setError('Pickup date is invalid.');
        setLoading(false);
        return;
      }

      const { data: newRequest, error: insertError } = await supabase
        .from('requests')
        .insert([
          {
            user_id: user.id,
            description: formData.description,
            people_count: formData.people_count,
            pickup_date: formattedPickupDate,
            pickup_start_time: formData.pickup_start_time,
            pickup_end_time: formData.pickup_end_time,
            status: 'active',
            is_recurring: formData.is_recurring,
            pickup_instructions: formData.pickup_instructions,
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (newRequest) {
        router.push('/request/success');
      } else {
        setError('Failed to create request, but no error was reported.');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-base p-6 md:p-8 shadow">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-titleMd font-display text-primary">
            Create Food Request
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description" className="block text-label font-medium text-primary mb-1">
              Description of Need
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Please describe the type of food needed, dietary restrictions, etc."
            />
          </div>

          <div>
            <Label htmlFor="people_count" className="block text-label font-medium text-primary mb-1">
              Number of People to Feed
            </Label>
            <Input
              id="people_count"
              name="people_count"
              type="number"
              min="1"
              required
              value={formData.people_count}
              onChange={handleChange}
            />
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
                    !formData.pickup_date && "text-primary-50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary-75" />
                  {formData.pickup_date ? format(formData.pickup_date, "PPP") : <span className="text-primary-75">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-base border-primary-25" align="start">
                <Calendar
                  mode="single"
                  selected={formData.pickup_date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="pickup_start_time" className="block text-label font-medium text-primary mb-1">
              Preferred Pickup/Delivery Start Time
            </Label>
            <Input
              id="pickup_start_time"
              name="pickup_start_time"
              type="time"
              required
              value={formData.pickup_start_time}
              onChange={handleChange}
              className="border-primary-25 hover:bg-primary-5 focus:ring-1 focus:ring-primary bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="pickup_end_time" className="block text-label font-medium text-primary mb-1">
              Preferred Pickup/Delivery End Time
            </Label>
            <Input
              id="pickup_end_time"
              name="pickup_end_time"
              type="time"
              required
              value={formData.pickup_end_time}
              onChange={handleChange}
              className="border-primary-25 hover:bg-primary-5 focus:ring-1 focus:ring-primary bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="pickup_instructions" className="block text-label font-medium text-primary mb-1">
              Pickup Instructions (Optional)
            </Label>
            <Textarea
              id="pickup_instructions"
              name="pickup_instructions"
              value={formData.pickup_instructions}
              onChange={handleChange}
              rows={3}
              placeholder="e.g., Please ring the bell, items are fragile, etc."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_recurring"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleChange}
              className="h-4 w-4 rounded border-primary-30 text-primary focus:ring-primary-50"
            />
            <Label htmlFor="is_recurring" className="text-sm font-medium text-primary">
              Weekly recurring request.
            </Label>
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
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 