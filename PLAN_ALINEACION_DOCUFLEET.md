# PLAN DE ALINEACIÓN: PORTAL ACTUAL → DOCUFLEET OPERACIONAL

## RESUMEN EJECUTIVO

El portal actual (`/dashboard/company`) está **75% alineado** con la sábana DocuFleet. Tiene los módulos clave pero necesita:
1. Reorganización de navegación (sidebar + topbar)
2. Implementar "Control Operacional" como pantalla principal con tarjetas de estado
3. Agregar lógica de 3 estados (OK, En riesgo, Bloqueado)
4. Crear "Operaciones Hoy" como vista separada
5. Sistemas de alertas e historial

---

## ANÁLISIS DETALLADO: QUÉ ENCAJA Y QUÉ NO

### ✅ QUÉ ESTÁ BIEN Y PUEDE REUTILIZARSE

| Elemento Actual | Alineación | Estado |
|---|---|---|
| **Clientes/Subcontratos (221)** | → Operaciones Hoy (parte de) | ✅ Reutilizable |
| **Conductores (291)** | → Pantalla Conductores | ✅ Reutilizable |
| **Documentos Mensuales** | → Pantalla Documentos | ✅ Reutilizable |
| **Equipo** | → Configuración (parte de) | ✅ Reutilizable |
| **Credenciales** | → Configuración (acceso) | ✅ Reutilizable |
| **Control Tower** | → Control Operacional (base) | ⚠️ Necesita expansión |
| **API `/company/data`** | → Backend disponible | ✅ Reutilizable |
| **Búsqueda y filtros avanzados** | → Ya implementado | ✅ Reutilizable |

### ❌ QUÉ FALTA O NECESITA AJUSTE

| Elemento Propuesto | Existe | Comentario | Acción |
|---|---|---|---|
| **Sidebar lateral fijo** | ✗ | Actualmente tabs horizontales | Crear sidebar con módulos |
| **Topbar mejorado** | ⚠️ | Muy simple | Expandir con buscador global, notificaciones |
| **Control Operacional avanzado** | ⚠️ | Control Tower es muy básico | Crear dashboard con tarjetas de estado |
| **Tarjetas de estado** | ✗ | No hay contadores críticos | Crear componentes para Bloqueados, En riesgo, Operativos, Cumplimiento |
| **Operaciones Hoy** | ✗ | No existe esta vista | Crear pantalla separada |
| **Vehículos** | ✗ | No hay módulo de vehículos | Crear nueva pantalla (datos disponibles en `/admin/vehiculos`) |
| **Alertas** | ✗ | No hay sistema de alertas | Crear pantalla de alertas con severidad |
| **Historial** | ✗ | No hay trazabilidad | Crear sistema de eventos/logs |
| **Estados visuales (OK/Riesgo/Bloqueado)** | ✗ | No implementado | Agregar lógica de estados a los datos |
| **Próximos vencimientos** | ✗ | No hay vista dedicada | Crear lista priorizada |

---

## PLAN POR FASES

### FASE 1: ARQUITECTURA BASE (Semana 1)
**Objetivo:** Reconstruir navegación y layout base

1. **Crear sidebar lateral fijo**
   - Componente: `layout/docufleet-sidebar.tsx`
   - Módulos: Control Operacional, Operaciones Hoy, Conductores, Vehículos, Documentos, Alertas, Historial, Configuración
   - Estado: compacto y siempre visible en desktop

2. **Mejorar topbar**
   - Componente: `layout/docufleet-topbar.tsx`
   - Elementos: logo Transportes Labbé, buscador global, notificaciones, usuario
   - Integrar con sidebar

3. **Crear layout wrapper**
   - Componente: `layout/docufleet-layout.tsx`
   - Estructura: sidebar + topbar + main content
   - Aplicable a todas las pantallas

