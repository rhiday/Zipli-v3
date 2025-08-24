'use client';

import { z } from 'zod';
import {
  format,
  isValid,
  parseISO,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  isAfter,
  isBefore,
  isToday,
} from 'date-fns';

// Constants for validation
const MIN_FUTURE_MINUTES = 30; // Minimum 30 minutes in future for pickup
const MAX_FUTURE_DAYS = 365; // Maximum 1 year in future
const BUSINESS_HOURS_START = 8; // 8 AM
const BUSINESS_HOURS_END = 20; // 8 PM
const MIN_PICKUP_DURATION = 30; // 30 minutes minimum duration
const MAX_PICKUP_DURATION = 480; // 8 hours maximum duration

// Time format regex patterns
const TIME_PATTERN = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const DATE_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_ISO_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

// Custom date validation functions
const isValidDateString = (dateStr: string): boolean => {
  if (!DATE_ISO_PATTERN.test(dateStr)) return false;
  const date = parseISO(dateStr);
  return isValid(date);
};

const isValidTimeString = (timeStr: string): boolean => {
  if (!TIME_PATTERN.test(timeStr)) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const isValidDateTimeString = (dateTimeStr: string): boolean => {
  if (!DATETIME_ISO_PATTERN.test(dateTimeStr)) return false;
  const date = parseISO(dateTimeStr);
  return isValid(date);
};

const isFutureDate = (date: Date): boolean => {
  const now = new Date();
  return isAfter(date, now);
};

const isWithinValidRange = (date: Date): boolean => {
  const now = new Date();
  const maxFuture = addDays(now, MAX_FUTURE_DAYS);
  return isAfter(date, now) && isBefore(date, maxFuture);
};

const isBusinessHours = (timeStr: string): boolean => {
  const [hours] = timeStr.split(':').map(Number);
  return hours >= BUSINESS_HOURS_START && hours <= BUSINESS_HOURS_END;
};

const isValidPickupWindow = (startTime: string, endTime: string): boolean => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const durationMinutes = endTotalMinutes - startTotalMinutes;

  return (
    durationMinutes >= MIN_PICKUP_DURATION &&
    durationMinutes <= MAX_PICKUP_DURATION
  );
};

// Zod schemas with custom validation
export const dateStringSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(isValidDateString, 'Invalid date format. Use YYYY-MM-DD')
  .transform((val) => parseISO(val))
  .refine(isValid, 'Invalid date')
  .refine(isFutureDate, 'Date must be in the future')
  .refine(isWithinValidRange, `Date must be within ${MAX_FUTURE_DAYS} days`);

export const pickupDateSchema = z
  .string()
  .min(1, 'Pickup date is required')
  .refine(isValidDateString, 'Invalid pickup date format. Use YYYY-MM-DD')
  .transform((val) => parseISO(val))
  .refine(isValid, 'Invalid pickup date')
  .refine((date) => {
    const minTime = new Date(Date.now() + MIN_FUTURE_MINUTES * 60 * 1000);
    return isAfter(date, minTime) || isToday(date);
  }, `Pickup must be at least ${MIN_FUTURE_MINUTES} minutes in the future`)
  .refine(
    isWithinValidRange,
    `Pickup date must be within ${MAX_FUTURE_DAYS} days`
  );

export const timeStringSchema = z
  .string()
  .min(1, 'Time is required')
  .refine(isValidTimeString, 'Invalid time format. Use HH:MM (24-hour format)')
  .refine(
    isBusinessHours,
    `Time must be between ${BUSINESS_HOURS_START}:00 and ${BUSINESS_HOURS_END}:00`
  );

export const pickupTimeSchema = z
  .string()
  .min(1, 'Pickup time is required')
  .refine(
    isValidTimeString,
    'Invalid pickup time format. Use HH:MM (24-hour format)'
  )
  .refine(
    isBusinessHours,
    `Pickup time must be between ${BUSINESS_HOURS_START}:00 and ${BUSINESS_HOURS_END}:00`
  );

export const dateTimeStringSchema = z
  .string()
  .min(1, 'Date and time is required')
  .refine(isValidDateTimeString, 'Invalid date-time format. Use ISO 8601')
  .transform((val) => parseISO(val))
  .refine(isValid, 'Invalid date and time')
  .refine(isFutureDate, 'Date and time must be in the future')
  .refine(isWithinValidRange, `Date must be within ${MAX_FUTURE_DAYS} days`);

export const timeSlotSchema = z
  .object({
    date: pickupDateSchema,
    startTime: pickupTimeSchema,
    endTime: pickupTimeSchema,
  })
  .refine(
    (data) => {
      const { startTime, endTime } = data;
      return isValidPickupWindow(startTime, endTime);
    },
    {
      message: `Pickup window must be between ${MIN_PICKUP_DURATION} minutes and ${MAX_PICKUP_DURATION} minutes`,
      path: ['endTime'],
    }
  );

