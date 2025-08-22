/**
 * Request Types and Data Structures
 * Prepared for Supabase integration with proper relationships
 */

import { RecurrenceSchedule } from '@/components/ui/RecurrenceScheduler';

// Base request interface matching database schema
export interface BaseRequest {
  id?: string;
  user_id?: string;
  description: string; // Description of food needed
  quantity: number; // Number of people
  allergens: string[]; // Array of dietary restrictions
  status?: 'active' | 'fulfilled' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// One-time request - single occurrence
export interface OneTimeRequest extends BaseRequest {
  request_type: 'one-time';
  pickup_date?: string; // ISO date string - set in pickup slot step
  pickup_start_time?: string; // HH:mm format
  pickup_end_time?: string; // HH:mm format
}

// Recurring request - multiple occurrences
export interface RecurringRequest extends BaseRequest {
  request_type: 'recurring';
  recurrence: RecurrenceSchedule;
  pickup_start_time?: string; // HH:mm format - set in pickup slot step
  pickup_end_time?: string; // HH:mm format
}

// Union type for all requests
export type Request = OneTimeRequest | RecurringRequest;

// For database storage - flattened structure
export interface RequestDatabaseModel {
  id?: string;
  user_id: string;
  request_type: 'one-time' | 'recurring';
  description: string;
  quantity: number;
  allergens: string[]; // Will be stored as JSONB

  // One-time fields (null for recurring)
  pickup_date?: string | null;

  // Recurring fields (null for one-time)
  recurrence_type?: 'daily' | 'weekly' | 'custom' | null;
  recurrence_days?: number[] | null; // For weekly: [0,1,2,3,4,5,6]
  recurrence_dates?: string[] | null; // For custom: ['2024-01-01', '2024-01-15']
  start_date?: string | null;
  end_date?: string | null;

  // Common time fields (set in pickup slot step)
  pickup_start_time?: string | null;
  pickup_end_time?: string | null;

  status: 'active' | 'fulfilled' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// Helper functions to convert between formats
export const convertToDatabase = (request: Request): RequestDatabaseModel => {
  const base: RequestDatabaseModel = {
    user_id: request.user_id || '',
    request_type: request.request_type,
    description: request.description,
    quantity: request.quantity,
    allergens: request.allergens,
    pickup_start_time: '',
    pickup_end_time: '',
    status: request.status || 'active',
  };

  if (request.request_type === 'one-time') {
    return {
      ...base,
      pickup_date: request.pickup_date,
      pickup_start_time: request.pickup_start_time,
      pickup_end_time: request.pickup_end_time,
      // Null out recurring fields
      recurrence_type: null,
      recurrence_days: null,
      recurrence_dates: null,
      start_date: null,
      end_date: null,
    };
  } else {
    const recurring = request as RecurringRequest;
    return {
      ...base,
      pickup_date: null,
      pickup_start_time: recurring.pickup_start_time,
      pickup_end_time: recurring.pickup_end_time,
      // Recurring fields
      recurrence_type: recurring.recurrence.type,
      recurrence_days: recurring.recurrence.weeklyDays || null,
      recurrence_dates: recurring.recurrence.customDates || null,
      start_date: null, // Removed start/end dates
      end_date: null,
    };
  }
};

export const convertFromDatabase = (dbModel: RequestDatabaseModel): Request => {
  const base = {
    id: dbModel.id,
    user_id: dbModel.user_id,
    description: dbModel.description,
    quantity: dbModel.quantity,
    allergens: dbModel.allergens,
    status: dbModel.status,
    created_at: dbModel.created_at,
    updated_at: dbModel.updated_at,
  };

  if (dbModel.request_type === 'one-time') {
    return {
      ...base,
      request_type: 'one-time',
      pickup_date: dbModel.pickup_date!,
      pickup_start_time: dbModel.pickup_start_time,
      pickup_end_time: dbModel.pickup_end_time,
    } as OneTimeRequest;
  } else {
    return {
      ...base,
      request_type: 'recurring',
      recurrence: {
        type: dbModel.recurrence_type as 'daily' | 'weekly' | 'custom',
        weeklyDays: dbModel.recurrence_days || undefined,
        customDates: dbModel.recurrence_dates || undefined,
      },
      pickup_start_time: dbModel.pickup_start_time,
      pickup_end_time: dbModel.pickup_end_time,
    } as RecurringRequest;
  }
};

// For generating individual occurrences from recurring requests
export interface RequestOccurrence {
  request_id: string;
  date: string; // ISO date string
  pickup_start_time: string;
  pickup_end_time: string;
  description: string;
  quantity: number;
  allergens: string[];
  status: 'pending' | 'fulfilled' | 'missed';
}

// Helper to generate occurrences from a recurring request
export const generateOccurrences = (
  request: RecurringRequest,
  fromDate: Date,
  toDate: Date
): RequestOccurrence[] => {
  const occurrences: RequestOccurrence[] = [];
  const from = fromDate;
  const to = toDate;

  if (request.recurrence.type === 'daily') {
    // Generate daily occurrences
    const current = new Date(from);
    while (current <= to) {
      occurrences.push({
        request_id: request.id!,
        date: current.toISOString().split('T')[0],
        pickup_start_time: request.pickup_start_time || '09:00',
        pickup_end_time: request.pickup_end_time || '17:00',
        description: request.description,
        quantity: request.quantity,
        allergens: request.allergens,
        status: 'pending',
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (request.recurrence.type === 'weekly') {
    // Generate weekly occurrences
    const weeklyDays = request.recurrence.weeklyDays || [];
    const current = new Date(from);

    while (current <= to) {
      if (weeklyDays.includes(current.getDay())) {
        occurrences.push({
          request_id: request.id!,
          date: current.toISOString().split('T')[0],
          pickup_start_time: request.pickup_start_time || '09:00',
          pickup_end_time: request.pickup_end_time || '17:00',
          description: request.description,
          quantity: request.quantity,
          allergens: request.allergens,
          status: 'pending',
        });
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (request.recurrence.type === 'custom') {
    // Generate custom date occurrences
    const customDates = request.recurrence.customDates || [];
    customDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (date >= from && date <= to) {
        occurrences.push({
          request_id: request.id!,
          date: dateStr,
          pickup_start_time: request.pickup_start_time || '09:00',
          pickup_end_time: request.pickup_end_time || '17:00',
          description: request.description,
          quantity: request.quantity,
          allergens: request.allergens,
          status: 'pending',
        });
      }
    });
  }

  return occurrences.sort((a, b) => a.date.localeCompare(b.date));
};
