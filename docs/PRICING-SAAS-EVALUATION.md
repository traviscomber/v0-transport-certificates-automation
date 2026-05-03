# Evaluacion de Pricing SaaS - TransportDocs

## Resumen del Producto

**Plataforma de Gestion de Compliance Documental para Transporte Terrestre**

Sistema que automatiza la gestion, validacion y seguimiento de documentos obligatorios para empresas de transporte, conductores y mandantes en Chile.

---

## Modelo de Negocio: Cobro por Vehiculo

**Principio:** Cobrar a la empresa de transporte por cada camion/vehiculo registrado en el sistema.

---

## Pricing por Vehiculo (Pesos Chilenos)

### Tabla de Precios Mensuales por Vehiculo

| Tipo de Operacion | Precio/Vehiculo | Incluye |
|-------------------|-----------------|---------|
| **Carga General** | $29.990/mes | Documentacion basica, alertas, OCR |
| **Carga Refrigerada** | $49.990/mes | + Certificados temperatura, HACCP |
| **Transporte Pasajeros** | $59.990/mes | + Certificados MTT especiales |
| **Carga Peligrosa (HAZMAT)** | $149.990/mes | + Hojas de seguridad, certificaciones especiales |
| **Carga Sobredimensionada** | $89.990/mes | + Permisos especiales MOP |

### Descuentos por Volumen

| Cantidad Vehiculos | Descuento |
|-------------------|-----------|
| 1-5 vehiculos | 0% (precio lista) |
| 6-15 vehiculos | 10% |
| 16-30 vehiculos | 15% |
| 31-50 vehiculos | 20% |
| 51-100 vehiculos | 25% |
| 100+ vehiculos | 30% (negociable) |

---

## Ejemplos de Facturacion Mensual

### Empresa Pequena (5 camiones carga general)
```
5 vehiculos x $29.990 = $149.950/mes
Sin descuento
Total: $149.950 CLP/mes (~$160 USD)
```

### Empresa Mediana (20 camiones mixtos)
```
15 camiones carga general x $29.990 = $449.850
5 camiones refrigerados x $49.990 = $249.950
Subtotal: $699.800
Descuento 15%: -$104.970
Total: $594.830 CLP/mes (~$635 USD)
```

### Empresa Grande (50 camiones con carga peligrosa)
```
30 camiones carga general x $29.990 = $899.700
15 camiones refrigerados x $49.990 = $749.850
5 camiones carga peligrosa x $149.990 = $749.950
Subtotal: $2,399.500
Descuento 20%: -$479.900
Total: $1,919.600 CLP/mes (~$2,050 USD)
```

### Operador Logistico (100+ vehiculos)
```
60 camiones carga general x $29.990 = $1,799.400
25 camiones refrigerados x $49.990 = $1,249.750
10 camiones carga peligrosa x $149.990 = $1,499.900
5 camiones sobredimensionados x $89.990 = $449.950
Subtotal: $4,999.000
Descuento 30%: -$1,499.700
Total: $3,499.300 CLP/mes (~$3,740 USD)
```

---

## Que Incluye Cada Plan

### Carga General ($29.990/vehiculo)
- Gestion de documentos del vehiculo (revision tecnica, SOAP, permiso circulacion, padron)
- Gestion de documentos del conductor asignado (licencia, antecedentes, contrato)
- Alertas de vencimiento (email + dashboard)
- OCR con IA para extraccion automatica
- Dashboard de compliance
- Reportes basicos
- Soporte por email

### Carga Refrigerada ($49.990/vehiculo)
Todo lo anterior, mas:
- Certificados de cadena de frio
- Certificacion HACCP
- Registro de temperaturas
- Certificados sanitarios
- Reportes especificos para retail/supermercados

### Transporte Pasajeros ($59.990/vehiculo)
Todo lo de carga general, mas:
- Certificados MTT especiales
- Revision tecnica especial buses
- Seguros adicionales obligatorios
- Licencias profesionales A1/A2
- Permisos de recorrido

### Carga Peligrosa - HAZMAT ($149.990/vehiculo)
Todo lo anterior, mas:
- Hojas de Seguridad (MSDS/SDS)
- Certificacion de conductor para materiales peligrosos
- Certificacion vehiculo para transporte HAZMAT
- Permisos especiales SEC/SEREMI
- Plan de emergencia obligatorio
- Seguros especiales
- Validacion con IA de documentos tecnicos
- Alertas criticas prioritarias
- Soporte prioritario 24/7

