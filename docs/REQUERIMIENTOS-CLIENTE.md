# Requerimientos de Información del Cliente

## Documento de Solicitud de Información para Implementación

**Proyecto:** Sistema de Gestión de Compliance Documental para Transporte  
**Duración:** 12 semanas  
**Versión:** 1.0

---

## Resumen Ejecutivo

Este documento detalla toda la información, archivos, flujos y datos que necesitamos recibir del cliente para implementar exitosamente el sistema en 12 semanas. La entrega oportuna de esta información es crítica para cumplir con los hitos del proyecto.

---

## Cronograma de Entrega de Información

| Semana | Información Requerida | Fecha Límite | Prioridad |
|--------|----------------------|--------------|-----------|
| 1 | Estructura organizacional, usuarios, roles | Día 3 | CRÍTICA |
| 1-2 | Catálogo de documentos, ejemplos, plantillas | Día 7 | CRÍTICA |
| 2-3 | Flujos de trabajo actuales, reglas de negocio | Día 14 | ALTA |
| 3-4 | Datos maestros (conductores, vehículos, etc.) | Día 21 | ALTA |
| 4-5 | Integraciones existentes, APIs terceros | Día 28 | MEDIA |
| 6+ | Feedback iterativo, ajustes, validaciones | Continuo | MEDIA |

---

## 1. INFORMACIÓN ORGANIZACIONAL

### 1.1 Estructura de la Empresa
- [ ] Organigrama de la empresa
- [ ] Lista de sucursales/sedes con direcciones
- [ ] Estructura de departamentos involucrados
- [ ] Horarios de operación por sede

### 1.2 Usuarios del Sistema
Entregar en formato Excel con las siguientes columnas:

```
| Nombre Completo | Email | RUT/ID | Cargo | Departamento | Rol Sistema | Sede |
```

**Roles del Sistema:**
- `admin` - Administrador general
- `dispatcher` - Despachador/Jefe de flota
- `driver` - Conductor
- `auditor` - Auditor/Compliance
- `viewer` - Solo lectura

### 1.3 Jerarquías y Permisos
- [ ] Matriz de permisos por rol (qué puede ver/editar cada rol)
- [ ] Flujo de aprobaciones (quién aprueba qué)
- [ ] Límites de autorización por cargo

---

## 2. CATÁLOGO DE DOCUMENTOS

### 2.1 Lista de Documentos Requeridos
Entregar Excel con:

```
| Código | Nombre Documento | Categoría | Obligatorio | Frecuencia Renovación | Entidad Emisora | Aplica A |
```

**Categorías sugeridas:**
- Empresa (constitución, permisos, seguros corporativos)
- Conductor (licencias, certificados médicos, antecedentes)
- Vehículo (permisos circulación, revisiones técnicas, seguros)
- Operacional (guías despacho, manifiestos, contratos)
- Seguridad (cursos, certificaciones, EPP)
- Subcontratación (contratos, certificados Ley 20.123)

### 2.2 Ejemplos de Documentos (CRÍTICO)
Necesitamos **ejemplos reales o mockups** de cada tipo de documento:

**Formato:** PDF, JPG, PNG (resolución mínima 300 DPI)

| Documento | Cantidad Ejemplos | Formato | Notas |
|-----------|------------------|---------|-------|
| Licencia de conducir | 3-5 ejemplos | JPG/PDF | Diferentes clases |
| Revisión técnica | 3-5 ejemplos | JPG/PDF | Vigentes y vencidas |
| Permiso circulación | 3-5 ejemplos | JPG/PDF | |
| Seguro obligatorio | 3-5 ejemplos | PDF | |
| Certificado antecedentes | 3-5 ejemplos | PDF | |
| Hoja de vida conductor | 2-3 ejemplos | PDF | |
| Contrato de trabajo | 2-3 ejemplos | PDF | Anonimizados |
| Guía de despacho | 5-10 ejemplos | PDF | |
| Factura electrónica | 3-5 ejemplos | PDF/XML | |
| Certificado Ley 20.123 | 2-3 ejemplos | PDF | |

### 2.3 Plantillas de Documentos Internos
- [ ] Plantillas de contratos
- [ ] Plantillas de checklist de seguridad
- [ ] Plantillas de reportes internos
- [ ] Formatos de actas y registros

---

## 3. DATOS MAESTROS

### 3.1 Conductores
Entregar Excel con:

```
| RUT | Nombre | Apellido | Email | Teléfono | Fecha Nacimiento | Dirección | Tipo Licencia | Vencimiento Licencia | Fecha Ingreso | Estado |
```

### 3.2 Vehículos
Entregar Excel con:

```
| Patente | Marca | Modelo | Año | Tipo | Capacidad | VIN | Venc. Revisión Técnica | Venc. Permiso Circulación | Venc. Seguro | Estado | Conductor Asignado |
```

