'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import {
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  ArrowLeft,
  MapPin,
  HandHeart,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Tag from '@/components/ui/Tag';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

type RequestDetail = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
  is_recurring: boolean;
};

export default function RequestDetailPage({
  params,
}: {
  params: { id: string };
}): React.ReactElement {
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { currentUser, getRequestById, updateRequest, users, isInitialized } =
    useDatabase();

  useEffect(() => {
    if (isInitialized && params.id) {
      fetchRequest();
    }
  }, [isInitialized, params.id]);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestData = getRequestById(params.id);
      if (!requestData) {
        throw new Error('Request not found');
      }
      setRequest(requestData);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'fulfilled' | 'cancelled') => {
    if (!currentUser || !request) {
      setError('Cannot update status: User or Request data missing.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      updateRequest(params.id, { status: newStatus });
      await fetchRequest();
    } catch (err: any) {
      setError(err.message || 'Failed to update request status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || 'Unknown user';
  };

  const parseRequestInfo = (description: string) => {
    const parts = description.split(' | ');
    const mainPart = parts[0] || description; // "Request for 3 portions - Vegan"
    const addressPart =
      parts.find((p) => p.startsWith('Address:'))?.replace('Address: ', '') ||
      '';
    const instructionsPart =
      parts
        .find((p) => p.startsWith('Instructions:'))
        ?.replace('Instructions: ', '') || '';

    // Extract clean request name
    const requestName = mainPart.replace('Request for ', ''); // "3 portions - Vegan"
    const allergensPart = requestName.split(' - ').slice(1).join(', ') || ''; // {t('pages.requests.vegan')}
    const quantityPart = requestName.split(' - ')[0] || ''; // "3 portions"

    return {
      requestName,
      quantity: quantityPart,
      allergens: allergensPart,
      address: addressPart,
      instructions: instructionsPart,
    };
  };

  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-dvh bg-cream flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <XIcon className="mb-4 h-12 w-12 text-negative" />
        <h1 className="text-titleMd font-display text-primary">
          Request Not Found
        </h1>
        <p className="mt-2 text-body text-primary-75">
          {error || "This request may have been removed or doesn't exist."}
        </p>
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.back()}
          className="mt-6"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?.id === request.user_id;
  const canTakeAction = request.status === 'active';
  const requestInfo = parseRequestInfo(request.description);
  const requesterUser = users.find((u) => u.id === request.user_id);
  const requesterName =
    requesterUser?.full_name ||
    requesterUser?.organization_name ||
    'Anonymous_requester';

  const statusClass = (() => {
    switch (request.status) {
      case 'active':
        return 'bg-positive/10 text-positive';
      case 'fulfilled':
        return 'bg-stone text-primary-50';
      case 'cancelled':
        return 'bg-rose/10 text-negative';
      default:
        return 'bg-stone text-primary-50';
    }
  })();

  return (
    <div className="min-h-dvh pb-20">
      {/* Header with Image and Back Arrow */}
      <div className="relative h-60 w-full">
        <Button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 p-0 text-white backdrop-blur-sm"
          title="Default"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {/* Placeholder image for requests */}
        <div className="h-full w-full bg-lime/20 flex items-center justify-center">
          <HandHeart className="h-20 w-20 text-lime" />
        </div>
      </div>

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-gray-900">
            {requestInfo.requestName ||
              `Request for ${request.people_count} people`}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-gray-600">
            <UsersIcon className="h-5 w-5" />
            <span className="font-medium">
              For {request.people_count} people
            </span>
          </div>

          {/* Status badge */}
          <div className="mt-4">
            <span
              className={cn(
                'inline-block w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize',
                statusClass
              )}
            >
              {request.status}
            </span>
          </div>

          {/* Tags for allergens/dietary restrictions */}
          {requestInfo.allergens && (
            <div className="mt-4 flex flex-wrap gap-2">
              {requestInfo.allergens.split(',').map((allergen: string) => (
                <Tag key={allergen.trim()}>{allergen.trim()}</Tag>
              ))}
            </div>
          )}

          {/* Request description */}
          <p className="mt-4 text-gray-600 leading-relaxed">
            {requestInfo.instructions || 'No additional instructions provided.'}
          </p>

          {/* Date and time info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="h-5 w-5 flex-shrink-0" />
              <span>
                {new Date(
                  request.pickup_date + 'T00:00:00Z'
                ).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon className="h-5 w-5 flex-shrink-0" />
              <span>
                From {request.pickup_start_time} to {request.pickup_end_time}
              </span>
            </div>
          </div>

          {/* Address if available */}
          {requestInfo.address && (
            <div className="mt-4 flex items-start gap-3 text-gray-600">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{requestInfo.address}</span>
            </div>
          )}

          {/* Recurring indicator */}
          {request.is_recurring && (
            <div className="mt-4 text-gray-600">
              <span>🔄 Recurring request</span>
            </div>
          )}

          {/* Action buttons for owner */}
          {isOwner && canTakeAction && (
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="destructive-outline"
                size="cta"
                className="flex-1"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <XIcon className="h-5 w-5" />
                )}
                {t('cancel') || 'Cancel_request'}
              </Button>
              <Button
                variant="primary"
                size="cta"
                className="flex-1"
                onClick={() => handleStatusUpdate('fulfilled')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <CheckIcon className="h-5 w-5" />
                )}
                Mark as Fulfilled
              </Button>
            </div>
          )}

          {/* Contact button for non-owners */}
          {!isOwner && canTakeAction && (
            <div className="mt-6">
              <Button
                variant="primary"
                size="cta"
                className="w-full"
                onClick={() => {
                  const email = getUserEmail(request.user_id);
                  window.location.href = `mailto:${email}?subject=Re: Food Request - ${requestInfo.requestName}`;
                }}
              >
                {t('contactRequester') || 'ContactRequester'}
              </Button>
            </div>
          )}

          {/* Inactive request message */}
          {!canTakeAction && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">This request is no longer active.</p>
            </div>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* Requester Info Section */}
        <section className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <span className="text-lg font-semibold">
                {getInitials(requesterName)}
              </span>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{requesterName}</p>
              <p className="text-sm text-gray-500">
                Created {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
