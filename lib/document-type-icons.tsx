import {
  FileText,
  CreditCard,
  Car,
  Truck,
  FileCheck2,
  ShieldCheck,
  Stethoscope,
  PiggyBank,
  Building,
  Wrench,
  ScrollText,
  GraduationCap,
  ClipboardCheck,
  Package,
  BadgeCheck,
  ReceiptText,
  HeartPulse,
  Scale,
  UserRound,
  FileWarning,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface DocIconConfig {
  icon: LucideIcon
  color: string
  bg: string
  border: string
  label: string
}

// 3-color palette only:
//   blue  → identity, personal, legal, employment
//   amber → vehicles, transport, operations
//   slate → finance, health, safety, training (neutral/administrative)

const BLUE   = { color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20'  }
const AMBER  = { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
const SLATE  = { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' }

const DEFAULT: DocIconConfig = {
  icon: FileText,
  label: 'Documento',
  ...SLATE,
}

function cfg(icon: LucideIcon, palette: typeof BLUE, label: string): DocIconConfig {
  return { icon, label, ...palette }
}

const CODE_MAP: Record<string, DocIconConfig> = {
  // ── Identity / Personal ───────────────────────────────────────
  'CEDULA-IDENTIDAD':          cfg(CreditCard,     BLUE,  'Cédula de Identidad'),
  'CEDULA_IDENTIDAD':          cfg(CreditCard,     BLUE,  'Cédula de Identidad'),
  'CEDULA-REPRESENTANTE':      cfg(CreditCard,     BLUE,  'Cédula Representante'),
  'CERT_ANTECEDENTES':         cfg(BadgeCheck,     BLUE,  'Cert. Antecedentes'),
  'CERTIFICADO-ANTECEDENTES':  cfg(BadgeCheck,     BLUE,  'Cert. Antecedentes'),
  'INHABILIDADES-MENORES':     cfg(BadgeCheck,     BLUE,  'Inhabilidades Menores'),

  // ── Driver License ────────────────────────────────────────────
  'LICENCIA-CONDUCIR':         cfg(Car,            BLUE,  'Licencia de Conducir'),
  'LIC_CONDUCIR':              cfg(Car,            BLUE,  'Licencia de Conducir'),
  'HOJA-VIDA-CONDUCTOR':       cfg(UserRound,      BLUE,  'Hoja de Vida Conductor'),
  'HOJA_VIDA':                 cfg(UserRound,      BLUE,  'Hoja de Vida'),

  // ── Vehicle ───────────────────────────────────────────────────
  'PADRON-VEHICULO':           cfg(Truck,          AMBER, 'Padrón Vehículo'),
  'PADRON':                    cfg(Truck,          AMBER, 'Padrón'),
  'PERMISO-CIRCULACION':       cfg(FileCheck2,     AMBER, 'Permiso Circulación'),
  'PERMISO_CIRCULACION':       cfg(FileCheck2,     AMBER, 'Permiso Circulación'),
  'REVISION-TECNICA':          cfg(Wrench,         AMBER, 'Revisión Técnica'),
  'REVISION_TECNICA':          cfg(Wrench,         AMBER, 'Revisión Técnica'),
  'CERTIFICADO-EMISIONES':     cfg(FileWarning,    AMBER, 'Cert. Emisiones'),
  'FOTO-GPS-VEHICULO':         cfg(Truck,          AMBER, 'Foto GPS Vehículo'),
  'FOTO_PATENTES':             cfg(Truck,          AMBER, 'Foto Patentes'),

  // ── Insurance ─────────────────────────────────────────────────
  'SEGURO-SOAP':               cfg(ShieldCheck,    SLATE, 'SOAP'),
  'SOAP':                      cfg(ShieldCheck,    SLATE, 'SOAP'),
  'SEGURO-CARGA':              cfg(ShieldCheck,    SLATE, 'Seguro Carga'),
  'SEGURO-RC':                 cfg(ShieldCheck,    SLATE, 'Seguro RC'),
  'POLIZA_RC':                 cfg(ShieldCheck,    SLATE, 'Póliza RC'),

  // ── Health ────────────────────────────────────────────────────
  'CERTIFICADO-SALUD':         cfg(Stethoscope,    SLATE, 'Cert. Salud'),
  'EXAMEN-PREOCUPACIONAL':     cfg(Stethoscope,    SLATE, 'Examen Preocupacional'),
  'CERT_ISAPRE':               cfg(HeartPulse,     SLATE, 'Cert. Isapre'),
  'SALUD':                     cfg(Stethoscope,    SLATE, 'Salud'),
  'MUTUAL':                    cfg(HeartPulse,     SLATE, 'Mutual'),
  'CERT_AFIL_MUTUAL':          cfg(HeartPulse,     SLATE, 'Cert. Afil. Mutual'),
  'CERT_TASAS_MUTUAL':         cfg(HeartPulse,     SLATE, 'Cert. Tasas Mutual'),

  // ── Finance / Payroll ─────────────────────────────────────────
  'CERTIFICADO-AFP':           cfg(PiggyBank,      SLATE, 'Cert. AFP'),
  'CERT_AFP':                  cfg(PiggyBank,      SLATE, 'Cert. AFP'),
  'AFP':                       cfg(PiggyBank,      SLATE, 'AFP'),
  'CERT_COTIZACIONES':         cfg(PiggyBank,      SLATE, 'Cert. Cotizaciones'),
  'LIQUIDACION_SUELDO':        cfg(ReceiptText,    SLATE, 'Liquidación Sueldo'),
  'COMPROBANTE_PAGO':          cfg(ReceiptText,    SLATE, 'Comprobante Pago'),
  'SEGURO_SOCIAL':             cfg(PiggyBank,      SLATE, 'Seguro Social'),
  'F30':                       cfg(ReceiptText,    SLATE, 'F30'),
  'F30-1':                     cfg(ReceiptText,    SLATE, 'F30-1'),
  'F30-1_DOÑA_ISIDORA':        cfg(ReceiptText,    SLATE, 'F30-1 D. Isidora'),
  'F30-1_CLIENTE':             cfg(ReceiptText,    SLATE, 'F30-1 Cliente'),
  'F30_DOÑA_ISIDORA':          cfg(ReceiptText,    SLATE, 'F30-1 D. Isidora'), // deprecated
  'F30_CLIENTE':               cfg(ReceiptText,    SLATE, 'F30-1 Cliente'), // deprecated
  'F29':                       cfg(ReceiptText,    SLATE, 'F29'),
  'CUMPLIMIENTO-PREVISIONAL':  cfg(ReceiptText,    SLATE, 'Cumplimiento Previsional'),

  // ── Employment / Contracts ────────────────────────────────────
  'CONTRATO-TRABAJO':          cfg(ScrollText,     BLUE,  'Contrato de Trabajo'),
  'CONTRATO_TRABAJO':          cfg(ScrollText,     BLUE,  'Contrato de Trabajo'),
  'CONTRATO-SUBCONTRATACION':  cfg(ScrollText,     BLUE,  'Contrato Subcontratación'),

  // ── Company Legal ─────────────────────────────────────────────
  'RUT-EMPRESA':               cfg(Building,       BLUE,  'RUT Empresa'),
  'CERT_EMPRESA':              cfg(Building,       BLUE,  'Cert. Empresa'),
  'ESCRITURA-CONSTITUCION':    cfg(Scale,          BLUE,  'Escritura Constitución'),
  'CERTIFICADO-VIGENCIA':      cfg(BadgeCheck,     BLUE,  'Cert. Vigencia'),
  'PODER-REPRESENTANTE':       cfg(Scale,          BLUE,  'Poder Representante'),

  // ── Safety / Training ─────────────────────────────────────────
  'REGLAMENTO-INTERNO':        cfg(ClipboardCheck, SLATE, 'Reglamento Interno'),
  'PROCEDIMIENTOS-SEGURIDAD':  cfg(ClipboardCheck, SLATE, 'Proc. Seguridad'),
  'MATRIZ-RIESGOS':            cfg(FileWarning,    SLATE, 'Matriz Riesgos'),
  'PROTOCOLO-ACCIDENTES':      cfg(FileWarning,    SLATE, 'Protocolo Accidentes'),
  'CAPACITACIONES':            cfg(GraduationCap,  SLATE, 'Capacitaciones'),
  'CERT_CAPACITACION':         cfg(GraduationCap,  SLATE, 'Cert. Capacitación'),
  'PLAN_EMERGENCIA':           cfg(FileWarning,    SLATE, 'Plan Emergencia'),
  'CERT_FUMIGACION':           cfg(ClipboardCheck, SLATE, 'Cert. Fumigación'),

  // ── Transport Operations ──────────────────────────────────────
  'GUIA-DESPACHO':             cfg(Package,        AMBER, 'Guía de Despacho'),
  'GUIA_DESPACHO':             cfg(Package,        AMBER, 'Guía de Despacho'),
  'ORDEN-TRANSPORTE':          cfg(Truck,          AMBER, 'Orden de Transporte'),
  'CARTA-PORTE':               cfg(Package,        AMBER, 'Carta Porte'),
  'CARTA_PORTE':               cfg(Package,        AMBER, 'Carta Porte'),
  'MANIFIESTO_CARGA':          cfg(Package,        AMBER, 'Manifiesto Carga'),
  'DOCUMENTOS-CARGA':          cfg(Package,        AMBER, 'Documentos Carga'),
  'REGISTRO-ENTREGA':          cfg(FileCheck2,     AMBER, 'Registro Entrega'),
}

export function getDocTypeIcon(docType?: { code?: string; nombre?: string } | null): DocIconConfig {
  if (!docType) return DEFAULT

  // Exact code match
  if (docType.code) {
    const match = CODE_MAP[docType.code.toUpperCase()]
    if (match) return match
  }

  // Fuzzy name match
  if (docType.nombre) {
    const n = docType.nombre.toLowerCase()
    if (n.includes('licencia') && n.includes('conducir')) return CODE_MAP['LICENCIA-CONDUCIR']
    if (n.includes('cédula') || n.includes('cedula'))     return CODE_MAP['CEDULA-IDENTIDAD']
    if (n.includes('antecedente'))                         return CODE_MAP['CERT_ANTECEDENTES']
    if (n.includes('hoja de vida'))                        return CODE_MAP['HOJA_VIDA']
    if (n.includes('padrón') || n.includes('padron'))      return CODE_MAP['PADRON']
    if (n.includes('permiso') && n.includes('circulacion'))return CODE_MAP['PERMISO-CIRCULACION']
    if (n.includes('revisión técnica') || n.includes('revision tecnica')) return CODE_MAP['REVISION_TECNICA']
    if (n.includes('soap'))                                return CODE_MAP['SOAP']
    if (n.includes('seguro'))                              return CODE_MAP['SEGURO-RC']
    if (n.includes('afp'))                                 return CODE_MAP['AFP']
    if (n.includes('cotizacion') || n.includes('cotización')) return CODE_MAP['CERT_COTIZACIONES']
    if (n.includes('liquidacion') || n.includes('liquidación')) return CODE_MAP['LIQUIDACION_SUELDO']
    if (n.includes('f30'))                                 return CODE_MAP['F30']
    if (n.includes('f29'))                                 return CODE_MAP['F29']
    if (n.includes('contrato'))                            return CODE_MAP['CONTRATO-TRABAJO']
    if (n.includes('salud') || n.includes('isapre') || n.includes('fonasa')) return CODE_MAP['SALUD']
    if (n.includes('mutual'))                              return CODE_MAP['MUTUAL']
    if (n.includes('capacitaci'))                          return CODE_MAP['CERT_CAPACITACION']
    if (n.includes('guia') || n.includes('guía'))          return CODE_MAP['GUIA_DESPACHO']
    if (n.includes('carta porte'))                         return CODE_MAP['CARTA_PORTE']
    if (n.includes('manifiesto'))                          return CODE_MAP['MANIFIESTO_CARGA']
    if (n.includes('fumigaci'))                            return CODE_MAP['CERT_FUMIGACION']
    if (n.includes('emergencia'))                          return CODE_MAP['PLAN_EMERGENCIA']
    if (n.includes('reglamento'))                          return CODE_MAP['REGLAMENTO-INTERNO']
    if (n.includes('preocupacional'))                      return CODE_MAP['EXAMEN-PREOCUPACIONAL']
    if (n.includes('rut'))                                 return CODE_MAP['RUT-EMPRESA']
    if (n.includes('patente') || n.includes('foto'))       return CODE_MAP['FOTO_PATENTES']
  }

  return DEFAULT
}