export const recurringScheduleSchema = z
  .object({
    startDate: pickupDateSchema,
    endDate: pickupDateSchema.optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z
      .number()
      .min(1, 'Interval must be at least 1')
      .max(30, 'Interval is too large'),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    startTime: pickupTimeSchema,
    endTime: pickupTimeSchema,
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return isAfter(data.endDate, data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const { startTime, endTime } = data;
      return isValidPickupWindow(startTime, endTime);
    },
    {
      message: `Pickup window must be between ${MIN_PICKUP_DURATION} minutes and ${MAX_PICKUP_DURATION} minutes`,
      path: ['endTime'],
    }
  );

// Sanitization functions
export function sanitizeDateString(dateStr: string): string {
  // Remove any non-date characters and normalize format
  const cleaned = dateStr.replace(/[^0-9-]/g, '');

  // Validate basic format
  if (!DATE_ISO_PATTERN.test(cleaned)) {
    throw new Error('Invalid date format after sanitization');
  }

  return cleaned;
}

export function sanitizeTimeString(timeStr: string): string {
  // Remove any non-time characters and normalize format
  const cleaned = timeStr.replace(/[^0-9:]/g, '');

  // Validate basic format
  if (!TIME_PATTERN.test(cleaned)) {
    throw new Error('Invalid time format after sanitization');
  }

  return cleaned;
}

export function sanitizeDateTimeString(dateTimeStr: string): string {
  // Remove dangerous characters but preserve ISO format
  const cleaned = dateTimeStr.replace(/[^0-9T:.-Z]/g, '');

  // Validate basic format
  if (!DATETIME_ISO_PATTERN.test(cleaned)) {
    throw new Error('Invalid datetime format after sanitization');
  }

  return cleaned;
}

// Utility functions for date/time validation
export function validatePickupDateTime(
  date: Date,
  startTime: string,
  endTime: string
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if date is valid
  if (!isValid(date)) {
    errors.push('Invalid date provided');
  } else {
    // Check if date is in future (or today for same-day pickup)
    const now = new Date();
    const minTime = new Date(Date.now() + MIN_FUTURE_MINUTES * 60 * 1000);

    if (!isToday(date) && !isAfter(date, minTime)) {
      errors.push(
        `Pickup must be at least ${MIN_FUTURE_MINUTES} minutes in the future`
      );
    }

    // Check if date is within valid range
    if (!isWithinValidRange(date)) {
      errors.push(`Pickup date must be within ${MAX_FUTURE_DAYS} days`);
    }
  }

  // Check times
  if (!isValidTimeString(startTime)) {
    errors.push('Invalid start time format');
  } else if (!isBusinessHours(startTime)) {
    errors.push(
      `Start time must be between ${BUSINESS_HOURS_START}:00 and ${BUSINESS_HOURS_END}:00`
    );
  }

  if (!isValidTimeString(endTime)) {
    errors.push('Invalid end time format');
  } else if (!isBusinessHours(endTime)) {
    errors.push(
      `End time must be between ${BUSINESS_HOURS_START}:00 and ${BUSINESS_HOURS_END}:00`
    );
  }

  // Check time window duration
  if (isValidTimeString(startTime) && isValidTimeString(endTime)) {
    if (!isValidPickupWindow(startTime, endTime)) {
      errors.push(
        `Pickup window must be between ${MIN_PICKUP_DURATION} minutes and ${MAX_PICKUP_DURATION} minutes`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function normalizeDateTime(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const normalized = new Date(date);
  normalized.setHours(hours, minutes, 0, 0);
  return normalized;
}

export function formatDateTimeForUser(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatTimeSlotForUser(
  startTime: string,
  endTime: string
): string {
  return `${startTime} - ${endTime}`;
}

export function getNextValidPickupTime(): { date: string; time: string } {
  const now = new Date();
  const minTime = new Date(Date.now() + MIN_FUTURE_MINUTES * 60 * 1000);

  // Round up to next business hour if needed
  let nextHour = minTime.getHours();
  if (nextHour < BUSINESS_HOURS_START) {
    nextHour = BUSINESS_HOURS_START;
  } else if (nextHour >= BUSINESS_HOURS_END) {
    // Move to next day
    minTime.setDate(minTime.getDate() + 1);
    nextHour = BUSINESS_HOURS_START;
  } else {
    // Round up to next hour
    nextHour = Math.ceil(nextHour);
  }

  minTime.setHours(nextHour, 0, 0, 0);

  return {
    date: format(minTime, 'yyyy-MM-dd'),
    time: format(minTime, 'HH:mm'),
  };
}

// Type exports for TypeScript
export type DateTimeValidationResult = ReturnType<
  typeof validatePickupDateTime
>;
export type TimeSlotData = z.infer<typeof timeSlotSchema>;
export type RecurringScheduleData = z.infer<typeof recurringScheduleSchema>;
