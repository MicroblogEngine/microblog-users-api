import { describe, it, expect } from 'vitest'
import type { LoginResponse } from './users'
import type { User } from '@prisma/client'
import { randomUUID } from 'crypto'

describe('LoginResponse type', () => {
  it('should match the expected shape', () => {
    const id = randomUUID();

    const mockUser: User = {
      id,
      username: 'Test User',
      email: 'test@example.com',
      hash: 'hashedPassword',
      salt: 'salt',
      emailVerified: new Date(),
    }

    const loginResponse: LoginResponse = {
      user: mockUser,
      token: 'jwt.token.here'
    }

    // Test the structure
    expect(loginResponse).toHaveProperty('user')
    expect(loginResponse).toHaveProperty('token')
    
    // Test the user object structure
    expect(loginResponse.user).toHaveProperty('id')
    expect(loginResponse.user).toHaveProperty('email')
    expect(loginResponse.user).toHaveProperty('username')
    expect(loginResponse.user).toHaveProperty('hash')
    expect(loginResponse.user).toHaveProperty('salt')
    expect(loginResponse.user).toHaveProperty('emailVerified')

    // Test the types
    expect(typeof loginResponse.token).toBe('string')
    expect(loginResponse.user.id).toBeTypeOf('string')
    expect(loginResponse.user.email).toBeTypeOf('string')
    expect(loginResponse.user.hash).toBeTypeOf('string')
    expect(loginResponse.user.salt).toBeTypeOf('string')
    expect(loginResponse.user.username).toBeTypeOf('string')
    expect(loginResponse.user.emailVerified).toBeTypeOf('object')
  })
}) 