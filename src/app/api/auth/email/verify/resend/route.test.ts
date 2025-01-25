import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';
import sendMail from '@/services/mail';
import { generateToken } from '@/helpers/token';

// Mock dependencies
vi.mock('@/services/mail');
vi.mock('@/helpers/token');

describe('Email Verification Resend API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock generateToken to return a predictable value
    vi.mocked(generateToken).mockReturnValue('12345678');
  });

  it('should successfully send verification email', async () => {
    // Arrange
    const mockEmail = 'test@example.com';
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify/resend', {
      method: 'POST',
      body: JSON.stringify({ email: mockEmail }),
    });

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(200);
    expect(generateToken).toHaveBeenCalledWith(8);
    expect(sendMail).toHaveBeenCalledWith(
      mockEmail,
      'E-mail Verification',
      {
        title: 'E-mail Verification',
        message: 'Please enter the following code to verify your e-mail:',
        token: '12345678'
      },
      '/app/templates/email-verify.html'
    );
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid request body', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify/resend', {
      method: 'POST',
      body: 'invalid json',
    });

    // Act & Assert
    await expect(POST(mockRequest)).rejects.toThrow();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should handle missing email in request body', async () => {
    // Arrange
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/email/verify/resend', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(response.status).toBe(200); // Current implementation doesn't validate email
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
}); 