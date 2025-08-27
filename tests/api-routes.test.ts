import { NextRequest } from 'next/server';
import { GET as validateTokenHandler } from '@/app/api/auth/validate-token/route';
import { GET as qrTokenHandler } from '@/app/api/auth/qr-token/route';

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

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/auth/validate-token', () => {
    it('validates a valid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=valid-token'
      );
      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.user_email).toBe('test@example.com');
    });

    it('rejects an invalid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=invalid-token'
      );
      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(false);
    });

    it('rejects a used token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=used-token'
      );
      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(false);
    });

    it('rejects an expired token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=expired-token'
      );
      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(false);
    });

    it('requires a token parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token'
      );
      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Token is required');
    });
  });

  describe('/api/auth/qr-token', () => {
    it('generates a QR token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/qr-token?email=test@example.com'
      );
      const response = await qrTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.qrUrl).toBeDefined();
      expect(data.expiresAt).toBeDefined();
    });

    it('requires an email parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/qr-token'
      );
      const response = await qrTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('validates email format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/qr-token?email=invalid-email'
      );
      const response = await qrTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Valid email is required');
    });
  });

  // OpenAI-dependent tests removed for production stability
});