4. **Reestructurar rutas**
   - Mover `/dashboard/company` a `/operacional/control`
   - Crear `/operacional/operaciones-hoy`
   - Crear `/operacional/conductores`
   - Crear `/operacional/vehiculos`
   - Crear `/operacional/documentos`
   - Crear `/operacional/alertas`
   - Crear `/operacional/historial`
   - Crear `/operacional/configuracion`

---

### FASE 2: CONTROL OPERACIONAL AVANZADO (Semana 1-2)
**Objetivo:** Dashboard principal con tarjetas de estado y priorización

1. **Crear sistema de estados**
   - Archivo: `lib/operations/status-engine.ts` (ya existe, expandir)
   - Lógica: calcular estado (OK/En Riesgo/Bloqueado) para cada entidad
   - Basarse en: documentos vencidos, próximos a vencer, faltantes

2. **Crear componente de tarjetas de estado**
   - `components/operacional/status-cards.tsx`
   - 4 tarjetas: Bloqueados, En Riesgo, Operativos, Cumplimiento %

3. **Crear sección "Requiere atención hoy"**
   - `components/operacional/attention-required.tsx`
   - Lista de máximo 10-15 items críticos
   - Cada item: entidad, motivo, acción rápida

4. **Crear sección "Próximos vencimientos"**
   - `components/operacional/upcoming-expirations.tsx`
   - Ordenado por urgencia: 3 días, 7 días, 15 días, 30 días
   - Cada item: documento, entidad, días restantes, acción

5. **Crear acciones rápidas**
   - `components/operacional/quick-actions.tsx`
   - Botones: Ver bloqueados, Subir doc, Ver pendientes, Exportar, Historial

6. **Crear actividad reciente**
   - `components/operacional/recent-activity.tsx`
   - Timeline de eventos (simples al inicio, sin log backend)

---

### FASE 3: PANTALLAS OPERACIONALES (Semana 2-3)
**Objetivo:** Crear vistas coherentes para cada módulo

1. **Operaciones Hoy**
   - Vista clara: Bloqueados vs Operativos
   - Dos paneles lado a lado
   - Datos provinientes de status-engine

2. **Conductores (mejorar)**
   - Reutilizar `drivers-list.tsx` pero agregar estados visuales
   - Filtros: por estado, por ejecutiva, por certificación

3. **Vehículos (NUEVO)**
   - `components/operacional/vehicles-list.tsx`
   - Similar a conductores pero para vehículos
   - Estados: patente, revisión técnica, seguro, permiso

4. **Documentos (mejorar)**
   - Reutilizar `monthly-documents-list.tsx`
   - Agregar vista tipo "repositorio"
   - Estados: vigente, próximo a vencer, vencido, pendiente validación

5. **Alertas (NUEVO)**
   - `components/operacional/alerts-list.tsx`
   - Agrupar por nivel: Crítica, Importante, Informativa
   - Cada alerta con severidad, fecha, entidad, acción

6. **Historial (NUEVO)**
   - `components/operacional/history-list.tsx`
   - Timeline: quién hizo qué, cuándo, sobre quién, resultado
   - Inicialmente sin backend, simular eventos

7. **Configuración (mejorar)**
   - Consolidar: tipos documentales, usuarios, roles, parámetros
   - Integrar equipo, credenciales, áreas

---

### FASE 4: LÓGICA DE ESTADOS Y CÁLCULOS (Semana 2)
**Objetivo:** Implementar inteligencia operacional

1. **Expandir `status-engine.ts`**
   - Función: `calculateEntityStatus(entity) → 'OK' | 'EN_RIESGO' | 'BLOQUEADO'`
   - Reglas:
     - BLOQUEADO: documento vencido, faltante o inválido
     - EN_RIESGO: documento próximo a vencer (< 30 días)
     - OK: todos los documentos vigentes

2. **Crear analizador de vencimientos**
   - Función: `analyzeExpirations(entities) → PendingExpirations[]`
   - Retorna: qué vence en 3, 7, 15, 30 días

3. **Crear calculador de cumplimiento**
   - Función: `calculateCompliance(entities) → percentage`
   - Porcentaje de entidades en estado OK

