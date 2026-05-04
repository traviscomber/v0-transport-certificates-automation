import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Badge,
  Truck,
  Users,
  ClipboardList,
  ShieldCheck,
  Calendar,
  DollarSign,
  Map,
  Zap,
  Lock,
  CheckCircle2,
} from "lucide-react"

const documentCategories = [
  {
    category: "Certificaciones Vehiculares",
    icon: Truck,
    documents: [
      "Certificado F-30 (Autorización de Transporte)",
      "Permiso de Circulación",
      "Revisión Técnica (RTV)",
      "Seguro Obligatorio (SOAP)",
      "Certificado de Mecánica Especial",
      "Autorización para Carga Peligrosa",
    ],
  },
  {
    category: "Licencias y Credenciales",
    icon: Badge,
    documents: [
      "Licencia de Conducir",
      "Licencia Profesional",
      "Certificado de Antecedentes",
      "Certificado de Inhabilidad",
      "Credencial de Transportista",
      "Registro de Antecedentes Policiales",
    ],
  },
  {
    category: "Documentos Empresariales",
    icon: ClipboardList,
    documents: [
      "RUT de Empresa",
      "Certificado de Inscripción en SII",
      "Contrato Social",
      "Nómina de Conductores",
      "Registro de Propiedad Vehicular",
      "Contrato de Seguros",
    ],
  },
  {
    category: "Comprobantes Regulatorios",
    icon: ShieldCheck,
    documents: [
      "Declaración de Gastos",
      "Boleta de Impuesto (Declaración)",
      "Póliza de Seguro Vigente",
      "Certificado de Cumplimiento",
      "Declaración de Ingresos",
      "Comprobante de Domicilio",
    ],
  },
  {
    category: "Documentos de Itinerario",
    icon: Map,
    documents: [
      "Carta de Porte",
      "Comprobante de Entrega",
      "Manifiesto de Carga",
      "Guía de Despacho",
      "Documento de Transporte",
      "Certificado de Ruta",
    ],
  },
  {
    category: "Documentos Técnicos",
    icon: Zap,
    documents: [
      "Especificaciones del Vehículo",
      "Certificado de Dimensiones",
      "Peso y Carga Permitida",
      "Certificado de Emisiones",
      "Informe Técnico",
      "Dimensiones y Pesos Legales",
    ],
  },
  {
    category: "Documentos de Seguridad",
    icon: Lock,
    documents: [
      "Certificado de Seguridad Vehicular",
      "Plan de Seguridad Operacional",
      "Registro de Accidentes",
      "Certificado de Capacitación",
      "Política de Seguridad",
      "Reporte de Incidentes",
    ],
  },
  {
    category: "Documentos de Cumplimiento",
    icon: CheckCircle2,
    documents: [
      "Certificado de Cumplimiento Normativo",
      "Auditoría de Compliance",
      "Certificación ISO",
      "Declaración de Conformidad",
      "Reporte de Inspección",
      "Certificado de Regularización",
    ],
  },
]

export function DocumentsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            Gestión de <span className="text-primary">45+ Documentos</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Nuestro sistema soporta la automatización completa de todos los documentos requeridos por la normativa chilena
            de transporte. Desde certificaciones vehiculares hasta documentos de cumplimiento regulatorio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {documentCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <Card key={cat.category} className="border-primary/20 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{cat.category}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cat.documents.length} documentos</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {cat.documents.slice(0, 3).map((doc, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                    {cat.documents.length > 3 && (
                      <li className="text-xs text-primary font-medium">+{cat.documents.length - 3} más...</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">45+</div>
                <p className="text-sm text-muted-foreground">Tipos de Documentos</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Automatización OCR</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Real-time</div>
                <p className="text-sm text-muted-foreground">Validación Instantánea</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Procesamiento Continuo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
