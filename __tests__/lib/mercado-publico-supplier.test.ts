import { MercadoPublicoSupplierAdapter } from '@/lib/external-verification/adapters/mercado-publico-supplier'
import type { VerificationRequest } from '@/lib/external-verification/types'

const originalTicket = process.env.MERCADO_PUBLICO_API_TICKET
const originalAllowTestTicket = process.env.MERCADO_PUBLICO_ALLOW_TEST_TICKET

function request(rut: string): VerificationRequest {
  return {
    sourceCode: 'mercado_publico_supplier',
    entityType: 'transportista',
    entityId: '00000000-0000-0000-0000-000000000001',
    payload: { rut, adapterVersion: 1 },
  }
}

function mockResponse(status: number, body: string) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe('MercadoPublicoSupplierAdapter', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    process.env.MERCADO_PUBLICO_API_TICKET = 'test-ticket'
    delete process.env.MERCADO_PUBLICO_ALLOW_TEST_TICKET
    global.fetch = jest.fn()
  })

  afterAll(() => {
    if (originalTicket === undefined) delete process.env.MERCADO_PUBLICO_API_TICKET
    else process.env.MERCADO_PUBLICO_API_TICKET = originalTicket

    if (originalAllowTestTicket === undefined) delete process.env.MERCADO_PUBLICO_ALLOW_TEST_TICKET
    else process.env.MERCADO_PUBLICO_ALLOW_TEST_TICKET = originalAllowTestTicket
  })

  it('rejects an invalid Chilean RUT without calling the provider', async () => {
    const adapter = new MercadoPublicoSupplierAdapter()
    const result = await adapter.verify(request('12.345.678-9'))

    expect(result.status).toBe('failed')
    expect(result.errorCode).toBe('MERCADO_PUBLICO_INVALID_RUT')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('requires an API ticket', async () => {
    delete process.env.MERCADO_PUBLICO_API_TICKET
    const adapter = new MercadoPublicoSupplierAdapter()
    const result = await adapter.verify(request('70.017.820-K'))

    expect(result.status).toBe('skipped')
    expect(result.errorCode).toBe('MERCADO_PUBLICO_TICKET_MISSING')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('normalizes a supplier found by the official company fields', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, JSON.stringify({
      Cantidad: 1,
      Listado: [
        {
          CodigoEmpresa: '1024',
          NombreEmpresa: 'TRANSPORTES DE PRUEBA LIMITADA',
        },
      ],
    })))

    const adapter = new MercadoPublicoSupplierAdapter()
    const result = await adapter.verify(request('70.017.820-K'))

    expect(result.status).toBe('success')
    expect(result.normalizedResult).toMatchObject({
      registeredInMercadoPublico: true,
      providerCode: '1024',
      providerName: 'TRANSPORTES DE PRUEBA LIMITADA',
      capability: 'supplier_registry_presence',
    })
    expect(result.normalizedResult?.evidencePortalUrl).toBe('https://datos-abiertos.chilecompra.cl/')
    expect(result.confidence).toBe(0.99)
  })

  it('returns not_found when the official response has zero suppliers', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, JSON.stringify({
      Cantidad: 0,
      Listado: [],
    })))

    const adapter = new MercadoPublicoSupplierAdapter()
    const result = await adapter.verify(request('70.017.820-K'))

    expect(result.status).toBe('not_found')
    expect(result.normalizedResult).toMatchObject({
      registeredInMercadoPublico: false,
    })
  })

  it('reports rate limiting without treating it as a supplier result', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse(429, 'Too Many Requests'))

    const adapter = new MercadoPublicoSupplierAdapter()
    const result = await adapter.verify(request('70.017.820-K'))

    expect(result.status).toBe('failed')
    expect(result.httpStatus).toBe(429)
    expect(result.errorCode).toBe('MERCADO_PUBLICO_RATE_LIMITED')
  })
})
