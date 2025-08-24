import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../../lib/logger';
import {
  validateRequestBody,
  checkRateLimit,
  getClientIP,
  sanitizeString,
} from '@/lib/validation';
import { z } from 'zod';

const FOOD_TYPE_OPTIONS = [
  'Prepared meals',
  'Fresh produce',
  'Cold packaged foods',
  'Bakery and Pastry',
  'Other',
];

// Validation schema for request body
const processItemSchema = z.object({
  transcript: z
    .string()
    .min(1, 'Transcript is required')
    .max(5000, 'Transcript is too long'),
});

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(`process-item-${clientIP}`, 20, 60000); // 20 requests per minute

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Validate request body
    const validation = validateRequestBody(processItemSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { transcript } = validation.data;

    // Sanitize input
    const sanitizedTranscript = sanitizeString(transcript);

    // AI features have been disabled for YC demo
    // Return a mock response for now
    logger.info(
      'AI processing disabled - returning mock response for transcript:',
      sanitizedTranscript.substring(0, 50)
    );

    const mockResponse = {
      items: [
        {
          name: 'Food Item',
          quantity: '1 kg',
          allergens: [],
        },
      ],
    };

    return NextResponse.json(mockResponse);
  } catch (error: any) {
    console.error('Error processing item details:', error);
    return NextResponse.json(
      { error: 'Failed to process item details', details: error.message },
      { status: 500 }
    );
  }
}
