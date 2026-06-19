# Auditoría de Filtrado por Fecha - Mes/Año Selector

## Estado Actual (19 Junio 2026)

### ✅ IMPLEMENTADO - Filtro Mes/Año (4 páginas)
Estas páginas YA tienen el selector de mes/año y filtran correctamente:

1. **`/dashboard/company/documentos/aprobados`** ✅
   - Componente: ApprovedDocumentsList
   - Filtra documentos aprobados por mes/año
   - Estado: COMPLETO

2. **`/dashboard/company/documentos/pendientes`** ✅
   - Componente: PendingDocumentsList
   - Filtra documentos pendientes por mes/año
   - Estado: COMPLETO

3. **`/dashboard/company/documentos/rechazados`** ✅
   - Componente: RejectedDocumentsList
   - Filtra documentos rechazados por mes/año
   - Estado: COMPLETO

4. **`/subcontractors/dashboard`** ✅
   - Selector de período del subcontratista
   - Permite subir documentos con fecha retroactiva (hasta 4 meses)
   - Estado: COMPLETO

### 🔶 REQUIERE IMPLEMENTACIÓN - Filtro Mes/Año (7 páginas)

#### LISTADOS DE DOCUMENTOS SIN FILTRO:

1. **`/dashboard/company/documentos/vencidos`** 
   - Componente: ExpiredDocumentsList
   - Datos: Documentos que han vencido (históricamente)
   - Recomendación: Agregar mes/año para ver documentos vencidos en períodos anteriores
   - Razón: Análisis histórico de vencimientos

2. **`/dashboard/company/documentos/renovar`**
   - Componente: RenewalDocumentsList
   - Datos: Documentos próximos a vencer
   - Recomendación: Agregar mes/año para planificar renovaciones
   - Razón: Permite ver qué documentos vencerán en meses futuros

3. **`/dashboard/company/conductores`** (DriversList)
   - Listado de conductores con filtros (ejecutiva)
   - Recomendación: Agregar filtro de período para ver histórico de cambios/actividad
   - Razón: Auditoría y seguimiento de actividad conductor

4. **`/dashboard/company/subcontratistas`** (SubcontractorsList)
   - Listado de transportistas/subcontratistas
   - Recomendación: Agregar filtro de período para ver histórico
   - Razón: Auditoría y seguimiento de cambios

#### REPORTES Y DASHBOARDS:

5. **`/dashboard/company/reportes`**
   - Componente: AIAnalysisPanel
   - Datos: Reportes y análisis de cumplimiento
   - Recomendación: Cambiar dateRange predefinido a mes/año selector
   - Razón: Consistencia con resto del sistema

6. **`/admin/reportes`**
   - Componente: ReportsDashboard
   - Datos: Auditoría y reportes admin
   - Recomendación: Cambiar dateRange (7days, 30days, 90days) a mes/año selector
   - Razón: Consistencia y precisión en análisis

#### OTROS:

7. **`/conductor/documentos`** (Driver documents view)
   - Listado de documentos del conductor
   - Recomendación: Agregar mes/año para ver histórico personal
   - Razón: Conductor pueda revisar su archivo histórico

---

## Lógica de Implementación

### Para páginas SSR (vencidos, renovar):
- Convertir a páginas cliente ('use client')
- Agregar estado: `const [selectedMonth, setSelectedMonth] = useState(...)`
- Filtrar datos en useMemo basado en mes/año

### Para páginas cliente existentes:
- Agregar estado mes/año
- Actualizar useMemo de filtrado
- Agregar UI con dropdowns Mes/Año

### Patrón Estándar:
```tsx
// Estado
const today = new Date()
const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()))

// Lógica de filtrado
const getDateRangeForPeriod = (month: string, year: string) => {
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)
  const startDate = new Date(yearNum, monthNum - 1, 1)
  const endDate = new Date(yearNum, monthNum, 0)
  return { start: startDate, end: endDate }
}

// Uso en filtros
const { start, end } = getDateRangeForPeriod(selectedMonth, selectedYear)
filteredData = data.filter(item => {
  const itemDate = new Date(item.date_field)
  return itemDate >= start && itemDate <= end
})

// UI
<div className="flex gap-3 items-end">
  <div className="flex-1">
    <label className="text-xs font-semibold mb-2 block">Mes</label>
    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
      {/* opciones enero-diciembre */}
    </select>
  </div>
  <div className="flex-1">
    <label className="text-xs font-semibold mb-2 block">Año</label>
    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
      {/* opciones 2024-2026 */}
    </select>
  </div>
</div>
```

---

## Prioridad de Implementación

### ALTA (Documentos):
1. vencidos
2. renovar
3. conductor/documentos

### MEDIA (Reportes):
4. dashboard/company/reportes
5. admin/reportes

### BAJA (Listados):
6. dashboard/company/conductores
7. dashboard/company/subcontratistas

---

## Beneficios de Consistencia

- ✅ UX uniforme en toda la plataforma
- ✅ Usuarios comprenden el patrón
- ✅ Análisis temporal más preciso
- ✅ Auditoría histórica completable
- ✅ Facilita investigación de problemas pasados
