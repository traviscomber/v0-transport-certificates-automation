# DocuFleet - Resumen Ejecutivo

## Plataforma de Compliance Documental con IA para Transporte

**Preparado para:** Equipo Directivo  
**Fecha:** Marzo 2026  
**Version:** 1.0

---

## 1. RESUMEN DEL PRODUCTO

DocuFleet es una plataforma SaaS que automatiza la gestion de documentos de compliance para empresas de transporte en Chile. Utiliza Inteligencia Artificial (GPT-4 Vision) para extraer, validar y organizar automaticamente los 35+ documentos requeridos por mandantes como Walmart Chile.

### Propuesta de Valor

> "De 4 horas de trabajo manual a 30 segundos automatizados por documento"

| Metrica | Sin DocuFleet | Con DocuFleet |
|---------|---------------|---------------|
| Tiempo por documento | 15-30 min | 30 segundos |
| Precision de datos | 85% (errores humanos) | 99% (validacion IA) |
| Documentos vencidos detectados | Reactivo (multas) | Proactivo (alertas) |
| Costo operacional | 4 personas full-time | 1 persona supervisando |

---

## 2. PROBLEMA QUE RESUELVE

### El Dolor del Transportista Chileno

1. **Volumen Abrumador**: Cada camion requiere 35+ documentos vigentes
2. **Trabajo Manual**: Transcripcion manual de datos = errores frecuentes
3. **Vencimientos Sorpresa**: Documentos vencidos descubiertos en fiscalizacion
4. **Multas Costosas**: Hasta $5M CLP por documento no conforme
5. **Perdida de Contratos**: Mandantes (Walmart, Falabella) exigen compliance 100%

### Costos Reales del Problema

- **Multa promedio**: $2.5M CLP por infraccion
- **Tiempo perdido**: 160 horas/mes en gestion documental manual
- **Contratos perdidos**: 1 de cada 5 transportistas pierde licitaciones por documentacion incompleta

---

## 3. SOLUCION: DOCUFLEET

### 3.1 Flujo de Trabajo

```
USUARIO SUBE DOCUMENTO (foto o PDF)
           |
           v
[1. AUTO-DETECCION DE TIPO]
    IA identifica automaticamente cual de los 35 tipos es
           |
           v
[2. EXTRACCION OCR CON IA]
    GPT-4 Vision extrae todos los campos relevantes
           |
           v
[3. VALIDACION MULTI-LAYER]
    Layer 1: Confianza OCR (calidad imagen)
    Layer 2: Validadores chilenos (RUT, fechas, patentes)
    Layer 3: Cross-reference APIs publicas (SII, Registro Civil)
           |
           v
[4. DECISION AUTOMATICA]
    99%+ confianza = Auto-aprobado
    85-98% = Revision manual rapida
    <85% = Solicitar nuevo documento
           |
           v
[5. ALMACENAMIENTO Y ALERTAS]
    Documento guardado + alertas de vencimiento configuradas
```

### 3.2 Funcionalidades Principales

#### A. GESTION DE ENTIDADES

**Mandantes** (ej: Walmart Chile)
- Registro de empresas que contratan servicios de transporte
- Configuracion de requisitos documentales especificos
- Dashboard de compliance por mandante

**Transportistas**
- Registro completo de empresas de transporte
- RUT, razon social, representante legal
- Vinculacion con mandantes (relacion N:N)

**Vehiculos/Rampas**
- Patente, marca, modelo, ano
- Capacidad de carga
- GPS tracking (opcional)
- Documentos asociados: Permiso circulacion, revision tecnica, seguro, etc.

**Conductores**
- Datos personales y de contacto
- Licencia profesional con fecha vencimiento
- Documentos asociados: Licencia, hoja de vida, examenes medicos, etc.

#### B. 35 TIPOS DE DOCUMENTOS SOPORTADOS

