import {
  FileText,
  IdCard,
  Car,
  ClipboardList,
  Shield,
  HeartPulse,
  Banknote,
  Building2,
  Wrench,
  FileCheck,
  ScrollText,
  Truck,
  Package,
  AlertTriangle,
  GraduationCap,
  Camera,
  Receipt,
  Landmark,
  FileBadge,
  UserCheck,
  Users,
  Scale,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface DocIconConfig {
  icon: LucideIcon
  color: string      // text color class
  bg: string         // bg color class
  border: string     // border color class
}

const DEFAULT: DocIconConfig = {
  icon: FileText,
  color: 'text-slate-400',
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/20',
}

// Maps both code (uppercase) and normalized name fragment to icon config
const CODE_MAP: Record<string, DocIconConfig> = {
  // ── Identity / Personal ──────────────────────────
  'CEDULA-IDENTIDAD':        { icon: IdCard,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  'CEDULA-REPRESENTANTE':    { icon: IdCard,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  'CEDULA_IDENTIDAD':        { icon: IdCard,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  'CERT_ANTECEDENTES':       { icon: UserCheck,      color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  'CERTIFICADO-ANTECEDENTES':{ icon: UserCheck,      color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  'INHABILIDADES-MENORES':   { icon: UserCheck,      color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },

  // ── Driver ───────────────────────────────────────
  'LICENCIA-CONDUCIR':       { icon: Car,            color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  'LIC_CONDUCIR':            { icon: Car,            color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  'HOJA-VIDA-CONDUCTOR':     { icon: ClipboardList,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },
  'HOJA_VIDA':               { icon: ClipboardList,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },

  // ── Vehicle ──────────────────────────────────────
  'PADRON-VEHICULO':         { icon: Truck,          color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  'PADRON':                  { icon: Truck,          color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  'PERMISO-CIRCULACION':     { icon: FileCheck,      color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20' },
  'PERMISO_CIRCULACION':     { icon: FileCheck,      color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20' },
  'REVISION-TECNICA':        { icon: Wrench,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  'REVISION_TECNICA':        { icon: Wrench,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  'CERTIFICADO-EMISIONES':   { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'FOTO-GPS-VEHICULO':       { icon: Camera,         color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
  'FOTO_PATENTES':           { icon: Camera,         color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },

  // ── Insurance ────────────────────────────────────
  'SEGURO-SOAP':             { icon: Shield,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'SOAP':                    { icon: Shield,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'SEGURO-CARGA':            { icon: Shield,         color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
  'SEGURO-RC':               { icon: Shield,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  'POLIZA_RC':               { icon: Shield,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },

  // ── Health ───────────────────────────────────────
  'CERTIFICADO-SALUD':       { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'EXAMEN-PREOCUPACIONAL':   { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'CERT_ISAPRE':             { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'SALUD':                   { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'MUTUAL':                  { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'CERT_AFIL_MUTUAL':        { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  'CERT_TASAS_MUTUAL':       { icon: HeartPulse,     color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },

  // ── Finance / Payroll ────────────────────────────
  'CERTIFICADO-AFP':         { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'CERT_AFP':                { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'AFP':                     { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'F30':                     { icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  'F30-1':                   { icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  'F30_DOÑA_ISIDORA':        { icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  'F30_CLIENTE':             { icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  'CUMPLIMIENTO-PREVISIONAL':{ icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  'CERT_COTIZACIONES':       { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'LIQUIDACION_SUELDO':      { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'COMPROBANTE_PAGO':        { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'SEGURO_SOCIAL':           { icon: Banknote,       color: 'text-lime-400',    bg: 'bg-lime-500/10',    border: 'border-lime-500/20' },
  'F29':                     { icon: Receipt,        color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },

  // ── Employment ───────────────────────────────────
  'CONTRATO-TRABAJO':        { icon: ScrollText,     color: 'text-blue-300',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  'CONTRATO_TRABAJO':        { icon: ScrollText,     color: 'text-blue-300',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  'CONTRATO-SUBCONTRATACION':{ icon: ScrollText,     color: 'text-blue-300',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },

  // ── Company Legal ────────────────────────────────
  'RUT-EMPRESA':             { icon: Landmark,       color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  'CERT_EMPRESA':            { icon: Landmark,       color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  'ESCRITURA-CONSTITUCION':  { icon: Scale,          color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  'CERTIFICADO-VIGENCIA':    { icon: FileBadge,      color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  'PODER-REPRESENTANTE':     { icon: Users,          color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },

  // ── Safety / Training ────────────────────────────
  'REGLAMENTO-INTERNO':      { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'PROCEDIMIENTOS-SEGURIDAD':{ icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'MATRIZ-RIESGOS':          { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'PROTOCOLO-ACCIDENTES':    { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'CAPACITACIONES':          { icon: GraduationCap,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },
  'CERT_CAPACITACION':       { icon: GraduationCap,  color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },
  'PLAN_EMERGENCIA':         { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'CERT_FUMIGACION':         { icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },

  // ── Transport Operations ─────────────────────────
  'GUIA-DESPACHO':           { icon: Package,        color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'GUIA_DESPACHO':           { icon: Package,        color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'ORDEN-TRANSPORTE':        { icon: Truck,          color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  'CARTA-PORTE':             { icon: ScrollText,     color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'CARTA_PORTE':             { icon: ScrollText,     color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'MANIFIESTO_CARGA':        { icon: Package,        color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'DOCUMENTOS-CARGA':        { icon: Package,        color: 'text-orange-300',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  'REGISTRO-ENTREGA':        { icon: FileCheck,      color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20' },
}

/**
 * Returns the icon config for a document given its docType code and/or nombre.
 * Falls back gracefully to a generic file icon.
 */
export function getDocTypeIcon(docType?: { code?: string; nombre?: string } | null): DocIconConfig {
  if (!docType) return DEFAULT

  const byCode = docType.code ? CODE_MAP[docType.code.toUpperCase()] : undefined
  if (byCode) return byCode

  // Fuzzy match by name fragment
  if (docType.nombre) {
    const name = docType.nombre.toLowerCase()
    if (name.includes('licencia') && name.includes('conducir')) return CODE_MAP['LICENCIA-CONDUCIR']
    if (name.includes('cédula') || name.includes('cedula'))     return CODE_MAP['CEDULA-IDENTIDAD']
    if (name.includes('antecedente'))                           return CODE_MAP['CERT_ANTECEDENTES']
    if (name.includes('hoja de vida'))                          return CODE_MAP['HOJA_VIDA']
    if (name.includes('padrón') || name.includes('padron'))     return CODE_MAP['PADRON']
    if (name.includes('revisión técnica') || name.includes('revision tecnica')) return CODE_MAP['REVISION_TECNICA']
    if (name.includes('permiso de circulacion'))                return CODE_MAP['PERMISO_CIRCULACION']
    if (name.includes('soap'))                                  return CODE_MAP['SOAP']
    if (name.includes('seguro'))                                return CODE_MAP['SEGURO-RC']
    if (name.includes('afp'))                                   return CODE_MAP['AFP']
    if (name.includes('cotizacion') || name.includes('cotización')) return CODE_MAP['CERT_COTIZACIONES']
    if (name.includes('liquidacion') || name.includes('liquidación')) return CODE_MAP['LIQUIDACION_SUELDO']
    if (name.includes('f30'))                                   return CODE_MAP['F30']
    if (name.includes('f29'))                                   return CODE_MAP['F29']
    if (name.includes('contrato'))                              return CODE_MAP['CONTRATO-TRABAJO']
    if (name.includes('salud') || name.includes('isapre') || name.includes('fonasa')) return CODE_MAP['SALUD']
    if (name.includes('mutual'))                                return CODE_MAP['MUTUAL']
    if (name.includes('capacitacion') || name.includes('capacitación')) return CODE_MAP['CERT_CAPACITACION']
    if (name.includes('guia de despacho') || name.includes('guía de despacho')) return CODE_MAP['GUIA_DESPACHO']
    if (name.includes('carta porte'))                           return CODE_MAP['CARTA_PORTE']
    if (name.includes('manifiesto'))                            return CODE_MAP['MANIFIESTO_CARGA']
    if (name.includes('fumigacion') || name.includes('fumigación')) return CODE_MAP['CERT_FUMIGACION']
    if (name.includes('emergencia'))                            return CODE_MAP['PLAN_EMERGENCIA']
    if (name.includes('reglamento'))                            return CODE_MAP['REGLAMENTO-INTERNO']
    if (name.includes('preocupacional'))                        return CODE_MAP['EXAMEN-PREOCUPACIONAL']
    if (name.includes('foto') || name.includes('patente'))      return CODE_MAP['FOTO_PATENTES']
    if (name.includes('rut'))                                   return CODE_MAP['RUT-EMPRESA']
  }

  return DEFAULT
}
