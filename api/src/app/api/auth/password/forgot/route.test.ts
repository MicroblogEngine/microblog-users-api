import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/helpers/prisma';
import sendMail from '@/services/mail_service';
import { generateToken } from '@/helpers/token';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/helpers/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn()
    }
  }
}));
vi.mock('@/services/mail');
vi.mock('@/helpers/token');

describe('Forgot Password API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    // Mock generateToken to return a predictable value
    vi.mocked(generateToken).mockReturnValue('12345678');
  });

  it('should successfully send reset password email', async () => {
    // Arrange
    const mockEmail = 'test@example.com';
    const mockUser = {
      id: '1',
      email: mockEmail,
      name: 'Test User',
      username: 'testuser',
      salt: 'mocksalt',
      hash: 'mockhash',
      emailVerified: new Date(),
      roleId: 'role1'
    };
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: mockEmail })
    });

    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(200);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: mockEmail }
    });
    expect(generateToken).toHaveBeenCalledWith(8);
    expect(sendMail).toHaveBeenCalledWith(
      mockEmail,
      'Reset your password',
      {
        title: 'Reset your password',
        message: 'Click link below to reset your password',
        url: `http://localhost:3000/auth/password/reset?token=12345678&email=${mockEmail}`
      },
      '/app/templates/forgot-password.html'
    );
  });

  it('should return 400 for invalid email format', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' })
    });

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty('errors');
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should return 404 when user not found', async () => {
    // Arrange
    const mockEmail = 'nonexistent@example.com';
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: mockEmail })
    });

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(responseBody).toEqual({
      errors: { user: ['User not found'] }
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should handle missing email in request body', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({})
    });

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty('errors');
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON in request body', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/password/forgot', {
      method: 'POST',
      body: 'invalid json'
    });

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
}); 