# Plan de Escalabilidad de Documentos

## Situación Actual (Junio 2026)

### Datos
- **Documentos totales**: 2,951 (48 conductores + 2,903 subcontratistas)
- **Transportistas**: 238
- **Crecimiento estimado**: +3,000 documentos/mes
- **Meses de operación**: ~1 mes

### Infraestructura Supabase Plan Pro
- Storage: 500GB
- Database: Sin límite numérico (pero performance degrada)
- Query default: 1,000 registros
- Bandwidth: 250GB/mes
- Conexiones: 100 concurrentes

---

## Capacidad SIN Cambios en Base de Datos

### Cuántos documentos podemos manejar?

| Métrica | Sin Cambios | Razón |
|---------|-----------|-------|
| **Documentos en BD** | 1,000,000+ | PostgreSQL sin límite técnico |
| **Query performance OK** | Hasta 50,000 | Después necesita índices + paginación |
| **UI performance OK** | Hasta 5,000 visibles | Sin virtualización, DOM se satura |
| **Storage suficiente** | 500,000+ docs | Promedio 100KB/archivo = 50GB total |
| **Bandwidth limit** | 250GB/mes | Si promedio 100KB: 2.5M descargas/mes |

### Timeline de Crecimiento (3,000 docs/mes)

| Mes | Total Docs | Performance | Acción Recomendada |
|-----|-----------|-------------|-------------------|
| 1 | 3,000 | OK | Monitor |
| 6 | 18,000 | OK | Monitor |
| 12 | 39,000 | Degradación leve | Implementar FASE 1 (paginación) |
| 24 | 72,000 | Problemas visibles | FASE 1 + 2 + 3 (virtualización) |
| 36 | 108,000 | **Crítico** | Necesita archivado o fragmentación |

---

## Fases de Escalabilidad

### FASE 1: Paginación Backend (12-15 meses)
**Cuándo**: Cuando queremos manejar >50,000 docs sin lag
**Cambios necesarios**:
- Implementar `.range(start, end)` loops en APIs
- Agregar parámetros: `?page=0&pageSize=1000`
- Retornar: `{ data, total, hasMore, page }`

**Beneficio**: Backend puede servir 100,000+ documentos
**Costo**: 2-3 horas de desarrollo
**Sin cambios en BD**: ✓ Compatible

---

### FASE 2: Agrupamiento por Mes Frontend (15-18 meses)
**Cuándo**: Cuando UI tiene >10,000 documentos en lista plana
**Cambios necesarios**:
- Crear `DocumentsByMonth.tsx` component
- Agrupar documentos por `YYYY-MM`
- Meses colapsables

**Beneficio**: UX mejorada, menos scroll
**Costo**: 1-2 horas de desarrollo
**Sin cambios en BD**: ✓ Compatible

---

### FASE 3: Virtualización (18-24 meses)
**Cuándo**: Cuando lista completa causa lag (>5,000 documentos visibles)
**Cambios necesarios**:
- Implementar `react-window` o custom virtual scroll
- Solo renderizar ~20 documentos visibles
- Cargar próximas páginas al scroll

**Beneficio**: Performance excelente incluso con 100,000+ docs
**Costo**: 1-2 horas de desarrollo
**Sin cambios en BD**: ✓ Compatible

---

### FASE 4: Índices de Base de Datos (24+ meses)
**Cuándo**: Cuando queries tarden >500ms (>100,000 documentos)
**Cambios necesarios**:
- Agregar índices en: `created_at`, `status`, `transportation_id`
- Queries analíticas con views materializadas

**Beneficio**: Query performance mantiene <100ms
**Costo**: 2-3 horas + análisis de acceso
**Cambios en BD**: ✓ Sí (índices, vistas)

---

### FASE 5: Archivado/Fragmentación (36+ meses)
**Cuándo**: Cuando total documentos >500,000 o año de datos acumulado
**Cambios necesarios**:
- Tabla separada para documentos archivados
- Política de retention: archivar después de 12 meses
- Búsqueda considera ambas tablas

