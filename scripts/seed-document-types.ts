import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const documentTypes = [
  // CATEGORÍA 1: EMPRESA (5)
  {
    code: "RUT-EMPRESA",
    name: "RUT Empresa",
    category: "empresa",
    description: "Registro Único Tributario de la empresa transportista",
    ai_prompt:
      'Extrae el RUT y datos de la empresa desde este documento chileno. RUT formato: XX.XXX.XXX-X. Responde solo con JSON: {"rut": "XX.XXX.XXX-X", "razonSocial": "...", "estado": "..."}',
    required_fields: ["rut", "razonSocial", "estado"],
    optional_fields: ["digito_verificador"],
    expiration_days: null,
    sort_order: 1,
  },
  {
    code: "ESCRITURA-CONSTITUCION",
    name: "Escritura de Constitución",
    category: "empresa",
    description: "Documento notarial de constitución de la empresa",
    ai_prompt:
      'Extrae datos de la escritura de constitución: fecha, notario, socios, capital inicial. Responde solo con JSON válido.',
    required_fields: ["fecha", "notario", "socios"],
    optional_fields: ["capital", "observaciones"],
    expiration_days: 365,
    sort_order: 2,
  },
  {
    code: "CERTIFICADO-VIGENCIA",
    name: "Certificado de Vigencia",
    category: "empresa",
    description: "Certificado de vigencia del registro comercial",
    ai_prompt:
      'Extrae estado vigente de la empresa y fecha del certificado. Responde solo con JSON.',
    required_fields: ["estado", "fechaCertificado"],
    optional_fields: ["camara_comercio"],
    expiration_days: 90,
    sort_order: 3,
  },
  {
    code: "PODER-REPRESENTANTE",
    name: "Poder del Representante",
    category: "empresa",
    description:
      "Documento notarial otorgando poderes al representante legal",
    ai_prompt:
      'Extrae datos del poder: representante, alcance, fecha de otorgamiento. Responde solo con JSON.',
    required_fields: ["representante", "alcance", "fecha"],
    optional_fields: ["notario"],
    expiration_days: 365,
    sort_order: 4,
  },
  {
    code: "CEDULA-REPRESENTANTE",
    name: "Cédula Representante Legal",
    category: "empresa",
    description: "Cédula de identidad del representante legal de la empresa",
    ai_prompt:
      'Extrae datos de la cédula chilena del representante. Responde solo con JSON.',
    required_fields: ["rut", "nombre", "fecha_nacimiento"],
    optional_fields: ["sexo", "nacionalidad"],
    expiration_days: null,
    sort_order: 5,
  },

  // CATEGORÍA 2: CONDUCTOR (9)
  {
    code: "CEDULA-IDENTIDAD",
    name: "Cédula de Identidad",
    category: "conductor",
    description: "Cédula de identidad chilena del conductor",
    ai_prompt:
      'Analiza esta CÉDULA DE IDENTIDAD CHILENA y extrae los datos. IMPORTANTE: Responde ÚNICAMENTE con JSON válido. CAMPOS: rut, nombreCompleto, nombre, apellidos, fechaNacimiento, sexo, fechaEmision, fechaVencimiento. Si no puedes leer un campo, OMÍTELO del JSON.',
    required_fields: ["rut", "nombreCompleto", "fechaNacimiento"],
    optional_fields: ["sexo", "nacionalidad"],
    expiration_days: null,
    sort_order: 6,
  },
  {
    code: "LICENCIA-CONDUCIR",
    name: "Licencia de Conducir Profesional",
    category: "conductor",
    description:
      "Licencia profesional A-4 o A-5 para transporte de carga",
    ai_prompt:
      'Extrae datos de licencia profesional chilena: RUT, clase (A-4/A-5), vigencia, restricciones. Responde solo con JSON.',
    required_fields: ["rut", "clase", "fechaVencimiento"],
    optional_fields: ["restricciones", "observaciones"],
    expiration_days: 365,
    sort_order: 7,
  },
  {
    code: "HOJA-VIDA",
    name: "Hoja de Vida",
    category: "conductor",
    description:
      "Curriculum vitae o hoja de vida del conductor",
    ai_prompt:
      'Extrae datos laborales: experiencia en transporte, antecedentes profesionales, referencias. Responde solo con JSON.',
    required_fields: ["nombre", "experiencia"],
    optional_fields: ["referencias", "capacitaciones"],
    expiration_days: null,
    sort_order: 8,
  },
  {
    code: "CERTIFICADO-ANTECEDENTES",
    name: "Certificado de Antecedentes",
    category: "conductor",
    description:
      "Certificado de antecedentes penales expedido por PDI/Carabineros",
    ai_prompt:
      'Extrae: fecha expedición, estado, autoridad emisora. Responde solo con JSON.',
    required_fields: ["fecha", "estado", "autoridad"],
    optional_fields: ["observaciones"],
    expiration_days: 365,
    sort_order: 9,
  },
  {
    code: "INHABILIDADES-MENORES",
    name: "Inhabilidades Menores",
    category: "conductor",
    description:
      "Certificado de no tener inhabilidades menores para conducir",
    ai_prompt:
      'Extrae: estado, fecha de expedición, validez. Responde solo con JSON.',
    required_fields: ["estado", "fecha"],
    optional_fields: ["autoridad"],
    expiration_days: 180,
    sort_order: 10,
  },
  {
    code: "CONTRATO-TRABAJO",
    name: "Contrato de Trabajo",
    category: "conductor",
    description:
      "Contrato laboral firmado entre empresa y conductor",
    ai_prompt:
      'Extrae: fechas de vigencia, salario, condiciones, ambas firmas. Responde solo con JSON.',
    required_fields: ["fechaInicio", "ambas_firmas"],
    optional_fields: ["salario", "condiciones"],
    expiration_days: 365,
    sort_order: 11,
  },
  {
    code: "CERTIFICADO-AFP",
    name: "Certificado AFP",
    category: "conductor",
    description:
      "Certificado de afiliación a fondo de pensiones",
    ai_prompt:
      'Extrae: AFP, número de afiliación, estado de cotizaciones. Responde solo con JSON.',
    required_fields: ["AFP", "numeroAfiliacion", "estado"],
    optional_fields: ["ultimas_cotizaciones"],
    expiration_days: 180,
    sort_order: 12,
  },
  {
    code: "CERTIFICADO-SALUD",
    name: "Certificado de Salud",
    category: "conductor",
    description:
      "Certificado de salud válido para conducir",
    ai_prompt:
      'Extrae: fecha, vigencia, estado de salud apto. Responde solo con JSON.',
    required_fields: ["fecha", "vigencia", "estado"],
    optional_fields: ["examinador"],
    expiration_days: 365,
    sort_order: 13,
  },
  {
    code: "EXAMEN-PREOCUPACIONAL",
    name: "Examen Preocupacional",
    category: "conductor",
    description:
      "Examen médico ocupacional requerido por ley",
    ai_prompt:
      'Extrae: fecha, resultado apto/no apto, médico. Responde solo con JSON.',
    required_fields: ["fecha", "resultado"],
    optional_fields: ["medico", "recomendaciones"],
    expiration_days: 365,
    sort_order: 14,
  },

  // CATEGORÍA 3: VEHÍCULO (8)
  {
    code: "PADRON-INSCRIPCION",
    name: "Padrón/Certificado Inscripción",
    category: "vehiculo",
    description:
      "Certificado de inscripción del vehículo en registro de vehículos motorizados",
    ai_prompt:
      'Extrae: patente, VIN, marca, modelo, año, propietario. Responde solo con JSON.',
    required_fields: ["patente", "vin", "marca", "modelo", "ano"],
    optional_fields: ["propietario", "color"],
    expiration_days: null,
    sort_order: 15,
  },
  {
    code: "PERMISO-CIRCULACION",
    name: "Permiso de Circulación",
    category: "vehiculo",
    description:
      "Permiso municipal de circulación del vehículo",
    ai_prompt:
      'Extrae: patente, vigencia, estado, municipalidad. Responde solo con JSON.',
    required_fields: ["patente", "fechaVencimiento"],
    optional_fields: ["municipio", "estado"],
    expiration_days: 365,
    sort_order: 16,
  },
  {
    code: "REVISION-TECNICA",
    name: "Revisión Técnica",
    category: "vehiculo",
    description:
      "Certificado de revisión técnica del vehículo",
    ai_prompt:
      'Extrae: patente, fecha, estado apto/no apto, próxima revisión. Responde solo con JSON.',
    required_fields: ["patente", "fecha", "estado"],
    optional_fields: ["proxima_revision"],
    expiration_days: 365,
    sort_order: 17,
  },
  {
    code: "CERTIFICADO-EMISIONES",
    name: "Certificado de Emisiones",
    category: "vehiculo",
    description:
      "Certificado de control de emisiones contaminantes",
    ai_prompt:
      'Extrae: patente, fecha, estado, norma cumplida. Responde solo con JSON.',
    required_fields: ["patente", "fecha", "estado"],
    optional_fields: ["norma"],
    expiration_days: 365,
    sort_order: 18,
  },
  {
    code: "SEGURO-SOAP",
    name: "Seguro SOAP",
    category: "vehiculo",
    description:
      "Póliza de Seguro Obligatorio de Accidentes de Pasajeros",
    ai_prompt:
      'Extrae: patente, vigencia, asegurador, número póliza. Responde solo con JSON.',
    required_fields: ["patente", "fechaVencimiento", "asegurador"],
    optional_fields: ["numeroPóliza"],
    expiration_days: 365,
    sort_order: 19,
  },
  {
    code: "SEGURO-CARGA",
    name: "Seguro de Carga",
    category: "vehiculo",
    description:
      "Seguro de responsabilidad civil para carga transportada",
    ai_prompt:
      'Extrae: patente, cobertura, vigencia, asegurador. Responde solo con JSON.',
    required_fields: ["patente", "cobertura", "fechaVencimiento"],
    optional_fields: ["asegurador", "numeroPóliza"],
    expiration_days: 365,
    sort_order: 20,
  },
  {
    code: "SEGURO-RESPONSABILIDAD",
    name: "Seguro Responsabilidad Civil",
    category: "vehiculo",
    description:
      "Seguro de responsabilidad civil del vehículo",
    ai_prompt:
      'Extrae: patente, cobertura, vigencia, límites. Responde solo con JSON.',
    required_fields: ["patente", "cobertura", "fechaVencimiento"],
    optional_fields: ["asegurador"],
    expiration_days: 365,
    sort_order: 21,
  },
  {
    code: "FOTOGRAFIA-GPS",
    name: "Fotografía + GPS",
    category: "vehiculo",
    description:
      "Fotografía frontal y lateral del vehículo + coordenadas GPS",
    ai_prompt:
      'Extrae: patente visible, estado, coordenadas GPS si están presentes. Responde solo con JSON.',
    required_fields: ["patente", "imagen_frontal"],
    optional_fields: ["coordenadas_gps"],
    expiration_days: null,
    sort_order: 22,
  },

  // CATEGORÍA 4: SEGURIDAD (5)
  {
    code: "REGLAMENTO-INTERNO",
    name: "Reglamento Interno",
    category: "seguridad",
    description:
      "Reglamento interno de la empresa transportista",
    ai_prompt:
      'Extrae: fecha de aprobación, versión, cobertura de seguridad. Responde solo con JSON.',
    required_fields: ["fecha", "version"],
    optional_fields: ["contenido_seguridad"],
    expiration_days: 365,
    sort_order: 23,
  },
  {
    code: "PROCEDIMIENTOS-SEGURIDAD",
    name: "Procedimientos Trabajo Seguro",
    category: "seguridad",
    description:
      "Procedimientos documentados de trabajo seguro",
    ai_prompt:
      'Extrae: fecha vigencia, áreas cubiertas, responsables. Responde solo con JSON.',
    required_fields: ["fecha", "areas_cubiertas"],
    optional_fields: ["responsables"],
    expiration_days: 365,
    sort_order: 24,
  },
  {
    code: "MATRIZ-RIESGOS",
    name: "Matriz de Riesgos",
    category: "seguridad",
    description:
      "Matriz de identificación y evaluación de riesgos laborales",
    ai_prompt:
      'Extrae: fecha, riesgos identificados, niveles, controles. Responde solo con JSON.',
    required_fields: ["fecha", "riesgos_identificados"],
    optional_fields: ["niveles", "controles"],
    expiration_days: 365,
    sort_order: 25,
  },
  {
    code: "CAPACITACIONES",
    name: "Capacitaciones",
    category: "seguridad",
    description:
      "Registros de capacitaciones de seguridad realizadas",
    ai_prompt:
      'Extrae: fecha, tema, personal capacitado, certificador. Responde solo con JSON.',
    required_fields: ["fecha", "tema"],
    optional_fields: ["personal_capacitado", "certificador"],
    expiration_days: 180,
    sort_order: 26,
  },
  {
    code: "PROTOCOLOS-ACCIDENTES",
    name: "Protocolos de Accidentes",
    category: "seguridad",
    description:
      "Procedimientos y protocolos ante accidentes",
    ai_prompt:
      'Extrae: fecha, versión, cobertura de tipos de accidentes. Responde solo con JSON.',
    required_fields: ["fecha", "version"],
    optional_fields: ["tipos_accidentes"],
    expiration_days: 365,
    sort_order: 27,
  },

  // CATEGORÍA 5: OPERACIONAL (5)
  {
    code: "GUIA-DESPACHO",
    name: "Guía de Despacho",
    category: "operacional",
    description:
      "Guía de despacho de carga transportada",
    ai_prompt:
      'Extrae: número, fecha, origen, destino, carga, firma. Responde solo con JSON.',
    required_fields: ["numero", "fecha", "origen", "destino"],
    optional_fields: ["carga"],
    expiration_days: null,
    sort_order: 28,
  },
  {
    code: "ORDEN-TRANSPORTE",
    name: "Orden de Transporte",
    category: "operacional",
    description:
      "Orden de transporte emitida por cliente",
    ai_prompt:
      'Extrae: número, fecha, origen, destino, cliente. Responde solo con JSON.',
    required_fields: ["numero", "fecha", "origen", "destino"],
    optional_fields: ["cliente"],
    expiration_days: null,
    sort_order: 29,
  },
  {
    code: "CARTA-PORTE",
    name: "Carta de Porte",
    category: "operacional",
    description:
      "Documento que acredita la aceptación de transporte",
    ai_prompt:
      'Extrae: número, fecha, transportista, origen, destino. Responde solo con JSON.',
    required_fields: ["numero", "fecha", "transportista"],
    optional_fields: ["origen", "destino"],
    expiration_days: null,
    sort_order: 30,
  },
  {
    code: "DOCUMENTOS-CARGA",
    name: "Documentos de Carga",
    category: "operacional",
    description:
      "Documentos que acompañan a la carga (manifiestos, declaraciones)",
    ai_prompt:
      'Extrae: tipo documento, número, fecha, descripción carga. Responde solo con JSON.',
    required_fields: ["tipo", "numero", "fecha"],
    optional_fields: ["descripcion_carga"],
    expiration_days: null,
    sort_order: 31,
  },
  {
    code: "REGISTRO-ENTREGA",
    name: "Registro de Entrega",
    category: "operacional",
    description:
      "Comprobante de entrega firmado por destinatario",
    ai_prompt:
      'Extrae: fecha, destinatario, firma, conformidad. Responde solo con JSON.',
    required_fields: ["fecha", "destinatario", "firma"],
    optional_fields: ["conformidad"],
    expiration_days: null,
    sort_order: 32,
  },

  // CATEGORÍA 6: SUBCONTRATACIÓN (3)
  {
    code: "CONTRATOS-SUBCONTRATACION",
    name: "Contratos de Subcontratación",
    category: "subcontratacion",
    description:
      "Contratos de subcontratación de servicios de transporte",
    ai_prompt:
      'Extrae: fecha, partes, vigencia, términos principales. Responde solo con JSON.',
    required_fields: ["fecha", "partes", "vigencia"],
    optional_fields: ["terminos"],
    expiration_days: 365,
    sort_order: 33,
  },
  {
    code: "F30-1",
    name: "F-30-1 Actualizado",
    category: "subcontratacion",
    description:
      "Certificado F-30-1 de capacidad de carga del subcontratista",
    ai_prompt:
      'Extrae: número F-30-1, RUT titular, vigencia, capacidad. Responde solo con JSON.',
    required_fields: ["numeroF30_1", "rut", "fechaVencimiento"],
    optional_fields: ["capacidad"],
    expiration_days: 365,
    sort_order: 34,
  },
  {
    code: "CUMPLIMIENTO-PREVISIONAL",
    name: "Cumplimiento Previsional",
    category: "subcontratacion",
    description:
      "Certificado de cumplimiento previsional del subcontratista",
    ai_prompt:
      'Extrae: RUT, estado vigente, fecha certificado. Responde solo con JSON.',
    required_fields: ["rut", "estado", "fecha"],
    optional_fields: ["autoridad"],
    expiration_days: 90,
    sort_order: 35,
  },
];

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Insert document types
    const { error: insertError } = await supabase
      .from("document_types")
      .insert(documentTypes);

    if (insertError) {
      console.error("Error inserting document types:", insertError);
      process.exit(1);
    }

    console.log("Successfully seeded", documentTypes.length, "document types");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
