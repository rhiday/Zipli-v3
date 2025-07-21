'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';

export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    organization_name: '',
    address: '',
    contact_number: '',
    driver_instructions: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setFormData({
      full_name: currentUser.full_name || '',
      email: currentUser.email || '',
      role: currentUser.role || '',
      organization_name: currentUser.organization_name || '',
      address: currentUser.address || '',
      contact_number: currentUser.contact_number || '',
      driver_instructions: (currentUser as any).driver_instructions || '',
    });
    setLoading(false);
  }, [currentUser, isInitialized, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // In a real app, you'd update the user in the database
    // For now, we'll just simulate saving
    setTimeout(() => {
      setIsEditing(false);
      setSaving(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    const { logout } = useDatabase.getState();
    logout();
    router.push('/auth/login');
    setIsLoggingOut(false);
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'food_donor': return 'Food Donor (Restaurants, Catering, etc.)';
      case 'food_receiver': return 'Food Receiver (Charities, Kitchens, etc.)';
      case 'terminals': return 'Food Terminal (Processing Centers)';
      case 'city': return 'City Administration';
      default: return role || 'Not set';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-primary">Profile</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-base shadow">
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-primary mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="organization_name" className="block text-sm font-medium text-primary mb-1">
                    Organization Name
                  </label>
                  <Input
                    type="text"
                    id="organization_name"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-primary mb-1">
                    Role
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange({ target: { name: 'role', value } } as React.ChangeEvent<HTMLSelectElement>)}
                  >
                    <SelectTrigger id="role" name="role">
                      <SelectValue placeholder="Select your role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food_donor">Food Donor (Restaurants, Catering, etc.)</SelectItem>
                      <SelectItem value="food_receiver">Food Receiver (Charities, Kitchens, etc.)</SelectItem>
                      <SelectItem value="terminals">Food Terminal (Processing Centers)</SelectItem>
                      <SelectItem value="city">City Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-primary mb-1">
                    Address
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your full address"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="contact_number" className="block text-sm font-medium text-primary mb-1">
                    Contact Number
                  </label>
                  <Input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="driver_instructions" className="block text-sm font-medium text-primary mb-1">
                    Default Driver Instructions
                  </label>
                  <Textarea
                    id="driver_instructions"
                    name="driver_instructions"
                    value={formData.driver_instructions}
                    onChange={handleChange}
                    placeholder="e.g. Please ring the doorbell, Leave at reception"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">These instructions will be pre-filled when making donations</p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Email</label>
                  <p className="text-gray-900">{formData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Full Name</label>
                  <p className="text-gray-900">{formData.full_name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Organization Name</label>
                  <p className="text-gray-900">{formData.organization_name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Role</label>
                  <p className="text-gray-900">{formatRole(formData.role)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Address</label>
                  <p className="text-gray-900">{formData.address || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Contact Number</label>
                  <p className="text-gray-900">{formData.contact_number || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Default Driver Instructions</label>
                  <p className="text-gray-900">{formData.driver_instructions || 'Not set'}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    Edit Profile
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}