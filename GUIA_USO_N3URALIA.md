# Guía de Uso — N3uralia ERP Minería

## Bienvenido a N3uralia ERP Minería

Tu plataforma de inteligencia operacional para minería está completamente alineada con las mejores prácticas del sector. Este documento te guía por las nuevas funcionalidades y cómo usarlas.

---

## 🎯 Estructura de la Plataforma

### 1. Centro de Operaciones (Dashboard Principal)
**URL:** `/dashboard/company`

Tu centro de control operacional en tiempo real. Aquí puedes:
- Ver estado actual de todos tus activos operacionales
- Identificar equipos en riesgo y críticos
- Recibir alertas de mantenimientos pendientes
- Monitorear documentación vencida

**Métricas Clave:**
- **Activos Totales:** Equipos + Personal + Documentos
- **Operativos:** % en cumplimiento de mantenimientos y documentación
- **Atención Requerida:** Mantenciones urgentes, documentos próximos a vencer, repuestos bajo stock
- **Bloqueados:** Equipos o procesos críticos que requieren acción inmediata

---

## 📊 Módulos de Operación Crítica

Estos módulos son la columna vertebral de tu operación minera.

### 2. Producción (`/dashboard/company/produccion`)
Control en tiempo real de tus equipos y líneas de producción.
- Monitoreo de equipos activos
- Optimización de procesos
- Trazabilidad de producción
- Análisis de eficiencia

### 3. Mantención (`/dashboard/company/mantencion`)
Gestión integral de mantenimientos predictivos.
- Historial completo de cada equipo
- Planificación de paradas programadas
- Alertas de mantenimientos atrasados
- Costos de mantención por equipo

### 4. Bodega (`/dashboard/company/bodega`)
Control de inventario de repuestos y materiales.
- Inventario en tiempo real
- Alertas de stock bajo mínimo
- Automatización de compras de repuestos
- Trazabilidad de materiales

### 5. HSE / Seguridad (`/dashboard/company/hse`)
Gestión integral de seguridad y salud ocupacional.
- Reporte de incidentes
- Auditorías de seguridad
- Capacitaciones y certificaciones
- Análisis de riesgos operacionales

### 6. Documentos (`/dashboard/company/documentos`)
Control centralizado de toda tu documentación operacional.
- Permisos y certificaciones de operación
- Licencias de equipos y personal
- Alertas de vencimiento (7, 14, 30 días)
- Validación automática de documentos

---

## 💼 Módulos de Gestión Empresarial

Herramientas para la toma de decisiones a nivel ejecutivo.

### 7. Compras (`/dashboard/company/compras`)
Gestión integrada de procesos de compra.
- Órdenes de compra sincronizadas con bodega
- Gestión de proveedores
- Solicitudes de cotización
- Seguimiento de entregas

### 8. Finanzas (`/dashboard/company/finanzas`)
Control financiero y presupuestario.
- Control de costos operacionales
- Presupuestos por módulo
- Facturación integrada
- Proyecciones financieras

### 9. Reportes IA (`/dashboard/company/reportes`)
Análisis impulsados por inteligencia artificial.

**4 Tipos de Reportes:**

#### a) Resumen Ejecutivo
Visión general del estado operacional minero. Incluye:
- Situación actual (2-3 párrafos)
- Logros destacados
- Desafíos principales
- Top 3 recomendaciones ejecutivas
- Plan de acción de 30 días

**Ideal para:** Directores, Gerentes Generales

#### b) Análisis de Cumplimiento
Evaluación detallada del cumplimiento de requisitos.
- Estado actual de cumplimiento
- Brechas identificadas
- Riesgos críticos por incumplimiento
- Recomendaciones prioritarias
- Cronograma de implementación de mejoras

**Ideal para:** Supervisores de Operaciones, Jefes de Seguridad

#### c) Análisis de Riesgos
Identificación y evaluación de riesgos operacionales.
- Riesgos críticos (máxima prioridad)
- Riesgos moderados (mediano plazo)
- Matriz de riesgo (probabilidad vs impacto)
- Plan de mitigación por riesgo

**Ideal para:** Gerente de Riesgos, Junta Directiva

#### d) Alertas Críticas
Lista de alertas ordenadas por urgencia.
- **CRÍTICA:** Requiere acción en las próximas 24 horas
- **ALTA:** Requiere acción en los próximos 3 días
- **MEDIA:** Requiere atención en la próxima semana
- **BAJA:** Monitoreo recomendado

**Ideal para:** Centro de Operaciones 24/7

### 10. Usuarios (`/dashboard/company/usuarios`)
Gestión de accesos y permisos.
- Crear/editar usuarios por rol
- Asignar permisos por módulo
- Trazabilidad de acciones de usuarios
- Control granular de acceso

---

## 🤖 Herramientas Inteligentes

### 11. Asistente IA (`/dashboard/company/asistente`)
Tu asistente operacional 24/7 impulsado por IA.

