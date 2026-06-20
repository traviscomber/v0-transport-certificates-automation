import { NextRequest } from 'next/server'
import { GET } from '@/app/api/anomalies/list/route'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/auth-middleware')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockVerifyAuth = verifyAuth as jest.MockedFunction<typeof verifyAuth>

describe('GET /api/anomalies/list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    mockVerifyAuth.mockResolvedValue({ user: null, error: 'Unauthorized' })

    const request = new NextRequest('http://localhost:3000/api/anomalies/list')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return paginated anomalies', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })

    const mockAnomalies = [
      {
        id: '1',
        document_id: 'doc-1',
        anomaly_type: 'fraud',
        severity: 'high',
        detected_at: new Date().toISOString(),
      },
    ]

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockAnomalies,
        error: null,
        count: 1,
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = new NextRequest('http://localhost:3000/api/anomalies/list?page=1&limit=25')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.anomalies).toHaveLength(1)
  })

  it('should filter by severity', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = new NextRequest('http://localhost:3000/api/anomalies/list?severity=critical')
    await GET(request)

    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('severity', 'critical')
  })

  it('should handle pagination correctly', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 50,
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = new NextRequest('http://localhost:3000/api/anomalies/list?page=2&limit=10')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.page).toBe(2)
    expect(data.limit).toBe(10)
    expect(mockSupabaseClient.range).toHaveBeenCalledWith(10, 19)
  })

  it('should return 500 on database error', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com', role: 'admin' as const }
    mockVerifyAuth.mockResolvedValue({ user: mockUser })

    const mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
        count: null,
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = new NextRequest('http://localhost:3000/api/anomalies/list')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})