**Tipos de vehículo:**
- Camión
- Tracto camión
- Semi-remolque
- Furgón
- Camioneta
- Otro

### 3.3 Transportistas/Subcontratistas (si aplica)
Entregar Excel con:

```
| RUT Empresa | Razón Social | Nombre Fantasía | Dirección | Teléfono | Email | Contacto Principal | Fecha Contrato | Estado |
```

### 3.4 Clientes/Mandantes
Entregar Excel con:

```
| RUT | Razón Social | Nombre Fantasía | Dirección | Contacto | Email | Teléfono | Requisitos Especiales |
```

### 3.5 Rutas y Destinos
Entregar Excel con:

```
| Código Ruta | Nombre | Origen | Destino | Distancia KM | Tiempo Estimado | Frecuencia | Restricciones |
```

---

## 4. FLUJOS DE TRABAJO

### 4.1 Flujos Actuales (Diagramas)
Necesitamos diagramas o descripciones detalladas de:

- [ ] **Flujo de contratación de conductor**
  - Desde postulación hasta incorporación
  - Documentos requeridos en cada etapa
  - Tiempos de cada etapa

- [ ] **Flujo de incorporación de vehículo**
  - Documentación requerida
  - Inspecciones
  - Aprobaciones

- [ ] **Flujo de renovación de documentos**
  - Quién detecta vencimientos
  - Quién solicita renovación
  - Quién valida y aprueba

- [ ] **Flujo de despacho de carga**
  - Documentos generados
  - Validaciones previas
  - Cierre de viaje

- [ ] **Flujo de auditoría de compliance**
  - Frecuencia
  - Checklist utilizado
  - Acciones correctivas

### 4.2 Reglas de Negocio
Documentar reglas específicas:

```
Ejemplo:
- Un conductor NO puede operar si su licencia vence en menos de 30 días
- Un vehículo requiere revisión técnica al día para salir a ruta
- Documentos de subcontratistas deben renovarse cada 6 meses
```

- [ ] Reglas de vencimiento anticipado (cuántos días antes alertar)
- [ ] Reglas de bloqueo (qué documentos bloquean operación)
- [ ] Reglas de escalamiento (a quién notificar según gravedad)
- [ ] Excepciones permitidas y proceso de autorización

### 4.3 Matriz de Notificaciones

```
| Evento | Destinatario(s) | Canal | Anticipación |
|--------|----------------|-------|--------------|
| Licencia por vencer | Conductor, Jefe Flota | Email, Push | 30, 15, 7 días |
| Revisión técnica vencida | Jefe Flota, Gerencia | Email | Inmediato |
| Documento rechazado | Conductor, RRHH | Email | Inmediato |
```

---

## 5. INTEGRACIONES

### 5.1 Sistemas Actuales
Listar todos los sistemas que actualmente utilizan:

| Sistema | Proveedor | Función | Datos que Maneja | API Disponible |
|---------|-----------|---------|------------------|----------------|
| ERP | ? | Contabilidad | Facturas, pagos | Sí/No |
| GPS | ? | Tracking | Ubicación vehículos | Sí/No |
| RRHH | ? | Personal | Datos empleados | Sí/No |

### 5.2 Credenciales y Accesos (si hay integraciones)
- [ ] Documentación de APIs existentes
- [ ] Credenciales de prueba/sandbox
- [ ] Contacto técnico del proveedor

### 5.3 Servicios Externos Requeridos
- [ ] Servicio de verificación de RUT (si aplica)
- [ ] Servicio de validación de documentos
- [ ] Servicio de firma electrónica (si aplica)
- [ ] Servicio de notificaciones SMS (proveedor preferido)

---

## 6. REPORTES Y MÉTRICAS

### 6.1 Reportes Actuales
Entregar ejemplos de reportes que actualmente generan:

- [ ] Reporte de compliance mensual
- [ ] Reporte de vencimientos
- [ ] Reporte de flota
- [ ] Reporte de conductores
- [ ] Reportes para auditorías externas
- [ ] Reportes para mandantes/clientes

### 6.2 KPIs Deseados
Listar métricas que desean monitorear:

```
Ejemplo:
- % de compliance general
- Tiempo promedio de renovación de documentos
- Cantidad de documentos vencidos por mes
- Costo de multas por incumplimiento
```

### 6.3 Frecuencia de Reportes

| Reporte | Frecuencia | Destinatarios | Formato |
|---------|------------|---------------|---------|
| Compliance general | Semanal | Gerencia | PDF, Excel |
| Vencimientos | Diario | Jefes área | Email |
| Auditoría | Mensual | Directorio | PDF |

---

## 7. BRANDING Y PERSONALIZACIÓN

