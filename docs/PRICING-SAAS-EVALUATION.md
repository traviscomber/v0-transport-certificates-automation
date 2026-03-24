# Evaluacion de Pricing SaaS - TransportDocs

## Resumen del Producto

**Plataforma de Gestion de Compliance Documental para Transporte Terrestre**

Sistema que automatiza la gestion, validacion y seguimiento de documentos obligatorios para empresas de transporte, conductores y mandantes en Chile.

---

## Costos de Infraestructura (Mensuales)

### Escenario: 100 usuarios activos

| Servicio | Plan | Costo USD | Descripcion |
|----------|------|-----------|-------------|
| Vercel | Pro | $20 | Hosting, CI/CD, Edge Functions |
| Supabase | Pro | $25 | Base de datos, Auth, Storage (8GB) |
| OpenAI API | Usage | $50-150 | OCR con GPT-4 Vision (~500 docs/mes) |
| Resend | Starter | $0-20 | Emails transaccionales |
| Sentry | Team | $26 | Monitoreo de errores |
| **Total Base** | - | **$121-241/mes** |

### Escenario: 500 usuarios activos

| Servicio | Plan | Costo USD |
|----------|------|-----------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 + $25 (storage) |
| OpenAI API | Usage | $200-400 |
| Resend | Pro | $50 |
| Sentry | Team | $26 |
| **Total** | - | **$346-546/mes** |

### Escenario: 1000+ usuarios activos

| Servicio | Plan | Costo USD |
|----------|------|-----------|
| Vercel | Enterprise | $150+ |
| Supabase | Team | $599 |
| OpenAI API | Usage | $500-1000 |
| Resend | Business | $100 |
| Sentry | Business | $80 |
| **Total** | - | **$1,429-1,929/mes** |

---

## Modelo de Pricing Propuesto

### Plan CONDUCTOR (Gratis o muy bajo costo)
**Target:** Conductores independientes

| Caracteristica | Incluido |
|----------------|----------|
| Documentos personales | 10 max |
| Alertas de vencimiento | Si |
| OCR basico | 5/mes |
| Soporte | Comunidad |
| **Precio** | **$0 USD/mes** o **$5 USD/mes** |

### Plan TRANSPORTISTA
**Target:** Empresas de transporte pequenas/medianas

| Caracteristica | Basico | Pro |
|----------------|--------|-----|
| Conductores | Hasta 10 | Hasta 50 |
| Vehiculos | Hasta 15 | Hasta 75 |
| Documentos | Ilimitados | Ilimitados |
| OCR con IA | 50/mes | 200/mes |
| Alertas email | Si | Si |
| Reportes | Basicos | Avanzados |
| Exportacion Excel | Si | Si |
| API Access | No | Si |
| Soporte | Email | Prioritario |
| **Precio** | **$49 USD/mes** | **$149 USD/mes** |

### Plan MANDANTE
**Target:** Empresas que contratan servicios de transporte

| Caracteristica | Standard | Enterprise |
|----------------|----------|------------|
| Transportistas | Hasta 20 | Ilimitados |
| Validacion docs | Si | Si |
| Dashboard compliance | Si | Avanzado |
| Bloqueo automatico | Si | Si |
| Integraciones | Basicas | Custom |
| SLA | 99% | 99.9% |
| Soporte | Email | Dedicado |
| Onboarding | Self-service | Personalizado |
| **Precio** | **$199 USD/mes** | **$499+ USD/mes** |

### Plan ENTERPRISE
**Target:** Grandes operadores logisticos

| Caracteristica | Incluido |
|----------------|----------|
| Todo de los planes anteriores | Si |
| Multi-tenancy | Si |
| SSO/SAML | Si |
| API ilimitada | Si |
| Integraciones TMS | Custom |
| Servidor dedicado | Opcional |
| SLA 99.99% | Si |
| Account Manager | Si |
| **Precio** | **Cotizacion personalizada ($1,000+ USD/mes)** |

---

## Proyeccion de Ingresos vs Costos

### Escenario Conservador (Ano 1)

| Metrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Conductores (gratis) | 50 | 150 | 300 | 500 |
| Transportistas Basico | 5 | 15 | 30 | 50 |
| Transportistas Pro | 2 | 5 | 10 | 20 |
| Mandantes Standard | 1 | 3 | 5 | 10 |
| Mandantes Enterprise | 0 | 1 | 2 | 3 |
| **Ingresos MRR** | **$692** | **$1,881** | **$3,727** | **$6,343** |
| **Costos Infra** | **$150** | **$250** | **$400** | **$600** |
| **Margen Bruto** | **78%** | **87%** | **89%** | **91%** |

### Escenario Optimista (Ano 1)

| Metrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Conductores (gratis) | 100 | 400 | 800 | 1500 |
| Transportistas Basico | 10 | 30 | 60 | 100 |
| Transportistas Pro | 5 | 15 | 30 | 50 |
| Mandantes Standard | 3 | 8 | 15 | 25 |
| Mandantes Enterprise | 1 | 3 | 5 | 10 |
| **Ingresos MRR** | **$2,182** | **$5,829** | **$11,220** | **$18,575** |

---

## Comparacion con Competencia (Chile)

| Plataforma | Precio Mensual | Comentario |
|------------|----------------|------------|
| Beetrack | $200-500+ | Mas enfocado en tracking |
| SimpliRoute | $100-300+ | Rutas, no compliance |
| TransportDocs (nosotros) | $49-499 | Especializado en compliance |
| Excel manual | $0 | Sin automatizacion |

**Ventaja competitiva:** Somos los unicos enfocados 100% en compliance documental con OCR/IA integrado.

---

## Metricas Clave para Exito

| KPI | Meta Ano 1 | Meta Ano 2 |
|-----|------------|------------|
| MRR | $10,000 | $50,000 |
| Clientes pagos | 100 | 400 |
| Churn mensual | < 5% | < 3% |
| CAC | < $100 | < $150 |
| LTV | > $600 | > $1,200 |
| LTV/CAC | > 6x | > 8x |

---

## Estrategia de Go-to-Market

### Fase 1: Validacion (Mes 1-3)
- 5-10 clientes piloto gratuitos
- Feedback intensivo
- Ajuste de producto

### Fase 2: Traccion (Mes 4-6)
- Pricing oficial
- Marketing digital basico
- Partnerships con asociaciones de transporte

### Fase 3: Crecimiento (Mes 7-12)
- Equipo de ventas
- Contenido/SEO
- Referral program

---

## Resumen Ejecutivo

| Aspecto | Valor |
|---------|-------|
| **Inversion inicial desarrollo** | $0 (ya construido en v0) |
| **Costo operacion mensual** | $150-600 USD |
| **Breakeven estimado** | 15-20 clientes pagos |
| **Precio entrada competitivo** | $49 USD/mes |
| **Precio premium justificado** | $199-499 USD/mes |
| **Margen bruto esperado** | 80-90% |
| **Modelo de negocio** | SaaS B2B con freemium |

---

*Documento generado: Marzo 2026*
*Ultima actualizacion: Post-Semana 1 MVP*