---

### FASE 5: DISEÑO VISUAL ALINEADO (Semana 3)
**Objetivo:** Estilo sobrio, corporativo, minimalista

1. **Paleta de colores**
   - Fondo: gris muy claro o blanco frío (#f8f9fa, #f5f5f5)
   - Texto: gris oscuro/casi negro (#1f2937, #111827)
   - Azul profundo: navegación, botones primarios (#1e40af)
   - Verde suave: OK (#10b981, #34d399)
   - Ámbar: riesgo (#f59e0b, #fbbf24)
   - Rojo sobrio: bloqueado (#dc2626, #ef4444)

2. **Componentes visuales**
   - Cards: borde suave, sombra mínima, mucho aire
   - Badges: estados con colores definidos
   - Tablas: limpias, filas cómodas
   - Botones: primarios azules, secundarios blancos

3. **Tipografía**
   - Headings: moderna, clara
   - Body: legible, 14-16px
   - Textos cortos y operativos

---

### FASE 6: DATOS Y BACKEND REAL (Semana 3-4)
**Objetivo:** Conectar con API y base de datos real

1. **Expandir API `/company/data`**
   - Retornar conteos: bloqueados, en riesgo, operativos
   - Retornar próximos vencimientos
   - Retornar actividad reciente

2. **Crear endpoint `/company/alerts`**
   - Retorna alertas ordenadas por severidad

3. **Crear endpoint `/company/history`**
   - Retorna eventos/cambios recientes

4. **Crear tabla de eventos en Supabase** (opcional)
   - `audit_events`: fecha, usuario, acción, entidad, resultado
   - Permite historial real

---

## MAPEO ACTUAL → FUTURO

```
ACTUAL                          FUTURO (DocuFleet)
─────────────────────────────────────────────────────
/dashboard/company              /operacional/control (Control Operacional)
  - Control Tower       →         Dashboard principal con tarjetas
  - Subcontratos (221)  →         Operaciones Hoy (panel bloqueados)
  - Conductores (291)   →         /operacional/conductores
  - Documentos          →         /operacional/documentos
  - Equipo              →         /operacional/configuracion
  - Credenciales        →         /operacional/configuracion

NUEVAS PANTALLAS:
  -                       →         /operacional/operaciones-hoy
  -                       →         /operacional/vehiculos
  -                       →         /operacional/alertas
  -                       →         /operacional/historial
```

---

## QUÉ FUNCIONA YA Y NO NECESITA CAMBIOS

1. **API `/company/data`** - Retorna todos los datos correctamente
2. **Búsqueda y filtros** - Ya implementados en subcontractors, drivers, documentos
3. **Datos de equipo y credenciales** - Ya centralizados
4. **Autenticación y rutas** - Sistema ya funciona

---

## TIMELINE REALISTA

| Fase | Duración | Prioridad |
|---|---|---|
| Fase 1: Arquitectura base | 3-4 días | 🔴 CRÍTICA |
| Fase 2: Control Operacional | 3-4 días | 🔴 CRÍTICA |
| Fase 3: Pantallas operacionales | 5-7 días | 🟠 ALTA |
| Fase 4: Lógica de estados | 2-3 días | 🟠 ALTA |
| Fase 5: Diseño visual | 2-3 días | 🟡 MEDIA |
| Fase 6: Backend real | 3-4 días | 🟡 MEDIA |

**Total: 3-4 semanas** para implementación completa y robusta.

---

## RECOMENDACIÓN FINAL

**Empezar por Fase 1 + Fase 2** inmediatamente.
Esto te da un portal operacional funcional en 1 semana.

Las fases 3-6 son refinamiento progresivo que agrega capacidades sin romper lo existente.

El portal actual es un buen 75%, pero necesita:
- **Reorganización visual** (sidebar + topbar)
- **Dashboard operacional fuerte** (tarjetas de estado)
- **Lógica de priorización** (qué es crítico, qué es riesgo)

Una vez hecho, será una herramienta de verdad.
