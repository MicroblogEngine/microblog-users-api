import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { prisma } from '@ararog/microblog-users-api-db'
import { Role } from '@/enums/role'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@ararog/microblog-users-api-db', () => ({
  prisma: {
    user: {
      findMany: vi.fn()
    }
  }
}))

describe('Users API Route', () => {
  const mockUsers = [
    { id: '1', name: 'User 1', email: 'user1@example.com', hash: 'hash1', salt: 'salt1', username: 'username1', emailVerified: new Date(), roleId: 'role1' },
    { id: '2', name: 'User 2', email: 'user2@example.com', hash: 'hash2', salt: 'salt2', username: 'username2', emailVerified: new Date(), roleId: 'role2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)
  })

  it('should return users when role is ADMIN', async () => {
    const request = new NextRequest('http://localhost', {
      headers: {
        role: Role.ADMIN
      }
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUsers.map(user => ({
      ...user,
      emailVerified: user.emailVerified.toISOString()
    })))
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
  })

  it('should return 400 when role header is missing', async () => {
    const request = new NextRequest('http://localhost')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      errors: {
        user: ['Invalid role']
      }
    })
    expect(prisma.user.findMany).not.toHaveBeenCalled()
  })

  it('should return 403 when role is not ADMIN', async () => {
    const request = new NextRequest('http://localhost', {
      headers: {
        role: Role.USER
      }
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({
      errors: {
        user: ['Access Denied']
      }
    })
    expect(prisma.user.findMany).not.toHaveBeenCalled()
  })

  it('should handle prisma errors', async () => {
    const request = new NextRequest('http://localhost', {
      headers: {
        role: Role.ADMIN
      }
    })

    const error = new Error('Database error')
    vi.mocked(prisma.user.findMany).mockRejectedValue(error)

    const response = await GET(request)
    
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({
      errors: {
        server: ['Internal Server Error']
      }
    })
  })
}) 