### Carga Sobredimensionada ($89.990/vehiculo)
Todo lo de carga general, mas:
- Permisos MOP
- Certificados de escolta
- Autorizaciones de ruta especifica
- Seguros adicionales

---

## Servicios Adicionales (Opcionales)

| Servicio | Precio |
|----------|--------|
| Onboarding personalizado | $199.990 (unico) |
| Integracion con TMS | $299.990 + $49.990/mes |
| API acceso ilimitado | $99.990/mes |
| Reportes personalizados | $49.990/mes |
| Usuario adicional mandante | $19.990/mes |
| Almacenamiento extra (10GB) | $9.990/mes |
| Soporte telefonico | $29.990/mes |
| SLA 99.9% garantizado | $99.990/mes |

---

## Costos de Infraestructura

### Por Vehiculo Registrado (estimado)

| Rango | Costo/Vehiculo | Margen |
|-------|----------------|--------|
| 1-100 vehiculos | ~$3.000 CLP | 90% |
| 101-500 vehiculos | ~$2.000 CLP | 93% |
| 500+ vehiculos | ~$1.500 CLP | 95% |

### Desglose Mensual (100 vehiculos)

| Servicio | Costo USD | Costo CLP |
|----------|-----------|-----------|
| Vercel Pro | $20 | $18.700 |
| Supabase Pro | $25 | $23.375 |
| OpenAI API (OCR) | $100 | $93.500 |
| Resend (emails) | $20 | $18.700 |
| Sentry | $26 | $24.310 |
| **Total** | **$191** | **$178.585** |

---

## Proyeccion de Ingresos (Ano 1)

### Escenario Conservador

| Trimestre | Vehiculos | Ingreso Prom/Veh | MRR CLP | MRR USD |
|-----------|-----------|------------------|---------|---------|
| Q1 | 50 | $35.000 | $1.750.000 | $1.870 |
| Q2 | 150 | $38.000 | $5.700.000 | $6.090 |
| Q3 | 350 | $40.000 | $14.000.000 | $14.960 |
| Q4 | 600 | $42.000 | $25.200.000 | $26.930 |

### Escenario Optimista

| Trimestre | Vehiculos | MRR CLP | MRR USD |
|-----------|-----------|---------|---------|
| Q1 | 100 | $3.500.000 | $3.740 |
| Q2 | 300 | $12.000.000 | $12.820 |
| Q3 | 700 | $28.000.000 | $29.930 |
| Q4 | 1.200 | $50.400.000 | $53.860 |

---

## Comparacion con Costo Manual

### Costo de NO usar TransportDocs

| Item | Costo Mensual |
|------|---------------|
| Administrativo dedicado (medio tiempo) | $400.000 |
| Multas por documentos vencidos (promedio) | $200.000 |
| Bloqueos en mandantes (lucro cesante) | $500.000+ |
| Tiempo perdido en busqueda de docs | $150.000 |
| **Costo total estimado** | **$1.250.000+/mes** |

### ROI para Cliente

| Flota | Costo TransportDocs | Ahorro Estimado | ROI |
|-------|---------------------|-----------------|-----|
| 5 camiones | $149.950 | $300.000 | 2x |
| 20 camiones | $594.830 | $800.000 | 1.3x |
| 50 camiones | $1.919.600 | $2.500.000 | 1.3x |

---

## Estrategia de Entrada al Mercado

### Fase Piloto (Mes 1-2)
- 3-5 empresas piloto GRATIS
- Feedback intensivo
- Casos de estudio

### Fase Lanzamiento (Mes 3-4)
- Precio especial early adopter: 50% descuento primer ano
- Meta: 50 vehiculos pagando

### Fase Crecimiento (Mes 5-12)
- Precio lista completo
- Partnerships con asociaciones (Chile Transportes, CNTC)
- Referral: 1 mes gratis por cada cliente referido

---

## Resumen Ejecutivo

| Aspecto | Valor |
|---------|-------|
| **Modelo** | Cobro por vehiculo mensual |
| **Precio minimo** | $29.990 CLP/vehiculo (~$32 USD) |
| **Precio maximo** | $149.990 CLP/vehiculo (~$160 USD) |
| **Margen bruto** | 90-95% |
| **Breakeven** | ~50 vehiculos |
| **Ticket promedio esperado** | $40.000 CLP/vehiculo |
| **Meta Ano 1** | 600 vehiculos = $25M CLP MRR |

---

*Tipo de cambio referencia: 1 USD = 935 CLP*
*Documento actualizado: Marzo 2026*
