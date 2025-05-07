'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Define ProfileRow using the Database type
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileRow>>({
    full_name: '',
    organization_name: '',
    address: '',
    contact_number: '',
    role: undefined,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<ProfileRow>();

      if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          organization_name: profileData.organization_name || '',
          address: profileData.address || '',
          contact_number: profileData.contact_number || '',
          role: profileData.role,
        });
      } else {
        setError("Profile not found for the current user.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' && value === '' ? undefined : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!profile?.id) {
      setError('User ID not found.');
      setSaving(false);
      return;
    }

    try {
      const updateData: Partial<ProfileRow> = {}; 
      const validRoles: Array<Database['public']['Enums']['user_role']> = ['food_donor', 'food_receiver', 'city', 'terminals'];

      // For string | null fields in DB (full_name, address, contact_number)
      if (formData.full_name !== profile.full_name) {
        updateData.full_name = formData.full_name || null;
      }
      if (formData.address !== profile.address) {
        updateData.address = formData.address || null;
      }
      if (formData.contact_number !== profile.contact_number) {
        updateData.contact_number = formData.contact_number || null;
      }

      // For organization_name (string in Row, string? in Update)
      // Send the string if it has a value, otherwise send undefined if it's optional in Update type.
      // Since ProfileRow.organization_name is string, it should always have a value from formData if changed.
      // If it was changed to an empty string, we still send empty string as it's not nullable in Row.
      if (formData.organization_name !== profile.organization_name) {
         updateData.organization_name = formData.organization_name; // formData.organization_name is string
      }
      
      if (formData.role && formData.role !== profile.role && validRoles.includes(formData.role as Database['public']['Enums']['user_role'])) {
        updateData.role = formData.role as Database['public']['Enums']['user_role'];
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      updateData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData as any) // Using 'as any' here to bypass strict type checking if mismatches persist from generated types vs. actual DB expectations for partial updates.
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await fetchProfile(); 
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Failed to log out: " + signOutError.message);
    } else {
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  const formatRole = (role?: ProfileRow['role']) => {
      switch (role) {
          case 'food_donor': return 'Food Donor (Restaurants, Catering, etc.)';
          case 'food_receiver': return 'Food Receiver (Charities, Kitchens, etc.)';
          case 'terminals': return 'Food Terminal (Processing Centers)';
          case 'city': return 'City Administration';
          default: return role || 'Not set';
      }
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-titleLg font-display text-primary">Profile</h1>

        {error && (
          <div className="mb-4 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-base shadow">
          <div className="p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-label font-medium text-primary mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-primary-10 text-primary-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-label font-medium text-primary mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-label font-medium text-primary mb-1">
                    Role
                  </label>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select your role...</option>
                    <option value="food_donor">Food Donor (Restaurants, Catering, etc.)</option>
                    <option value="food_receiver">Food Receiver (Charities, Kitchens, etc.)</option>
                    <option value="terminals">Food Terminal (Processing Centers)</option>
                    <option value="city">City Administration</option>
                  </Select>
                </div>

                <div>
                  <label htmlFor="organization_name" className="block text-label font-medium text-primary mb-1">
                    Organization Name (Optional)
                  </label>
                  <Input
                    type="text"
                    id="organization_name"
                    name="organization_name"
                    value={formData.organization_name || ''}
                    onChange={handleChange}
                    placeholder="Your company or organization name"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-label font-medium text-primary mb-1">
                    Address (Optional)
                  </label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    placeholder="Street address, City, Postal Code"
                  />
                </div>
                <div>
                  <label htmlFor="contact_number" className="block text-label font-medium text-primary mb-1">
                    Contact Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number || ''}
                    onChange={handleChange}
                    placeholder="+1 123-456-7890"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Email
                  </label>
                  <p className="text-bodyLg text-primary">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Full Name
                  </label>
                  <p className="text-bodyLg text-primary">{profile?.full_name || <span className="italic text-primary-50">Not set</span>}</p>
                </div>

                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Role
                  </label>
                  <p className="text-bodyLg text-primary">{formatRole(profile?.role)}</p>
                </div>

                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Organization Name
                  </label>
                  <p className="text-bodyLg text-primary">{profile?.organization_name || <span className="italic text-primary-50">Not set</span>}</p>
                </div>
                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Address
                  </label>
                  <p className="text-bodyLg text-primary">{profile?.address || <span className="italic text-primary-50">Not set</span>}</p>
                </div>
                <div>
                  <label className="block text-label font-medium text-primary-75 mb-1">
                    Contact Number
                  </label>
                  <p className="text-bodyLg text-primary">{profile?.contact_number || <span className="italic text-primary-50">Not set</span>}</p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Add Logout Button */}
            <div className="mt-8 border-t border-primary-10 pt-6">
              <Button
                variant="negative"
                size="md"
                onClick={handleLogout}
                className="w-full"
              >
                Log Out
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}