'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ChevronLeft } from 'lucide-react';

export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    people_count: 1,
    pickup_date: '',
    pickup_time: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      if (!formData.description || !formData.pickup_date || !formData.pickup_time) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
      }

      const { error: insertError } = await supabase
        .from('requests')
        .insert([
          {
            user_id: user.id,
            description: formData.description,
            people_count: formData.people_count,
            pickup_date: formData.pickup_date,
            pickup_time: formData.pickup_time,
            status: 'active'
          }
        ]);

      if (insertError) throw insertError;

      router.push('/feed');
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
            <label htmlFor="description" className="block text-label font-medium text-primary mb-1">
              Description of Need
            </label>
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
            <label htmlFor="people_count" className="block text-label font-medium text-primary mb-1">
              Number of People to Feed
            </label>
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
            <label htmlFor="pickup_date" className="block text-label font-medium text-primary mb-1">
              Preferred Pickup/Delivery Date
            </label>
            <Input
              id="pickup_date"
              name="pickup_date"
              type="date"
              required
              value={formData.pickup_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label htmlFor="pickup_time" className="block text-label font-medium text-primary mb-1">
              Preferred Pickup/Delivery Time Window
            </label>
            <Input
              id="pickup_time"
              name="pickup_time"
              type="text"
              required
              value={formData.pickup_time}
              onChange={handleChange}
              placeholder="e.g., Morning, Afternoon, 2-4 PM, Anytime"
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
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 