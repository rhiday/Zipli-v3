import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name is too long');
export const quantitySchema = z.string().min(1, 'Quantity is required').max(50, 'Quantity description is too long');
export const descriptionSchema = z.string().max(500, 'Description is too long');

// API request validation schemas
export const foodItemSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional(),
  quantity: quantitySchema,
  allergens: z.array(z.string()).optional(),
});

export const authTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const audioTranscriptionSchema = z.object({
  audio: z.string().min(1, 'Audio data is required'),
});

export const imageProcessingSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  quality: z.number().min(0.1).max(1).optional(),
});

// Request body validation utility
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: firstError?.message  || 'Validation_failed' 
      };
    }
    return { success: false, error: 'Invalid request format' };
  }
}

// Sanitization utilities
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Rate limiting storage (in-memory for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  limit: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // New window or expired
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remainingRequests: limit - 1, resetTime };
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remainingRequests: 0, resetTime: existing.resetTime };
  }
  
  existing.count++;
  rateLimitStore.set(key, existing);
  
  return { 
    allowed: true, 
    remainingRequests: limit - existing.count, 
    resetTime: existing.resetTime 
  };
}

// Get client IP for rate limiting
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}