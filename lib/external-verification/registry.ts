import { SiiTaxStatusAdapter } from './adapters/sii-tax-status-v2'
import type { VerificationSourceAdapter, VerificationSourceCode } from './types'

class DisabledSourceAdapter implements VerificationSourceAdapter {
  constructor(public readonly code: VerificationSourceCode) {}

  async verify() {
    return {
      status: 'skipped' as const,
      errorCode: 'SOURCE_NOT_ENABLED',
      errorMessage: 'La fuente existe en el laboratorio, pero las consultas externas siguen desactivadas.',
    }
  }
}

const adapters = new Map<VerificationSourceCode, VerificationSourceAdapter>([
  ['sii_tax_status', new SiiTaxStatusAdapter()],
  ['res_company_registry', new DisabledSourceAdapter('res_company_registry')],
  ['dt_document_verifier', new DisabledSourceAdapter('dt_document_verifier')],
  ['registro_civil_verifier', new DisabledSourceAdapter('registro_civil_verifier')],
  ['superir_concursal', new DisabledSourceAdapter('superir_concursal')],
  ['mercado_publico_supplier', new DisabledSourceAdapter('mercado_publico_supplier')],
  ['cmf_registry', new DisabledSourceAdapter('cmf_registry')],
  ['mtt_sitcomex', new DisabledSourceAdapter('mtt_sitcomex')],
  ['mtt_prt_vehicle_status', new DisabledSourceAdapter('mtt_prt_vehicle_status')],
])

export function getVerificationAdapter(code: VerificationSourceCode) {
  const adapter = adapters.get(code)
  if (!adapter) throw new Error(`Unsupported verification source: ${code}`)
  return adapter
}

export function registerVerificationAdapter(adapter: VerificationSourceAdapter) {
  adapters.set(adapter.code, adapter)
}