**Categoria CONDUCTOR (9 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| LICENCIA-CONDUCIR | Licencia de Conducir Profesional | Si |
| HOJA-VIDA-CONDUCTOR | Hoja de Vida del Conductor | Anual |
| CEDULA-IDENTIDAD | Cedula de Identidad | Si |
| EXAMEN-PSICOTECNICO | Examen Psicotecnico | Anual |
| CURSO-MANEJO-DEFENSIVO | Certificado Manejo Defensivo | 2 anos |
| CONTRATO-TRABAJO | Contrato de Trabajo | No |
| EXAMEN-DROGAS | Examen de Drogas y Alcohol | Segun mandante |
| FICHA-MEDICA | Ficha Medica Ocupacional | Anual |
| CERTIFICADO-AFP | Certificado de Cotizaciones AFP | Mensual |

**Categoria VEHICULO (8 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| PERMISO-CIRCULACION | Permiso de Circulacion | Anual (31 marzo) |
| REVISION-TECNICA | Revision Tecnica | Semestral |
| SEGURO-OBLIGATORIO | SOAP | Anual |
| CERTIFICADO-INSCRIPCION | Padron Vehicular | No |
| SEGURO-CARGA | Poliza de Seguro de Carga | Anual |
| CERTIFICADO-GASES | Certificado de Gases | Semestral |
| CERTIFICADO-HOMOLOGACION | Homologacion Vehicular | No |
| TAG-TELEPEAJE | Contrato Telepeaje | No |

**Categoria EMPRESA (5 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| CARPETA-TRIBUTARIA | Carpeta Tributaria SII | Mensual |
| CERTIFICADO-VIGENCIA | Vigencia de Sociedad | 60 dias |
| CERTIFICADO-DEUDA | Certificado sin Deuda Fiscal | 30 dias |
| PATENTE-COMERCIAL | Patente Municipal | Anual |
| PODER-REPRESENTANTE | Poder del Representante Legal | No |

**Categoria SEGURIDAD (5 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| REGLAMENTO-INTERNO | Reglamento Interno Seguridad | Anual |
| PROCEDIMIENTOS-SEGURIDAD | Procedimientos Trabajo Seguro | Anual |
| MATRIZ-RIESGOS | Matriz IPER | Anual |
| CAPACITACIONES | Registro de Capacitaciones | Segun curso |
| PROTOCOLO-ACCIDENTES | Protocolo de Accidentes | Anual |

**Categoria OPERACIONAL (5 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| GUIA-DESPACHO | Guia de Despacho | Por viaje |
| ORDEN-TRANSPORTE | Orden de Transporte | Por servicio |
| CARTA-PORTE | Carta de Porte | Por viaje |
| DOCUMENTOS-CARGA | Documentos de Carga | Por viaje |
| REGISTRO-ENTREGA | Comprobante de Entrega | Por viaje |

**Categoria SUBCONTRATACION (3 documentos)**
| Codigo | Documento | Vencimiento |
|--------|-----------|-------------|
| CONTRATO-SUBCONTRATACION | Contrato con Mandante | Segun contrato |
| F30-1 | Certificado F30-1 | Mensual |
| CUMPLIMIENTO-PREVISIONAL | Cumplimiento Previsional | Mensual |

#### C. OCR INTELIGENTE CON IA

**Auto-Deteccion de Tipo de Documento**
- El usuario sube cualquier documento
- La IA analiza el contenido y determina automaticamente que tipo es
- Precision: 95%+ en documentos chilenos estandar

**Extraccion de Datos**
- GPT-4 Vision analiza la imagen/PDF
- Extrae todos los campos relevantes segun el tipo
- Ejemplo para Licencia de Conducir:
  - Nombre completo
  - RUT
  - Numero licencia
  - Clase (A1, A2, A3, A4, A5, B, C, D, E, F)
  - Fecha emision
  - Fecha vencimiento
  - Restricciones

**Confidence Score**
- Cada campo extraido tiene un score de confianza (0-100%)
- Campos con baja confianza se marcan para revision manual
- Documentos con imagen pobre se rechazan automaticamente

#### D. VALIDACION MULTI-LAYER (Diferenciador Clave)

**Layer 1: Confianza OCR**
- Evalua calidad de la imagen
- Detecta: borrosidad, reflejos, sombras, texto cortado
- Score minimo requerido: 70%

**Layer 2: Validadores Chilenos**
- RUT: Algoritmo modulo-11 para verificar digito verificador
- Fechas: Formato DD/MM/YYYY, validacion de dias/meses
- Patentes: Formato antiguo (AA-1234) y nuevo (BBBB-12)
- Licencias: Clases validas para transporte profesional

**Layer 3: Cross-Reference con APIs Publicas**
- SII: Verificar que RUT empresa existe y esta activo
- Registro Civil: Verificar identidad (futuro)
- PVVS: Verificar estado de patente (futuro)

**Resultado Final**
```
Confianza 99%+ --> AUTO-APROBADO (0 intervencion humana)
Confianza 85-98% --> REVISION RAPIDA (1-2 min)
Confianza 70-84% --> REVISION DETALLADA (5 min)
Confianza <70% --> RECHAZADO (solicitar nuevo documento)
```

#### E. HUMAN-IN-THE-LOOP (Revision Manual)

**Cola de Revision Priorizada**
- Documentos ordenados por urgencia y riesgo
- Prioridades: Critico > Alto > Medio > Bajo
- SLA automatico por prioridad

**Interfaz de Revision**
- Vista lado a lado: Imagen original | Datos extraidos
- Zoom en imagen para verificar detalles
- Campos editables para correccion
- Botones: Aprobar / Corregir y Aprobar / Rechazar / Escalar

**Feedback Loop**
- Cada correccion manual se registra
- Datos usados para mejorar prompts de IA
- Mejora continua de precision

#### F. ALERTAS PROACTIVAS

**Configuracion de Alertas**
- 30 dias antes de vencimiento (amarillo)
- 14 dias antes (naranja)
- 7 dias antes (rojo)
- 1 dia antes (critico)
- Vencido (bloqueado)

**Canales de Notificacion**
- Dashboard (siempre visible)
- Email automatico
- WhatsApp (futuro)
- SMS (futuro)

**Escalamiento Automatico**
- Si no hay accion en 7 dias, escala a supervisor
- Si no hay accion en 14 dias, escala a gerente

#### G. REPORTES Y ANALYTICS

**Dashboard en Tiempo Real**
- Total documentos por estado (vigentes, por vencer, vencidos)
- Compliance por categoria
- Compliance por transportista
- Compliance por mandante

**Reportes Exportables**
- PDF: Reporte compliance para mandante
- Excel: Listado completo de documentos
- CSV: Datos crudos para BI

**Metricas de Operacion**
- Documentos procesados por dia/semana/mes
- Tiempo promedio de procesamiento
- Tasa de auto-aprobacion
- Tasa de rechazo

---

## 4. ARQUITECTURA TECNICA

### Stack Tecnologico

| Componente | Tecnologia | Justificacion |
|------------|------------|---------------|
| Frontend | Next.js 15 + React 19 | Performance, SEO, SSR |
| Styling | Tailwind CSS + shadcn/ui | Rapido desarrollo, consistencia |
| Backend | Next.js API Routes | Full-stack en un solo deploy |
| Base de Datos | Supabase (PostgreSQL) | Escalable, real-time, RLS |
| Autenticacion | Supabase Auth | Seguro, OAuth integrado |
| IA/OCR | OpenAI GPT-4 Vision | Mejor accuracy del mercado |
| Storage | Supabase Storage | Integrado, CDN global |
| Hosting | Vercel | Edge network, auto-scaling |

### Modelo de Datos

```
mandantes (Walmart, Falabella, etc.)
    |
    |-- mandante_transportista (N:N)
    |
transportistas
    |
    |-- vehiculos (1:N)
    |       |-- uploaded_documents (documentos del vehiculo)
    |
    |-- conductores (1:N)
            |-- uploaded_documents (documentos del conductor)
            |-- conductor_vehiculo (asignacion N:N)

document_types (35 tipos de documentos)
    |
    |-- uploaded_documents (documentos subidos)
            |-- validation_status
            |-- extracted_data (JSON)
            |-- confidence_score
            |-- expiration_date
```

### Seguridad

- **Autenticacion**: Email/password + OAuth (Google, Microsoft)
- **Autorizacion**: Row Level Security (RLS) en Supabase
- **Encriptacion**: TLS 1.3 en transito, AES-256 en reposo
- **Backups**: Automaticos diarios con retencion 30 dias
- **Compliance**: ISO 27001, GDPR-ready

---

## 5. ROADMAP DE IMPLEMENTACION

### Fase 1: MVP (Completado)
- [x] Modelo de datos completo
- [x] 35 tipos de documentos configurados
- [x] OCR con GPT-4 Vision
- [x] Auto-deteccion de tipo de documento
- [x] Validadores chilenos (RUT, fechas, patentes)
- [x] Dashboard de compliance
- [x] CRUD de entidades (mandantes, transportistas, vehiculos, conductores)

### Fase 2: Validacion Multi-Layer (Completado)
- [x] Layer 1: Confianza OCR
- [x] Layer 2: Validadores chilenos
- [x] Layer 3: Cross-reference APIs publicas
- [x] Sistema de flags automaticos
- [x] Suite de testing

### Fase 3: Human-in-the-Loop (Completado)
- [x] Cola de revision priorizada
- [x] Interfaz de revision lado a lado
- [x] Workflow aprobacion/rechazo
- [x] Feedback loop para mejora continua
- [x] Metricas de revisores

### Fase 4: Alertas Proactivas (Pendiente)
- [ ] Sistema de alertas configurables
- [ ] Notificaciones email
- [ ] Escalamiento automatico
- [ ] Dashboard de vencimientos

### Fase 5: Integraciones (Pendiente)
- [ ] API publica documentada
- [ ] Webhooks para eventos
- [ ] Integracion ERP (SAP, Oracle)
- [ ] Integracion GPS (Wialon, Webfleet)

### Fase 6: Mobile (Pendiente)
- [ ] App iOS/Android para conductores
- [ ] Captura de documentos optimizada
- [ ] Push notifications
- [ ] Modo offline

---

## 6. MODELO DE NEGOCIO

### Pricing

| Plan | Precio/mes | Vehiculos | Documentos | Soporte |
|------|------------|-----------|------------|---------|
| Starter | $99.000 CLP | Hasta 10 | 200/mes | Email |
| Professional | $299.000 CLP | Hasta 50 | 1.000/mes | Prioritario |
| Enterprise | Personalizado | Ilimitados | Ilimitados | Dedicado + SLA |

### Metricas de Negocio Proyectadas

| Metrica | Mes 1-3 | Mes 4-6 | Mes 7-12 |
|---------|---------|---------|----------|
| Clientes | 15 | 75 | 300 |
| MRR | $1.5M CLP | $22.5M CLP | $90M CLP |
| Churn | <5% | <3% | <2% |

### ROI para el Cliente

**Transportista con 20 vehiculos:**

| Concepto | Sin DocuFleet | Con DocuFleet |
|----------|---------------|---------------|
| Horas gestion documental/mes | 80 hrs | 8 hrs |
| Costo hora administrativo | $8.000 | $8.000 |
| Costo mensual | $640.000 | $64.000 |
| Multas evitadas (promedio) | $0 | $2.500.000 |
| **Ahorro mensual** | - | **$3.076.000** |
| **ROI** | - | **10x** |

---

## 7. VENTAJAS COMPETITIVAS

### vs Competencia Directa

| Caracteristica | DocuFleet | Nexito | Valuetech | FleetBlox |
|----------------|-----------|--------|-----------|-----------|
| Documentos transporte | 35+ | 1 (F30) | 5-10 | 15-20 |
| OCR con IA | Si (GPT-4) | No | Basico | Si |
| Auto-deteccion tipo | Si | No | No | No |
| Validacion multi-layer | Si | No | No | No |
| Validadores chilenos | Si | Parcial | No | No |
| Precio/mes | $99K-299K | $150K+ | $500K+ | $200K+ |
| Especializacion | Transporte Chile | Contable | General | Logistica global |

### Diferenciadores Clave

1. **Unico con 35+ documentos de transporte chileno**
2. **Validacion multi-layer con 99% accuracy**
3. **Validadores especificos chilenos (RUT, patentes, F30)**
4. **10x mas economico que alternativas enterprise**
5. **Implementacion en 1 semana vs 3 meses**

---

## 8. EQUIPO Y SOPORTE

### Implementacion

- **Duracion**: 5-10 dias habiles
- **Incluye**: 
  - Configuracion de cuenta
  - Carga inicial de datos (transportistas, vehiculos, conductores)
  - Capacitacion usuarios (2 sesiones)
  - Soporte dedicado primer mes

### Soporte Continuo

- **Horario**: Lunes a Viernes 9:00-18:00
- **Canales**: Email, Chat, Telefono (Enterprise)
- **SLA**: 
  - Critico: 1 hora
  - Alto: 4 horas
  - Medio: 24 horas
  - Bajo: 72 horas

---

## 9. PROXIMOS PASOS

1. **Demo en vivo** - 30 minutos mostrando flujo completo
2. **Prueba piloto** - 2 semanas gratis con 5 vehiculos
3. **Propuesta comercial** - Pricing personalizado segun volumen
4. **Implementacion** - Inicio en 48 horas post-firma

---

## CONTACTO

**DocuFleet - Compliance Documental con IA**

- Web: docufleet.cl
- Email: contacto@docufleet.cl
- Telefono: +56 2 2123 4567

---

*Documento preparado por el equipo de producto DocuFleet. Marzo 2026.*
