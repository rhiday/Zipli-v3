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
  SelectValue,
} from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import {
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  FileText,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { authService } from '@/lib/auth/authService';

export default function TerminalProfilePage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t } = useCommonTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Only allow terminal role users
    if (currentUser.role !== 'terminals') {
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
      driver_instructions: currentUser.driver_instructions || '',
    });

    setLoading(false);
  }, [isInitialized, currentUser, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear success message when editing
    if (success) setSuccess(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        full_name: formData.full_name,
        organization_name: formData.organization_name,
        address: formData.address,
        contact_number: formData.contact_number,
        driver_instructions: formData.driver_instructions,
      };

      const response = await authService.updateProfile(
        currentUser.id,
        updateData
      );

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data in store if needed
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      full_name: currentUser?.full_name || '',
      email: currentUser?.email || '',
      role: currentUser?.role || '',
      organization_name: currentUser?.organization_name || '',
      address: currentUser?.address || '',
      contact_number: currentUser?.contact_number || '',
      driver_instructions: currentUser?.driver_instructions || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <TerminalUIShell
        title="Profile Settings"
        subtitle="Manage your terminal account settings"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </TerminalUIShell>
    );
  }

  const userInitials = currentUser
    ? getInitials(currentUser.full_name || currentUser.email)
    : 'U';

  return (
    <TerminalUIShell
      title="Profile Settings"
      subtitle="Manage your terminal account settings"
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/terminal/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar
                  size="xl"
                  initials={userInitials}
                  className="w-24 h-24 text-2xl"
                />
              </div>
              <CardTitle>{formData.full_name || 'Terminal User'}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 mt-2">
                <Building2 className="w-4 h-4 mr-1" />
                Terminal Operator
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-4">
                <LanguageSwitcher />
              </div>
              <p className="text-sm text-gray-600">
                {formData.organization_name || 'Terminal Operations'}
              </p>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your terminal account details and preferences
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange('full_name', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Organization Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Organization Name
                  </label>
                  <Input
                    value={formData.organization_name}
                    onChange={(e) =>
                      handleInputChange('organization_name', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Terminal Operations Center"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Number
                  </label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) =>
                      handleInputChange('contact_number', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="+358 XX XXX XXXX"
                  />
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Account Role
                  </label>
                  <Select value={formData.role} disabled>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terminals">
                        Terminal Operator
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Terminal facility address"
                  />
                </div>

                {/* Driver Instructions */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Special Instructions
                  </label>
                  <Textarea
                    value={formData.driver_instructions}
                    onChange={(e) =>
                      handleInputChange('driver_instructions', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Special handling instructions or notes for drivers..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TerminalUIShell>
  );
}
