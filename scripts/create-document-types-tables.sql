-- Create document_types table for Walmart Chile OCR Portal
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  ai_prompt TEXT NOT NULL,
  required_fields JSONB DEFAULT '[]'::jsonb,
  optional_fields JSONB DEFAULT '[]'::jsonb,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  expiration_days INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create uploaded_documents table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id) ON DELETE RESTRICT,
  original_filename VARCHAR(255),
  file_url TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  confidence_score FLOAT DEFAULT 0.0,
  validation_status VARCHAR(50) DEFAULT 'pending',
  validation_notes TEXT,
  expiration_date DATE,
  auto_detected BOOLEAN DEFAULT false,
  detection_confidence FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_document_types_category ON document_types(category);
CREATE INDEX idx_document_types_code ON document_types(code);
CREATE INDEX idx_uploaded_documents_transporter ON uploaded_documents(transporter_id);
CREATE INDEX idx_uploaded_documents_type ON uploaded_documents(document_type_id);
CREATE INDEX idx_uploaded_documents_status ON uploaded_documents(validation_status);
CREATE INDEX idx_uploaded_documents_expiration ON uploaded_documents(expiration_date);
CREATE INDEX idx_uploaded_documents_created ON uploaded_documents(created_at);

-- Enable RLS
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "document_types_select" ON document_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "uploaded_documents_select" ON uploaded_documents
  FOR SELECT USING (auth.uid() = transporter_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "uploaded_documents_insert" ON uploaded_documents
  FOR INSERT WITH CHECK (auth.uid() = transporter_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "uploaded_documents_update" ON uploaded_documents
  FOR UPDATE USING (auth.uid() = transporter_id OR auth.jwt() ->> 'role' = 'admin');

-- Insert document_types for Walmart Chile
INSERT INTO document_types (code, name, category, description, ai_prompt, required_fields, optional_fields, expiration_days, sort_order) VALUES
-- CATEGORÍA 1: EMPRESA (5)
('RUT-EMPRESA', 'RUT Empresa', 'empresa', 'Registro Único Tributario de la empresa transportista', 'Extrae el RUT y datos de la empresa desde este documento chileno. RUT formato: XX.XXX.XXX-X', '["rut","razonSocial","estado"]', '["digito_verificador"]', NULL, 1),
('ESCRITURA-CONSTITUCION', 'Escritura de Constitución', 'empresa', 'Documento notarial de constitución de la empresa', 'Extrae datos de la escritura de constitución: fecha, notario, socios, capital inicial', '["fecha","notario","socios"]', '["capital","observaciones"]', 365, 2),
('CERTIFICADO-VIGENCIA', 'Certificado de Vigencia', 'empresa', 'Certificado de vigencia del registro comercial', 'Extrae estado vigente de la empresa y fecha del certificado', '["estado","fechaCertificado"]', '["camara_comercio"]', 90, 3),
('PODER-REPRESENTANTE', 'Poder del Representante', 'empresa', 'Documento notarial otorgando poderes al representante legal', 'Extrae datos del poder: representante, alcance, fecha de otorgamiento', '["representante","alcance","fecha"]', '["notario"]', 365, 4),
('CEDULA-REPRESENTANTE', 'Cédula Representante Legal', 'empresa', 'Cédula de identidad del representante legal de la empresa', 'Extrae datos de la cédula chilena del representante', '["rut","nombre","fecha_nacimiento"]', '["sexo","nacionalidad"]', NULL, 5),

-- CATEGORÍA 2: CONDUCTOR (9)
('CEDULA-IDENTIDAD', 'Cédula de Identidad', 'conductor', 'Cédula de identidad chilena del conductor', 'Analiza esta CÉDULA DE IDENTIDAD CHILENA y extrae los datos. IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin backticks, sin explicaciones adicionales. CAMPOS A EXTRAER: rut, nombreCompleto, nombre, apellidos, fechaNacimiento, sexo, fechaEmision, fechaVencimiento. Si no puedes leer un campo claramente, OMÍTELO del JSON.', '["rut","nombreCompleto","fechaNacimiento"]', '["sexo","nacionalidad"]', NULL, 6),
('LICENCIA-CONDUCIR', 'Licencia de Conducir Profesional', 'conductor', 'Licencia profesional A-4 o A-5 para transporte de carga', 'Extrae datos de licencia profesional chilena: RUT, clase (A-4/A-5), vigencia, restricciones', '["rut","clase","fechaVencimiento"]', '["restricciones","observaciones"]', 365, 7),
('HOJA-VIDA', 'Hoja de Vida', 'conductor', 'Curriculum vitae o hoja de vida del conductor', 'Extrae datos laborales: experiencia en transporte, antecedentes profesionales, referencias', '["nombre","experiencia"]', '["referencias","capacitaciones"]', NULL, 8),
('CERTIFICADO-ANTECEDENTES', 'Certificado de Antecedentes', 'conductor', 'Certificado de antecedentes penales expedido por PDI/Carabineros', 'Extrae: fecha expedición, estado, autoridad emisora', '["fecha","estado","autoridad"]', '["observaciones"]', 365, 9),
('INHABILIDADES-MENORES', 'Inhabilidades Menores', 'conductor', 'Certificado de no tener inhabilidades menores para conducir', 'Extrae: estado, fecha de expedición, validez', '["estado","fecha"]', '["autoridad"]', 180, 10),
('CONTRATO-TRABAJO', 'Contrato de Trabajo', 'conductor', 'Contrato laboral firmado entre empresa y conductor', 'Extrae: fechas de vigencia, salario, condiciones, ambas firmas', '["fechaInicio","ambas_firmas"]', '["salario","condiciones"]', 365, 11),
('CERTIFICADO-AFP', 'Certificado AFP', 'conductor', 'Certificado de afiliación a fondo de pensiones', 'Extrae: AFP, número de afiliación, estado de cotizaciones', '["AFP","numeroAfiliacion","estado"]', '["ultimas_cotizaciones"]', 180, 12),
('CERTIFICADO-SALUD', 'Certificado de Salud', 'conductor', 'Certificado de salud válido para conducir', 'Extrae: fecha, vigencia, estado de salud apto', '["fecha","vigencia","estado"]', '["examinador"]', 365, 13),
('EXAMEN-PREOCUPACIONAL', 'Examen Preocupacional', 'conductor', 'Examen médico ocupacional requerido por ley', 'Extrae: fecha, resultado apto/no apto, médico', '["fecha","resultado"]', '["medico","recomendaciones"]', 365, 14),

-- CATEGORÍA 3: VEHÍCULO (8)
('PADRON-INSCRIPCION', 'Padrón/Certificado Inscripción', 'vehiculo', 'Certificado de inscripción del vehículo en registro de vehículos motorizados', 'Extrae: patente, VIN, marca, modelo, año, propietario', '["patente","vin","marca","modelo","ano"]', '["propietario","color"]', NULL, 15),
('PERMISO-CIRCULACION', 'Permiso de Circulación', 'vehiculo', 'Permiso municipal de circulación del vehículo', 'Extrae: patente, vigencia, estado, municipalidad', '["patente","fechaVencimiento"]', '["municipio","estado"]', 365, 16),
('REVISION-TECNICA', 'Revisión Técnica', 'vehiculo', 'Certificado de revisión técnica del vehículo', 'Extrae: patente, fecha, estado apto/no apto, próxima revisión', '["patente","fecha","estado"]', '["proxima_revision"]', 365, 17),
('CERTIFICADO-EMISIONES', 'Certificado de Emisiones', 'vehiculo', 'Certificado de control de emisiones contaminantes', 'Extrae: patente, fecha, estado, norma cumplida', '["patente","fecha","estado"]', '["norma"]', 365, 18),
('SEGURO-SOAP', 'Seguro SOAP', 'vehiculo', 'Póliza de Seguro Obligatorio de Accidentes de Pasajeros', 'Extrae: patente, vigencia, asegurador, número póliza', '["patente","fechaVencimiento","asegurador"]', '["numeroPóliza"]', 365, 19),
('SEGURO-CARGA', 'Seguro de Carga', 'vehiculo', 'Seguro de responsabilidad civil para carga transportada', 'Extrae: patente, cobertura, vigencia, asegurador', '["patente","cobertura","fechaVencimiento"]', '["asegurador","numeroPóliza"]', 365, 20),
('SEGURO-RESPONSABILIDAD', 'Seguro Responsabilidad Civil', 'vehiculo', 'Seguro de responsabilidad civil del vehículo', 'Extrae: patente, cobertura, vigencia, límites', '["patente","cobertura","fechaVencimiento"]', '["asegurador"]', 365, 21),
('FOTOGRAFIA-GPS', 'Fotografía + GPS', 'vehiculo', 'Fotografía frontal y lateral del vehículo + coordenadas GPS', 'Extrae: patente visible, estado, coordenadas GPS si están presentes', '["patente","imagen_frontal"]', '["coordenadas_gps"]', NULL, 22),

-- CATEGORÍA 4: SEGURIDAD (5)
('REGLAMENTO-INTERNO', 'Reglamento Interno', 'seguridad', 'Reglamento interno de la empresa transportista', 'Extrae: fecha de aprobación, versión, cobertura de seguridad', '["fecha","version"]', '["contenido_seguridad"]', 365, 23),
('PROCEDIMIENTOS-SEGURIDAD', 'Procedimientos Trabajo Seguro', 'seguridad', 'Procedimientos documentados de trabajo seguro', 'Extrae: fecha vigencia, áreas cubiertas, responsables', '["fecha","areas_cubiertas"]', '["responsables"]', 365, 24),
('MATRIZ-RIESGOS', 'Matriz de Riesgos', 'seguridad', 'Matriz de identificación y evaluación de riesgos laborales', 'Extrae: fecha, riesgos identificados, niveles, controles', '["fecha","riesgos_identificados"]', '["niveles","controles"]', 365, 25),
('CAPACITACIONES', 'Capacitaciones', 'seguridad', 'Registros de capacitaciones de seguridad realizadas', 'Extrae: fecha, tema, personal capacitado, certificador', '["fecha","tema"]', '["personal_capacitado","certificador"]', 180, 26),
('PROTOCOLOS-ACCIDENTES', 'Protocolos de Accidentes', 'seguridad', 'Procedimientos y protocolos ante accidentes', 'Extrae: fecha, versión, cobertura de tipos de accidentes', '["fecha","version"]', '["tipos_accidentes"]', 365, 27),

-- CATEGORÍA 5: OPERACIONAL (5)
('GUIA-DESPACHO', 'Guía de Despacho', 'operacional', 'Guía de despacho de carga transportada', 'Extrae: número, fecha, origen, destino, carga, firma', '["numero","fecha","origen","destino"]', '["carga"]', NULL, 28),
('ORDEN-TRANSPORTE', 'Orden de Transporte', 'operacional', 'Orden de transporte emitida por cliente', 'Extrae: número, fecha, origen, destino, cliente', '["numero","fecha","origen","destino"]', '["cliente"]', NULL, 29),
('CARTA-PORTE', 'Carta de Porte', 'operacional', 'Documento que acredita la aceptación de transporte', 'Extrae: número, fecha, transportista, origen, destino', '["numero","fecha","transportista"]', '["origen","destino"]', NULL, 30),
('DOCUMENTOS-CARGA', 'Documentos de Carga', 'operacional', 'Documentos que acompañan a la carga (manifiestos, declaraciones)', 'Extrae: tipo documento, número, fecha, descripción carga', '["tipo","numero","fecha"]', '["descripcion_carga"]', NULL, 31),
('REGISTRO-ENTREGA', 'Registro de Entrega', 'operacional', 'Comprobante de entrega firmado por destinatario', 'Extrae: fecha, destinatario, firma, conformidad', '["fecha","destinatario","firma"]', '["conformidad"]', NULL, 32),

-- CATEGORÍA 6: SUBCONTRATACIÓN (3)
('CONTRATOS-SUBCONTRATACION', 'Contratos de Subcontratación', 'subcontratacion', 'Contratos de subcontratación de servicios de transporte', 'Extrae: fecha, partes, vigencia, términos principales', '["fecha","partes","vigencia"]', '["terminos"]', 365, 33),
('F30-1', 'F-30-1 Actualizado', 'subcontratacion', 'Certificado F-30-1 de capacidad de carga del subcontratista', 'Extrae: número F-30-1, RUT titular, vigencia, capacidad', '["numeroF30_1","rut","fechaVencimiento"]', '["capacidad"]', 365, 34),
('CUMPLIMIENTO-PREVISIONAL', 'Cumplimiento Previsional', 'subcontratacion', 'Certificado de cumplimiento previsional del subcontratista', 'Extrae: RUT, estado vigente, fecha certificado', '["rut","estado","fecha"]', '["autoridad"]', 90, 35);

-- Create view for cumplimiento status
CREATE OR REPLACE VIEW document_compliance_status AS
SELECT 
  ud.transporter_id,
  ud.document_type_id,
  dt.code,
  dt.name,
  dt.category,
  COUNT(*) as total_documents,
  SUM(CASE WHEN ud.validation_status = 'validated' THEN 1 ELSE 0 END) as validated_documents,
  SUM(CASE WHEN ud.expiration_date < NOW()::date THEN 1 ELSE 0 END) as expired_documents,
  MAX(ud.created_at) as last_uploaded,
  MAX(ud.validated_at) as last_validated
FROM uploaded_documents ud
LEFT JOIN document_types dt ON ud.document_type_id = dt.id
GROUP BY ud.transporter_id, ud.document_type_id, dt.code, dt.name, dt.category;