**Ejemplos de Preguntas:**
- "¿Qué equipos tienen mayor riesgo de falla?"
- "¿Qué documentos vencen en los próximos 30 días?"
- "¿Qué repuestos están bajo stock crítico?"
- "¿Qué mantenciones están atrasadas?"
- "¿Qué órdenes de compra bloquean la operación?"
- "Resume el estado operacional de hoy para gerencia"

**Capacidades:**
- Responde preguntas sobre equipos y mantenimientos
- Proporciona análisis predictivos
- Consulta documentación operacional
- Genera insights automáticos

### 12. Alertas (`/dashboard/company/alertas`)
Panel centralizado de alertas operacionales.
- Alertas en tiempo real
- Filtrado por tipo, prioridad, estado
- Historial completo
- Acciones rápidas (marcar como resuelto, ver detalles)

---

## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Validación Matinal de Estado Operacional
1. Accede a **Centro de Operaciones**
2. Revisa métricas: ¿Algún equipo bloqueado?
3. Abre **Alertas** → Revisa críticas (rojo)
4. Abre **Asistente IA** → "¿Qué alertas críticas tenemos hoy?"
5. Toma acciones correctivas según recomendaciones

### Flujo 2: Planificación de Mantención
1. Accede a **Mantención**
2. Revisa equipos próximos a vencer mantenimiento
3. Consulta **Bodega** → ¿Tengo repuestos disponibles?
4. Si no hay repuestos, crea **Orden de Compra** en Compras
5. Genera **Reporte de Cumplimiento** para ejecutivos

### Flujo 3: Reporte Ejecutivo Mensual
1. Accede a **Reportes**
2. Selecciona "Resumen Ejecutivo"
3. Haz clic en "Generar Análisis"
4. Espera análisis IA (2-3 minutos)
5. Copia el análisis y comparte con directorio

### Flujo 4: Investigación de Riesgo
1. Accede a **Alertas** → Filtra por "CRÍTICA"
2. Selecciona una alerta crítica
3. Ve detalles (equipo, causa, impacto)
4. Abre **Análisis de Riesgos** en Reportes
5. Implementa recomendaciones del análisis IA

---

## 📈 KPIs Clave a Monitorear

### Operacionales
- **% Equipos Operativos:** Meta: >95%
- **Disponibilidad de Equipos:** Meta: >90%
- **Mantenimientos Realizados a Tiempo:** Meta: >85%

### Seguridad (HSE)
- **Incidentes Críticos:** Meta: 0
- **Documentos de Seguridad al Día:** Meta: 100%
- **Capacitaciones Completadas:** Meta: 100%

### Financieros
- **Costo de Mantenimiento vs Presupuesto:** Meta: <10% variación
- **Uso de Repuestos:** Monitorear tendencias
- **Costo por Hora de Operación:** Reducir mensualmente

---

## ⚙️ Configuración Inicial

### Paso 1: Crear Usuarios
1. Ve a **Usuarios**
2. Crea usuarios por rol:
   - **Gerente:** Acceso a todos los módulos
   - **Supervisor:** Acceso a Operación Crítica + Alertas
   - **Operador:** Acceso a producción y bodega
   - **Ejecutivo:** Acceso a Reportes y IA

### Paso 2: Cargar Documentación Base
1. Ve a **Documentos**
2. Sube certificaciones y permisos operacionales
3. El sistema alertará cuando estén próximos a vencer

### Paso 3: Registrar Equipos
1. Ve a **Producción**
2. Registra cada equipo con:
   - Nombre y código
   - Ubicación en mina
   - Fecha de última mantención
   - Próxima mantención programada

### Paso 4: Configurar Bodega
1. Ve a **Bodega**
2. Registra repuestos clave con stock mínimo
3. El sistema alerta cuando se alcanza stock bajo

---

## 🆘 Soporte y Ayuda

### En la Plataforma
- **Asistente IA:** Disponible 24/7 (chat flotante)
- **Documentación:** Esta guía + ejemplos en cada módulo

### Contacto
- **Email de Soporte:** support@seguria.cl
- **Teléfono:** [Tu número]
- **Horario:** Lunes a Viernes, 8am-6pm

---

## 🎓 Mejores Prácticas

1. **Revisa el Centro de Operaciones cada mañana** — Identifica alertas críticas temprano
2. **Mantén documentación actualizada** — El sistema necesita datos precisos
3. **Usa Reportes IA mensualmente** — Toma decisiones informadas
4. **Confía en las recomendaciones IA** — Están basadas en datos reales
5. **Integra el Asistente IA en tus flujos** — Ahorra 2-3 horas diarias

---

## 📝 Notas

- Todos los datos se guardan automáticamente
- Los reportes IA se generan en tiempo real
- Las alertas se actualizan cada 15 minutos
- El sistema está disponible 24/7

---

**Bienvenido a una operación minera más inteligente, segura y rentable.**

*N3uralia ERP Minería — De la operación en terreno a la decisión ejecutiva.*
