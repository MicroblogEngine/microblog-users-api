import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/helpers/prisma';
import { generatePassword } from '@/helpers/password';
import { User } from '@prisma/client';
import { ResetPasswordForm } from '@ararog/microblog-types';
import { POST } from './route';

// Mock dependencies
vi.mock('@/helpers/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/helpers/password', () => ({
  generatePassword: vi.fn(),
}));

describe('Password Reset API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/password/reset', () => {
    const mockRequest = (body: ResetPasswordForm) => {
      return new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    };

    it('should return 400 for invalid payload', async () => {
      const req = mockRequest({ email: 'invalid-email', password: 'ssaa!', confirmPassword: '099!', token: '12345678' });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ 
        token: '12345678',
        email: 'test@example.com',
        password: 'newPassword123!',
        confirmPassword: 'newPassword123!'
      });
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.errors.user).toEqual(['User not found']);
    });

    it('should successfully reset password', async () => {
      const req = mockRequest({ 
        token: '12345678',
        email: 'test@example.com',
        password: 'newPassword123!',
        confirmPassword: 'newPassword123!'
      });
      
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: '1', email: 'test@example.com' } as User);
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({ expires: new Date(), userId: '1', token: '12345678' });
      vi.mocked(generatePassword).mockReturnValueOnce({ salt: 'new-salt', hash: 'new-hash' });
      vi.mocked(prisma.user.update).mockResolvedValueOnce({ id: '1' } as User);

      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { salt: 'new-salt', hash: 'new-hash' }
      });
    });
  });
}); 