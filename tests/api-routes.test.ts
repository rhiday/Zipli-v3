import { NextRequest } from 'next/server';
import { GET as validateTokenHandler } from '@/app/api/auth/validate-token/route';
import { GET as qrTokenHandler } from '@/app/api/auth/qr-token/route';
import { POST as processItemHandler } from '@/app/api/process-item-details/route';
import { POST as transcribeAudioHandler } from '@/app/api/transcribe-audio/route';

// Mock the tokens module
jest.mock('@/lib/tokens', () => ({
  tokens: {
    'valid-token': {
      user_email: 'test@example.com',
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      used: false,
      created_at: new Date().toISOString(),
    },
    'used-token': {
      user_email: 'test@example.com',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used: true,
      created_at: new Date().toISOString(),
    },
    'expired-token': {
      user_email: 'test@example.com',
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      used: false,
      created_at: new Date().toISOString(),
    },
  },
  saveTokens: jest.fn(),
}));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  items: [
                    { name: 'Apples', quantity: '5 kg', allergens: [] }
                  ]
                })
              }
            }]
          })
        }
      },
      audio: {
        transcriptions: {
          create: jest.fn().mockResolvedValue({
            text: 'I have 5 kilograms of apples to donate'
          })
        }
      }
    })),
    APIError: class extends Error {
      constructor(message: string, public status?: number, public type?: string) {
        super(message);
      }
    }
  };
});

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  describe('/api/auth/validate-token', () => {
    it('validates a valid token successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=valid-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.user_email).toBe('test@example.com');
    });

    it('rejects invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=invalid-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.valid).toBe(false);
      expect(data.message).toBe('Invalid token');
    });

    it('rejects used token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=used-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.valid).toBe(false);
      expect(data.message).toBe('Token has already been used');
    });

    it('rejects expired token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=expired-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.valid).toBe(false);
      expect(data.message).toBe('Token has expired');
    });

    it('requires token parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.valid).toBe(false);
      expect(data.message).toBe('Token is required');
    });

    it('enforces rate limiting', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=valid-token', {
        headers: { 
          origin: 'http://localhost:3000',
          'x-forwarded-for': '192.168.1.1'
        },
      });

      // Make multiple requests to trigger rate limit
      const requests = Array(35).fill(null).map(() => validateTokenHandler(request));
      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('enforces CORS policy', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate-token?token=valid-token', {
        headers: { origin: 'http://malicious-site.com' },
      });

      const response = await validateTokenHandler(request);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('null');
    });
  });

  describe('/api/auth/qr-token', () => {
    it('generates QR token successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/qr-token', {
        headers: { origin: 'http://localhost:3000' },
      });

      const response = await qrTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.appUrl).toBeDefined();
      expect(typeof data.token).toBe('string');
    });

    it('enforces rate limiting', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/qr-token', {
        headers: { 
          origin: 'http://localhost:3000',
          'x-forwarded-for': '192.168.1.2'
        },
      });

      // Make multiple requests to trigger rate limit
      const requests = Array(15).fill(null).map(() => qrTokenHandler(request));
      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('/api/process-item-details', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
    });

    it('processes transcript successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/process-item-details', {
        method: 'POST',
        body: JSON.stringify({ transcript: 'I have 5 kilograms of apples' }),
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.3'
        },
      });

      const response = await processItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('validates request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/process-item-details', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.3'
        },
      });

      const response = await processItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('requires OpenAI API key', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const request = new NextRequest('http://localhost:3000/api/process-item-details', {
        method: 'POST',
        body: JSON.stringify({ transcript: 'test' }),
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.3'
        },
      });

      const response = await processItemHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OpenAI API key not configured');
    });

    it('enforces rate limiting', async () => {
      const request = new NextRequest('http://localhost:3000/api/process-item-details', {
        method: 'POST',
        body: JSON.stringify({ transcript: 'test transcript' }),
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.4'
        },
      });

      // Make multiple requests to trigger rate limit
      const requests = Array(25).fill(null).map(() => processItemHandler(request));
      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('sanitizes input', async () => {
      const request = new NextRequest('http://localhost:3000/api/process-item-details', {
        method: 'POST',
        body: JSON.stringify({ transcript: '<script>alert("xss")</script>I have apples' }),
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.3'
        },
      });

      const response = await processItemHandler(request);
      
      expect(response.status).toBe(200);
      // The input should be sanitized before being sent to OpenAI
    });
  });

  describe('/api/transcribe-audio', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
    });

    it('validates file upload', async () => {
      const request = new NextRequest('http://localhost:3000/api/transcribe-audio', {
        method: 'POST',
        body: new FormData(), // Empty form data
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });

      const response = await transcribeAudioHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No audio file uploaded or file is empty');
    });

    it('enforces file size limits', async () => {
      const formData = new FormData();
      const largeFile = new File(['x'.repeat(26 * 1024 * 1024)], 'large.mp3', {
        type: 'audio/mpeg',
      });
      formData.append('audio', largeFile);

      const request = new NextRequest('http://localhost:3000/api/transcribe-audio', {
        method: 'POST',
        body: formData,
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });

      const response = await transcribeAudioHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Audio file too large. Maximum size is 25MB.');
    });

    it('validates file types', async () => {
      const formData = new FormData();
      const invalidFile = new File(['data'], 'test.txt', {
        type: 'text/plain',
      });
      formData.append('audio', invalidFile);

      const request = new NextRequest('http://localhost:3000/api/transcribe-audio', {
        method: 'POST',
        body: formData,
        headers: { 'x-forwarded-for': '192.168.1.5' },
      });

      const response = await transcribeAudioHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid file type. Please upload an audio file (MP3, MP4, WAV, WebM, or OGG).');
    });

    it('enforces rate limiting', async () => {
      const formData = new FormData();
      const audioFile = new File(['audio data'], 'test.mp3', {
        type: 'audio/mpeg',
      });
      formData.append('audio', audioFile);

      const request = new NextRequest('http://localhost:3000/api/transcribe-audio', {
        method: 'POST',
        body: formData,
        headers: { 'x-forwarded-for': '192.168.1.6' },
      });

      // Make multiple requests to trigger rate limit
      const requests = Array(15).fill(null).map(() => transcribeAudioHandler(request));
      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});