'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store/databaseStore';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';

export default function RequestSummaryPage() {
  const router = useRouter();
  const { requestData, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();

  const handleSubmitRequest = async () => {
    try {
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      // Create the request in the database
      const requestPayload = {
        user_id: currentUser.id,
        description: `Request for ${requestData.quantity} portions - ${requestData.allergens.join(', ')}`,
        people_count: parseInt(requestData.quantity) || 1,
        pickup_date: requestData.pickupDate,
        pickup_start_time: requestData.startTime,
        pickup_end_time: requestData.endTime,
        status: 'active' as const,
        is_recurring: requestData.recurringInterval !== '',
      };

      const response = await addRequest(requestPayload);

      if (response.error) {
        console.error('Error creating request:', response.error);
        return;
      }

      // Clear the store and navigate to success
      clearRequest();
      router.push('/request/success');
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-dvh bg-white">
      <div className="mx-auto max-w-lg bg-white w-full">
        <SecondaryNavbar 
          title="Request summary" 
          backHref="/request/pickup-slot" 
          onBackClick={handleBackClick}
        />

        {/* Progress Bar */}
        <div className="px-4 pt-2">
          <Progress value={100} className="h-2 w-full" />
        </div>

        <main className="flex-grow overflow-y-auto p-4 space-y-6">
          {/* Request Summary */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Recurring interval</span>
              <span className="text-sm font-medium text-gray-900">
                {requestData.recurringInterval || 'One-time'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Quantity</span>
              <span className="text-sm font-medium text-gray-900">
                {requestData.quantity} portions
              </span>
            </div>
            
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Allergies, intolerances & diets</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                {requestData.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">When do you need</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(requestData.pickupDate)}, {requestData.startTime}-{requestData.endTime}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Next steps</h3>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Request submitted</p>
                <p className="text-xs text-gray-600">Your request has been added to our system</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Matching in progress</p>
                <p className="text-xs text-gray-600">We're looking for donations that match your criteria</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Get notified</p>
                <p className="text-xs text-gray-600">You'll receive a notification when we find a match</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="px-4 pb-6 pt-4 bg-white">
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitRequest}
              className="w-full bg-green-400 hover:bg-green-500 text-black font-medium py-3 rounded-full"
            >
              Submit request
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}