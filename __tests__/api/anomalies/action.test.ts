import { NextRequest } from 'next/server'
import { POST } from '@/app/api/anomalies/action/route'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'
import { validateAnomalyActionRequest } from '@/lib/validation/schemas'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/auth-middleware')
jest.mock('@/lib/validation/schemas')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockVerifyAuth = verifyAuth as jest.MockedFunction<typeof verifyAuth>
const mockValidate = validateAnomalyActionRequest as jest.MockedFunction<typeof validateAnomalyActionRequest>

describe('POST /api/anomalies/action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    mockVerifyAuth.mockResolvedValue({ user: null, error: 'Unauthorized' })

    const request = new NextRequest('http://localhost:3000/api/anomalies/action', {
      method: 'POST',
      body: JSON.stringify({ anomaly_id: '123', action: 'approved' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should reject invalid request body', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })
    mockValidate.mockReturnValue({
      valid: false,
      errors: [{ field: 'action', message: 'Action is required' }],
    })

    const request = new NextRequest('http://localhost:3000/api/anomalies/action', {
      method: 'POST',
      body: JSON.stringify({ anomaly_id: '123' }), // missing action
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('should update anomaly with action', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })
    mockValidate.mockReturnValue({ valid: true, errors: [] })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const payload = {
      anomaly_id: '123',
      action: 'resolve',
      notes: 'Verified',
    }

    const request = new NextRequest('http://localhost:3000/api/anomalies/action', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.anomaly_id).toBe('123')
  })

  it('should handle different action types', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })
    mockValidate.mockReturnValue({ valid: true, errors: [] })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const actions = ['investigate', 'resolve', 'dismiss', 'escalate']

    for (const action of actions) {
      const payload = { anomaly_id: '123', action }
      const request = new NextRequest('http://localhost:3000/api/anomalies/action', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }
  })

  it('should return 500 on database error', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })
    mockValidate.mockReturnValue({ valid: true, errors: [] })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: new Error('Database error') }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = new NextRequest('http://localhost:3000/api/anomalies/action', {
      method: 'POST',
      body: JSON.stringify({ anomaly_id: '123', action: 'resolve' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
