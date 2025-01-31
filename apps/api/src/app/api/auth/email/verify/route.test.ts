import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';
import { prisma } from '@/helpers/prisma';

// Mock dependencies
vi.mock('@/helpers/prisma', () => ({
  prisma: {
    verificationToken: {
      findFirst: vi.fn()
    }
  }
}));

describe('Email Verification API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully verify valid token', async () => {
    // Arrange
    const mockPayload = {
      userId: '123',
      token: '12345678'
    };
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
      userId: '123',
      token: '12345678',
      expires: new Date(Date.now() + 3600000), // 1 hour from now
    });

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(200);
    expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        userId: mockPayload.userId,
        token: mockPayload.token
      }
    });
  });

  it('should return 400 for invalid payload', async () => {
    // Arrange
    const mockPayload = {
      userId: '123'
      // missing token field
    };
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty('errors');
  });

  it('should return 401 when token not found', async () => {
    // Arrange
    const mockPayload = {
      userId: '123',
      token: '12345678'
    };
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(responseBody).toEqual({
      errors: { token: ['Token not found'] }
    });
  });

  it('should return 401 when token is expired', async () => {
    // Arrange
    const mockPayload = {
      userId: '123',
      token: '12345678'
    };
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify(mockPayload)
    });

    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
      userId: '123',
      token: '12345678',
      expires: new Date(Date.now() - 3600000), // 1 hour ago
    });

    // Act
    const response = await POST(mockRequest);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(responseBody).toEqual({
      errors: { token: ['Token Expired'] }
    });
  });

  it('should handle invalid JSON in request body', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify', {
      method: 'POST',
      body: 'invalid json'
    });

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow();
  });
}); 