**Beneficio**: BD mantiene performance, storage optimizado
**Costo**: 4-6 horas de desarrollo + migración
**Cambios en BD**: ✓ Sí (nueva tabla, triggers)

---

## Estimación Detallada

### Escenario Actual (3,000 docs/mes)

```
AHORA (Junio 2026)
├─ 2,951 documentos
├─ Performance: EXCELENTE
├─ UI: Responsive (todas listas <100ms)
└─ Acción: Nada (monitor)

OCTUBRE 2027 (+12 meses = 36,000 docs)
├─ Performance: OK pero monitoreando
├─ UI: Listas tardan 200-500ms
├─ Acción: Planificar FASE 1-2

JULIO 2028 (+24 meses = 72,000 docs)
├─ Performance: PROBLEMAS VISIBLES
├─ UI: Listas tardan 800ms-1.2s
├─ Acción: IMPLEMENTAR FASE 1-3 (urgente)

MAYO 2029 (+36 meses = 108,000 docs)
├─ Performance: CRÍTICO
├─ UI: Listas no responden (<5s)
├─ Acción: IMPLEMENTAR FASE 4-5

MAYO 2032 (+60 meses = 180,000 docs)
├─ Performance: NECESITA REWRITE
├─ BD: >500GB potencial
├─ Acción: Archivado obligatorio
```

---

## Sin Cambios en Base de Datos: Límites Duros

### Límite 1: Bandwidth (250GB/mes)
- 3,000 docs × 100KB = 300MB/mes (DESCARGADAS)
- Si cada documento se descarga 10 veces: 3GB/mes
- Si cada documento se descarga 100 veces: 30GB/mes
- **Límite**: ~2-3 millones de descargas/mes
- **Impacto**: SIN IMPACTO hasta año 3

### Límite 2: Storage (500GB)
- 200,000 documentos × 100KB promedio = 20GB
- **Límite**: ~5 millones de documentos a 100KB c/u
- **Impacto**: SIN IMPACTO hasta año 10+

### Límite 3: Query Performance
- Queries <50K registros: <100ms ✓
- Queries 50K-100K: 100-500ms (degradación visible)
- Queries >100K: 500ms-2s+ (UI lag)
- **Limite sin índices**: ~100,000 documentos (año 3)

### Límite 4: UI/DOM Performance
- Listar 1,000 docs en DOM: <100ms render ✓
- Listar 5,000 docs: 200-500ms (noticeable)
- Listar 10,000+ docs: >1s (laggy)
- **Límite sin virtualización**: ~5,000 documentos visibles

---

## Recomendaciones

### Ahora (Junio 2026)
- ✓ Sistema ideal
- ✓ Monitor queries
- ✓ No hacer nada

### Dentro de 6 meses (Diciembre 2026)
- ~18,000 documentos
- Empezar a diseñar FASE 1-2
- Hacer load testing con datos de prueba

### Dentro de 12 meses (Junio 2027)
- ~36,000 documentos
- **IMPLEMENTAR FASE 1** (paginación backend)
- **IMPLEMENTAR FASE 2** (agrupamiento por mes)

### Dentro de 18 meses (Diciembre 2027)
- ~54,000 documentos
- **IMPLEMENTAR FASE 3** (virtualización)
- Monitorear índices en BD

### Dentro de 24 meses (Junio 2028)
- ~72,000 documentos
- **CONSIDERAR FASE 4** (índices BD)

### Dentro de 36 meses (Junio 2029)
- ~108,000 documentos
- **IMPLEMENTAR FASE 5** (archivado)

---

## Conclusión

**SIN CAMBIOS en base de datos**: El sistema puede manejar cómodamente hasta **100,000 documentos** (año 3) con solo cambios de software (paginación, virtualización).

**Con índices + archivado**: Puede escalar indefinidamente.

**Recomendación**: Implementar Fases 1-3 en mes 12-18. Fases 4-5 solo si crecimiento sostenido >3,000/mes.
