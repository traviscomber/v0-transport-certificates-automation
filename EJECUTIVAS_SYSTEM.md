# Sistema de Ejecutivas - Documentación

## Las 4 Ejecutivas Asignadas (La Patagua)

| Email | Nombre Completo | ID (UUID) | Rol |
|-------|-----------------|-----------|-----|
| ocarrasco@labbe.cl | Olga Carrasco | TBD | Ejecutiva |
| csepulveda@labbe.cl | Carolina Sepúlveda | TBD | Ejecutiva |
| dsilva@labbe.cl | Daniela Silva | TBD | Ejecutiva |
| jayala@labbe.cl | Javiera Ayala | TBD | Ejecutiva |

## Arquitectura de Asignación

```
conductores.rut_proveedor 
  → transportistas.rut 
  → transportistas.assigned_executive_id (UUID) 
  → executive_staff.full_name
```

## APIs de Documentos

### `/api/company/documents/aprobados`
- **Comportamiento**: Trae TODOS los documentos aprobados sin filtro
- **Mapeo ejecutiva**: Extrae nombres de ejecutivas asignadas a conductores via tabla transportistas
- **Datos retornados**: `{ conductorDocs: [], subDocs: [], total: number }`

### `/api/dashboard/pending-documents`
- **Comportamiento**: Trae TODOS los documentos pendientes sin filtro
- **Mapeo ejecutiva**: Extrae nombres de ejecutivas asignadas a conductores via tabla transportistas
- **Datos retornados**: `{ conductorDocs: [], subDocs: [], total: number }`

### `/api/company/documents/rechazados`
- **Comportamiento**: Trae TODOS los documentos rechazados sin filtro
- **Mapeo ejecutiva**: Extrae nombres de ejecutivas asignadas a conductores via tabla transportistas
- **Datos retornados**: `{ conductorDocs: [], subDocs: [], total: number }`

## Componentes Frontend

### ApprovedDocumentsList
- **Props**: `conductorDocs[]`, `subDocs[]`
- **Filtros**: searchQuery, executiveId, companyId
- **Comportamiento**: Mostrar TODOS por defecto + permitir filtrar opcionalmente
- **Problema actual**: docsToDisplay ignora filteredDocs cuando no hay ejecutivas en los datos

### PendingDocumentsList
- **Props**: `conductorDocs[]`, `subDocs[]`
- **Filtros**: searchQuery, executiveId, companyId
- **Comportamiento**: Mostrar TODOS por defecto + permitir filtrar opcionalmente
- **Estado**: NO tiene DocumentFilter (similar al anterior)

### RejectedDocumentsList
- **Props**: `conductorDocs[]`, `subDocs[]`
- **Filtros**: searchQuery, executiveId, companyId
- **Comportamiento**: Mostrar TODOS por defecto + permitir filtrar opcionalmente
- **Problema actual**: Mismo que ApprovedDocumentsList

## Comportamiento Requerido

1. **SIEMPRE mostrar TODOS los documentos por defecto** (sin filtros aplicados)
2. **Las ejecutivas PUEDEN filtrar opcionalmente** por:
   - Su nombre (ejecutiva)
   - Empresa (company/transportista)
   - Tipo de documento
3. **Búsqueda por nombre** DEBE funcionar independientemente
4. **Los datos DEBEN estar actualizados** (APIs traen todo sin filtro)

## Flujo Correcto

```
[API] → Trae TODOS los documentos (sin filtro)
  ↓
[Component] → Recibe todos los documentos
  ↓
[Render] → Muestra TODOS por defecto
  ↓
[Filter] → Usuario aplica filtro (opcional)
  ↓
[useMemo] → Filtra por searchQuery + executiveId + companyId
  ↓
[Display] → Muestra documentos filtrados (o todos si sin filtro)
```
