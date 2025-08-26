'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useDatabase } from '@/store';
import { toast } from '@/hooks/use-toast';

export default function DonationStatusAdminPage() {
  const { donations, updateDonation, currentUser } = useDatabase();
  const [selectedDonation, setSelectedDonation] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');

  const userDonations = donations.filter((d) => d.donor_id === currentUser?.id);

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'claimed', label: 'Claimed (Ready for Pickup)' },
    { value: 'picked_up', label: 'Picked Up (Completed)' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedDonation || !newStatus) {
      toast({
        title: 'Error',
        description: 'Please select both donation and status',
        variant: 'error',
      });
      return;
    }

    try {
      const updates: any = { status: newStatus };

      // Add timestamps based on status
      if (newStatus === 'claimed') {
        updates.claimed_at = new Date().toISOString();
        updates.receiver_id = 'test-receiver-id'; // Mock receiver
        // Mock pickup slots
        updates.pickup_slots = JSON.stringify([
          {
            date: new Date().toISOString().split('T')[0],
            start_time: '10:00',
            end_time: '12:00',
          },
        ]);
        updates.instructions_for_driver = 'Ring doorbell, ask for John';
      } else if (newStatus === 'picked_up') {
        updates.picked_up_at = new Date().toISOString();
        if (!updates.claimed_at) {
          updates.claimed_at = new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ).toISOString(); // Yesterday
        }
      }

      await updateDonation(selectedDonation, updates);

      toast({
        title: 'Success',
        description: `Donation status updated to ${newStatus}`,
        variant: 'success',
      });

      // Reset selections
      setSelectedDonation('');
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update donation status',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-base p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            🔧 Donation Status Admin
          </h1>
          <p className="text-gray-600">
            Change donation status to test the pickup confirmation feature
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Donation
            </label>
            <Select
              value={selectedDonation}
              onValueChange={setSelectedDonation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a donation..." />
              </SelectTrigger>
              <SelectContent>
                {userDonations.map((donation) => {
                  const foodItem = donation.food_item;
                  return (
                    <SelectItem key={donation.id} value={donation.id}>
                      {foodItem?.name || 'Unknown'} - {donation.quantity}kg -
                      Current: {donation.status}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Choose new status..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStatusUpdate}
            className="w-full"
            disabled={!selectedDonation || !newStatus}
          >
            Update Donation Status
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">📋 Your Donations</h2>
          <div className="space-y-3">
            {userDonations.map((donation) => {
              const foodItem = donation.food_item;
              return (
                <div
                  key={donation.id}
                  className="bg-white p-4 rounded-lg border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{foodItem?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {donation.quantity}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          donation.status === 'available'
                            ? 'bg-blue-100 text-blue-800'
                            : donation.status === 'claimed'
                              ? 'bg-yellow-100 text-yellow-800'
                              : donation.status === 'picked_up'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {donation.status}
                      </span>
                      {donation.claimed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Claimed:{' '}
                          {new Date(donation.claimed_at).toLocaleDateString()}
                        </p>
                      )}
                      {donation.picked_up_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Picked up:{' '}
                          {new Date(donation.picked_up_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() =>
                        window.open(`/donate/manage/${donation.id}`, '_blank')
                      }
                    >
                      View Management Page →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">🧪 Testing Steps</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Select one of your donations above</li>
            <li>
              2. Change status to "Claimed" to see pickup info + confirm button
            </li>
            <li>3. Click "View Management Page" to see the new interface</li>
            <li>4. Test the "Confirm Pickup" button functionality</li>
            <li>5. Change to "Picked Up" to see completion status</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
