import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { POST } from './route'
import { prisma } from '@/helpers/prisma'
import { SignupFormSchema } from '@ararog/microblog-validation'
import { generatePassword } from '@/helpers/password'
import { generateToken } from '@/helpers/token'
import sendMail from '@/services/mail_service'

// Mock all dependencies
vi.mock('@/helpers/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn()
    }
  }
}))

vi.mock('@ararog/microblog-validation', () => ({
  SignupFormSchema: {
    parse: vi.fn()
  }
}))

vi.mock('@/helpers/password', () => ({
  generatePassword: vi.fn()
}))

vi.mock('@/helpers/token', () => ({
  generateToken: vi.fn()
}))

vi.mock('@/services/mail', () => ({
  default: vi.fn()
}))

describe('Signup API Route', () => {
  const mockSignupData = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    salt: 'mocksalt',
    hash: 'mockhash',
    username: 'testuser',
    emailVerified: new Date(),
    roleId: 'role1'
  }

  const mockPasswordData = {
    salt: 'mocksalt',
    hash: 'mockhash'
  }

  const mockToken = 'mocktoken'

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    vi.mocked(SignupFormSchema.parse).mockReturnValue(mockSignupData)
    vi.mocked(generatePassword).mockReturnValue(mockPasswordData)
    vi.mocked(generateToken).mockReturnValue(mockToken)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', ...mockSignupData })
    vi.mocked(sendMail).mockResolvedValue(undefined)
  })

  it('should successfully create a new user and send verification email', async () => {
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify(mockSignupData)
    })

    const response = await POST(request)
    
    // Verify response
    expect(response.status).toBe(200)

    // Verify validation was called
    expect(SignupFormSchema.parse).toHaveBeenCalledWith({
      ...mockSignupData,
      emailVerified: mockSignupData.emailVerified.toISOString()
    })

    // Verify password generation
    expect(generatePassword).toHaveBeenCalledWith(mockSignupData.password)

    // Verify user creation
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: mockSignupData.email,
        salt: mockPasswordData.salt,
        hash: mockPasswordData.hash
      }
    })

    // Verify token generation
    expect(generateToken).toHaveBeenCalledWith(8)

    // Verify email sending
    expect(sendMail).toHaveBeenCalledWith(
      mockSignupData.email,
      'E-mail Verification',
      {
        title: 'E-mail Verification',
        message: 'Please enter the following code to verify your e-mail:',
        token: mockToken
      },
      '/app/templates/email-verify.html'
    )
  })

  it('should return 400 for invalid signup data', async () => {
    const mockValidationError = new ZodError<typeof SignupFormSchema>([{
      code: 'invalid_string',
      message: 'Invalid email',
      path: ['email'],
      validation: 'email'
    }])

    vi.mocked(SignupFormSchema.parse).mockImplementation(() => {
      throw mockValidationError
    })

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      errors: mockValidationError.formErrors.fieldErrors
    })

    // Verify no other operations were performed
    expect(generatePassword).not.toHaveBeenCalled()
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(generateToken).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify(mockSignupData)
    })

    const dbError = new Error('Database error')
    vi.mocked(prisma.user.create).mockRejectedValue(dbError)

    const response = await POST(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({
      errors: { server: ['Internal Server Error'] }
    })
  })
}) 