### 7.1 Identidad Visual
- [ ] Logo en alta resolución (PNG transparente, SVG)
- [ ] Paleta de colores corporativos (códigos HEX)
- [ ] Tipografías corporativas
- [ ] Manual de marca (si existe)

### 7.2 Comunicaciones
- [ ] Tono de comunicación preferido (formal/informal)
- [ ] Firma de correos corporativos
- [ ] Plantilla de emails (si existe)

---

## 8. ASPECTOS LEGALES Y COMPLIANCE

### 8.1 Marco Regulatorio
- [ ] Lista de normativas que deben cumplir
- [ ] Requisitos específicos de mandantes
- [ ] Certificaciones actuales de la empresa

### 8.2 Políticas Internas
- [ ] Política de privacidad de datos
- [ ] Política de retención de documentos
- [ ] Política de seguridad de información

### 8.3 Auditorías
- [ ] Frecuencia de auditorías internas
- [ ] Frecuencia de auditorías externas
- [ ] Últimos informes de auditoría (opcional)

---

## 9. INFRAESTRUCTURA Y TÉCNICO

### 9.1 Ambiente de Trabajo
- [ ] Navegadores utilizados (Chrome, Firefox, Edge, etc.)
- [ ] Dispositivos de usuarios (PC, tablet, móvil)
- [ ] Conectividad en terreno (WiFi, datos móviles)

### 9.2 Seguridad
- [ ] Requisitos de autenticación (SSO, 2FA)
- [ ] Políticas de contraseñas
- [ ] Restricciones de IP (si aplica)
- [ ] Certificaciones requeridas (ISO, SOC2, etc.)

---

## 10. CONTACTOS DEL PROYECTO

### 10.1 Equipo Cliente

| Rol | Nombre | Email | Teléfono | Disponibilidad |
|-----|--------|-------|----------|----------------|
| Sponsor ejecutivo | | | | |
| Product Owner | | | | |
| Líder técnico | | | | |
| Usuario clave - Operaciones | | | | |
| Usuario clave - RRHH | | | | |
| Usuario clave - Compliance | | | | |

### 10.2 Canales de Comunicación
- [ ] Canal principal (email, Slack, Teams, WhatsApp)
- [ ] Frecuencia de reuniones de seguimiento
- [ ] Horarios de disponibilidad

---

## Formato de Entrega

### Archivos Aceptados
- **Datos tabulares:** Excel (.xlsx), CSV
- **Documentos:** PDF, Word (.docx)
- **Imágenes:** JPG, PNG (mínimo 300 DPI)
- **Diagramas:** PDF, PNG, Visio, Draw.io

### Nomenclatura de Archivos
```
[CATEGORIA]_[DESCRIPCION]_[FECHA].[extension]

Ejemplos:
CONDUCTORES_lista_completa_20240115.xlsx
DOCUMENTOS_licencia_ejemplo_001.pdf
FLUJO_contratacion_conductor_v1.pdf
```

### Método de Entrega
- Google Drive compartido (preferido)
- OneDrive/SharePoint
- Email (archivos menores a 25MB)

---

## Checklist de Entrega por Semana

### Semana 1 (CRÍTICO)
- [ ] Estructura organizacional
- [ ] Lista de usuarios con roles
- [ ] Logo y colores corporativos
- [ ] Contactos del proyecto

### Semana 2
- [ ] Catálogo completo de documentos
- [ ] 5+ ejemplos de cada tipo de documento
- [ ] Reglas de vencimiento

### Semana 3
- [ ] Datos maestros de conductores
- [ ] Datos maestros de vehículos
- [ ] Flujos de trabajo documentados

### Semana 4
- [ ] Datos de transportistas/subcontratistas
- [ ] Datos de clientes/mandantes
- [ ] Matriz de notificaciones

### Semana 5
- [ ] Información de integraciones
- [ ] Reportes actuales de ejemplo
- [ ] KPIs deseados

### Semana 6+
- [ ] Feedback sobre prototipos
- [ ] Validación de flujos implementados
- [ ] Casos de prueba y escenarios

---

## Notas Importantes

1. **Confidencialidad:** Todos los datos entregados serán tratados con estricta confidencialidad y utilizados únicamente para la implementación del sistema.

2. **Anonimización:** Para ejemplos de documentos con datos personales, se recomienda anonimizar información sensible (nombres, RUT parciales).

3. **Datos de Prueba:** Si no es posible entregar datos reales, podemos trabajar con datos ficticios representativos.

4. **Iteración:** Este documento es una guía. Trabajaremos iterativamente y solicitaremos información adicional según sea necesario.

5. **Soporte:** Nuestro equipo está disponible para ayudar a recopilar y formatear la información.

---

**Contacto para Dudas:**
- Email: [tu-email@empresa.com]
- Teléfono: [+56 X XXXX XXXX]

---

*Documento generado automáticamente - Versión 1.0*
