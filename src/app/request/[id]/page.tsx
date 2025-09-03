'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useDatabase } from '@/store';
import { useRequestStore } from '@/store/request';
import {
  Scale,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  ArrowLeft,
  ArrowRight,
  MapPin,
  HandHeart,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type RequestDetail = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  instructions: string | null;
  allergens: string[] | null;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  start_date: string | null;
  end_date: string | null;
  address: string | null;
};

export default function RequestDetailPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);
  const [confirmClauseChecked, setConfirmClauseChecked] = useState(false);

  const { currentUser, getRequestById, updateRequest, users, isInitialized } =
    useDatabase();
  const { setEditMode, clearRequest, setRequestData, setPickupSlots } =
    useRequestStore();

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestData = getRequestById(id);
      if (!requestData) {
        throw new Error(t('requestNotFound'));
      }
      setRequest(requestData as any);
    } catch (err: any) {
      setError(err.message || t('loadingFailed'));
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && id) {
      fetchRequest();
    }
  }, [isInitialized, id]);

  const handleStatusUpdate = async (newStatus: 'fulfilled' | 'cancelled') => {
    if (!currentUser || !request) {
      setError('Cannot update status: User or Request data missing.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      updateRequest(id, { status: newStatus });
      await fetchRequest();

      // Redirect to /receiver/dashboard after successful cancellation
      if (newStatus === 'cancelled') {
        router.push('/receiver/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('updateFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = () => {
    setShowConfirmDelivery(true);
  };

  const confirmDeliveryWithClause = async () => {
    if (!confirmClauseChecked) return;

    setShowConfirmDelivery(false);
    setConfirmClauseChecked(false);
    await handleStatusUpdate('fulfilled');
    router.push('/receiver/dashboard');
  };

  const handleCancelRequest = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    await handleStatusUpdate('cancelled');
  };

  const handleEditRequest = () => {
    if (!request) return;

    // Clear current request store and set edit mode
    clearRequest();
    setEditMode(true, request.id);

    // Pre-populate form with existing data
    setRequestData({
      request_type: request.is_recurring ? 'recurring' : 'one-time',
      description: request.description,
      quantity: request.people_count,
      allergens: request.allergens || [],
      pickupDate: request.pickup_date,
      startTime: request.pickup_start_time,
      endTime: request.pickup_end_time,
    });

    // Set pickup slot for one-time requests
    if (!request.is_recurring) {
      setPickupSlots([
        {
          id: '1',
          date: new Date(request.pickup_date),
          startTime: request.pickup_start_time,
          endTime: request.pickup_end_time,
        },
      ]);
    }

    // Navigate to appropriate form
    if (request.is_recurring) {
      router.push('/request/recurring-form');
    } else {
      router.push('/request/one-time-form');
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || t('unknownUser');
  };

  const parseRequestInfo = (request: RequestDetail) => {
    // Use actual database fields instead of parsing description string
    return {
      requestName: request.description,
      quantity: `${request.people_count} people`,
      allergens: request.allergens || [],
      instructions: request.instructions || null,
    };
  };

  const parseRecurringSchedule = (recurrencePattern: string | null) => {
    if (!recurrencePattern) return null;

    try {
      const pattern = JSON.parse(recurrencePattern);
      if (pattern.schedules && Array.isArray(pattern.schedules)) {
        return pattern.schedules.map((schedule: any) => ({
          days: schedule.days || [],
          startTime: schedule.startTime || '09:00',
          endTime: schedule.endTime || '14:00',
        }));
      }
    } catch (error) {
      console.error('Error parsing recurrence pattern:', error);
    }
    return null;
  };

  // Helper to sort days in logical order
  const sortDaysLogically = (days: string[]) => {
    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days.sort((a, b) => {
      // Normalize to title case for comparison
      const dayA = a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
      const dayB = b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
      return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
    });
  };

  // Helper to translate English day names to Finnish
  const translateDayName = (englishDay: string) => {
    const dayTranslations: { [key: string]: string } = {
      monday: t('monday'),
      tuesday: t('tuesday'),
      wednesday: t('wednesday'),
      thursday: t('thursday'),
      friday: t('friday'),
      saturday: t('saturday'),
      sunday: t('sunday'),
    };

    const normalizedDay = englishDay.toLowerCase();
    const translatedDay = dayTranslations[normalizedDay] || englishDay;
    // Capitalize first letter for proper Finnish formatting
    return translatedDay.charAt(0).toUpperCase() + translatedDay.slice(1);
  };

  // Helper to group consecutive days
  const groupConsecutiveDays = (days: string[]) => {
    if (days.length === 0) return '';
    if (days.length === 1) return translateDayName(days[0]);

    const sortedDays = sortDaysLogically(days);

    // If all 7 days are selected, show "Every day"
    if (sortedDays.length === 7) {
      return t('everyDay') || 'Every day';
    }

    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const dayIndices = sortedDays.map((day) => dayOrder.indexOf(day));

    const groups: string[] = [];
    let start = 0;

    for (let i = 1; i <= dayIndices.length; i++) {
      if (i === dayIndices.length || dayIndices[i] !== dayIndices[i - 1] + 1) {
        if (i - start === 1) {
          groups.push(translateDayName(sortedDays[start]));
        } else if (i - start === 2) {
          groups.push(
            `${translateDayName(sortedDays[start])}, ${translateDayName(sortedDays[i - 1])}`
          );
        } else {
          groups.push(
            `${translateDayName(sortedDays[start])} - ${translateDayName(sortedDays[i - 1])}`
          );
        }
        start = i;
      }
    }

    return groups.join(', ');
  };

  // Consolidate schedules with same time slots
  const consolidateSchedules = (schedules: any[]) => {
    const timeSlotMap = new Map<string, Set<string>>();

    schedules.forEach((schedule) => {
      const timeKey = `${schedule.startTime}-${schedule.endTime}`;
      if (!timeSlotMap.has(timeKey)) {
        timeSlotMap.set(timeKey, new Set());
      }
      schedule.days.forEach((day: string) => {
        timeSlotMap.get(timeKey)?.add(day);
      });
    });

    return Array.from(timeSlotMap.entries()).map(([timeKey, daysSet]) => {
      const [startTime, endTime] = timeKey.split('-');
      return {
        days: Array.from(daysSet),
        startTime,
        endTime,
      };
    });
  };

  const formatRecurringSchedule = (schedules: any[]) => {
    const consolidated = consolidateSchedules(schedules);
    return consolidated.map((schedule) => {
      const daysDisplay = groupConsecutiveDays(schedule.days);
      return {
        days: daysDisplay,
        time: `${schedule.startTime} - ${schedule.endTime}`,
      };
    });
  };

  const { t } = useCommonTranslation();

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
  const requestInfo = parseRequestInfo(request);
  const requesterUser = users.find((u) => u.id === request.user_id);
  const requesterName =
    requesterUser?.full_name ||
    requesterUser?.organization_name ||
    t('anonymousRequester');

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
          title={t('back')}
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
            <Scale className="h-5 w-5" />
            <span className="font-medium">
              {t('quantity')}: {request.people_count} kg
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
              {t(request.status)}
            </span>
          </div>

          {/* Allergens/dietary restrictions as plain text */}
          {requestInfo.allergens && requestInfo.allergens.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Allergies, Intolerances & Diets:
              </p>
              <p className="text-gray-600 leading-relaxed">
                {requestInfo.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Request instructions */}
          {requestInfo.instructions &&
            requestInfo.instructions !== t('noAdditionalInstructions') && (
              <p className="mt-4 text-gray-600 leading-relaxed">
                {requestInfo.instructions}
              </p>
            )}

          {/* Date and time info */}
          <div className="mt-4 space-y-2">
            {request.is_recurring ? (
              <>
                {/* Request Period for recurring requests */}
                {request.start_date && request.end_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                    <span>
                      {t('requestPeriod')}:{' '}
                      {new Date(
                        request.start_date + 'T00:00:00Z'
                      ).toLocaleDateString('fi-FI', {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}{' '}
                      {t('requestPeriodFrom')}{' '}
                      {request.end_date ? (
                        <>
                          {t('requestPeriodTo')}{' '}
                          {new Date(
                            request.end_date + 'T00:00:00Z'
                          ).toLocaleDateString('fi-FI', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  </div>
                )}

                {/* Recurring Schedule Details */}
                {(() => {
                  const schedules = parseRecurringSchedule(
                    request.recurrence_pattern
                  );
                  if (schedules && schedules.length > 0) {
                    const formattedSchedules =
                      formatRecurringSchedule(schedules);
                    return (
                      <div className="space-y-1">
                        {formattedSchedules.map((schedule, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-gray-600"
                          >
                            <span className="text-lg mt-0">🔄</span>
                            <span>
                              {schedule.days}, {schedule.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <>
                {/* One-time request date and time */}
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                  <span>
                    {new Date(
                      request.pickup_date + 'T00:00:00Z'
                    ).toLocaleDateString('fi-FI', {
                      weekday: 'long',
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
                    {t('from')} {request.pickup_start_time} {t('until')}{' '}
                    {request.pickup_end_time}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action buttons for owner */}
          {isOwner && canTakeAction && (
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="primary"
                size="cta"
                className="w-full"
                onClick={handleConfirmDelivery}
                disabled={actionLoading}
              >
                <CheckIcon className="h-5 w-5" />
                {t('confirmDelivery')}
              </Button>
              <Button
                variant="destructive-outline"
                size="cta"
                className="w-full"
                onClick={handleCancelRequest}
                disabled={actionLoading}
              >
                <XIcon className="h-5 w-5" />
                {t('cancel')}
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
                {t('contactRequester')}
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
                {t('created')}{' '}
                {new Date(request.created_at).toLocaleDateString('fi-FI')}
              </p>
            </div>
          </div>
        </section>

        {/* See All Requests Button */}
        <section className="pt-6">
          <Button
            variant="secondary"
            size="cta"
            className="w-full"
            onClick={() => router.push('/requests')}
          >
            <ArrowRight className="h-5 w-5" />
            {t('seeAllRequests')}
          </Button>
        </section>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this request? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowCancelConfirm(false)}
              disabled={actionLoading}
            >
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                t('cancelRequest')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delivery Dialog */}
      <Dialog open={showConfirmDelivery} onOpenChange={setShowConfirmDelivery}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDelivery')}</DialogTitle>
            <DialogDescription>
              {t('confirmDeliveryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="confirm-clause"
                checked={confirmClauseChecked}
                onChange={(e) => setConfirmClauseChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="confirm-clause"
                className="text-sm text-gray-700 leading-relaxed"
              >
                {t('confirmDeliveryClause')}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirmDelivery(false);
                setConfirmClauseChecked(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDeliveryWithClause}
              disabled={!confirmClauseChecked || actionLoading}
            >
              {actionLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                t('confirmDelivery')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
