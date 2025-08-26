import { NextRequest } from 'next/server';
import { GET as validateTokenHandler } from '@/app/api/auth/validate-token/route';
import { GET as qrTokenHandler } from '@/app/api/auth/qr-token/route';
import { POST as processItemHandler } from '@/app/api/process-item-details/route';

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
}));

describe('API Routes', () => {
  describe('GET /api/auth/validate-token', () => {
    it('should return 401 for missing token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token'
      );
      const response = await validateTokenHandler(request);
      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=invalid'
      );
      const response = await validateTokenHandler(request);
      expect(response.status).toBe(401);
    });

    it('should return 200 for valid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/validate-token?token=valid-token'
      );
      const response = await validateTokenHandler(request);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/auth/qr-token', () => {
    it('should generate QR token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/qr-token?email=test@example.com'
      );
      const response = await qrTokenHandler(request);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/process-item-details', () => {
    it('should process item details', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/process-item-details',
        {
          method: 'POST',
          body: JSON.stringify({ prompt: 'test item' }),
          headers: { 'content-type': 'application/json' },
        }
      );
      const response = await processItemHandler(request);
      expect(response.status).toBe(200);
    });
  });
});
