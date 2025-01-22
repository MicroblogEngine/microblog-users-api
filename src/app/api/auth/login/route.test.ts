import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { prisma } from '@/helpers/prisma';
import { validPassword } from '@/helpers/password';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/helpers/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn()
    }
  }
}));

vi.mock('@/helpers/password', () => ({
  validPassword: vi.fn()
}));

vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock.jwt.token')
  }))
}));

describe('Login API Route', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    hash: 'hashedpassword',
    salt: 'salt123',
    email: 'test@example.com',
    emailVerified: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = 'test-secret';
  });

  it('should successfully login with valid credentials', async () => {
    // Mock dependencies
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);
    vi.mocked(validPassword).mockReturnValue(true);

    // Create mock request
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'correctpassword'
      })
    });

    const response = await POST(request);
    const data = await response.json();
    data.user.emailVerified = new Date(data.user.emailVerified);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: mockUser,
      token: 'mock.jwt.token'
    });

    // Verify mocks were called correctly
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'testuser' }
    });
    expect(validPassword).toHaveBeenCalledWith('correctpassword', mockUser.hash, mockUser.salt);
  });

  it('should return 401 when user is not found', async () => {
    // Mock user not found
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'nonexistent',
        password: 'anypassword'
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(validPassword).not.toHaveBeenCalled();
  });

  it('should return 401 when password is invalid', async () => {
    // Mock user found but invalid password
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);
    vi.mocked(validPassword).mockReturnValue(false);

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'wrongpassword'
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(validPassword).toHaveBeenCalledWith('wrongpassword', mockUser.hash, mockUser.salt);
  });

  it('should return 401 when AUTH_SECRET is not set', async () => {
    // Remove AUTH_SECRET from environment
    process.env.AUTH_SECRET = undefined;

    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        password: 'anypassword'
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
}); 