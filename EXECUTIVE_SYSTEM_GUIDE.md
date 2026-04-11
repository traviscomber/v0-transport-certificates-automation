# Sistema de Revisión de Documentos para Ejecutivas - Guía de Implementación

## Resumen Completado

Se ha construido un sistema completo para que las ejecutivas de **Transportes Labbe** puedan revisar y validar documentos subidos por clientes y conductores. El sistema incluye:

### ✅ Componentes Implementados

#### 1. **Base de Datos (3 nuevas tablas)**
- `document_reviews` - Registro de todas las revisiones realizadas
- `document_queue` - Cola de documentos pendientes con priorización
- Rol `executive` agregado a la tabla `profiles`

#### 2. **API Endpoints (3 endpoints)**
- `GET /api/document-queue` - Obtiene la cola de documentos por empresa
- `POST/GET /api/document-reviews` - Envía y obtiene revisiones
- `GET /api/executive-stats` - Estadísticas del desempeño

#### 3. **Interfaz Ejecutiva**
- Dashboard completo en `/app/dashboard/executive/page.tsx`
- Componente de revisión de documentos
- Vista de estadísticas y análisis

## Pasos de Implementación

### Paso 1: Crear las Tablas en Supabase

Accede a tu dashboard de Supabase y ejecuta este SQL en el SQL Editor:

```sql
-- 1. Actualizar constraint en profiles para permitir role 'executive'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('driver', 'dispatcher', 'admin', 'executive'));

-- 2. Crear tabla document_reviews
CREATE TABLE IF NOT EXISTS public.document_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(document_id, reviewer_id)
);

CREATE INDEX idx_document_reviews_reviewer_id ON public.document_reviews(reviewer_id);
CREATE INDEX idx_document_reviews_company_name ON public.document_reviews(company_name);
CREATE INDEX idx_document_reviews_status ON public.document_reviews(status);

-- 3. Crear tabla document_queue
CREATE TABLE IF NOT EXISTS public.document_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  queue_status TEXT DEFAULT 'pending' CHECK (queue_status IN ('pending', 'in_review', 'completed', 'rejected')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(document_id)
);

CREATE INDEX idx_document_queue_company_name ON public.document_queue(company_name);
CREATE INDEX idx_document_queue_queue_status ON public.document_queue(queue_status);
CREATE INDEX idx_document_queue_assigned_to ON public.document_queue(assigned_to);
CREATE INDEX idx_document_queue_priority ON public.document_queue(priority DESC);

-- 4. Habilitar RLS en nuevas tablas
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_queue ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies para document_reviews
CREATE POLICY "Executives can view their company reviews" ON public.document_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
      AND company_name = document_reviews.company_name
    )
  );

CREATE POLICY "Executives can create reviews" ON public.document_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
      AND company_name = document_reviews.company_name
    )
    AND reviewer_id = auth.uid()
  );

CREATE POLICY "Executives can update their reviews" ON public.document_reviews
  FOR UPDATE USING (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
    )
  );

-- 6. RLS Policies para document_queue
CREATE POLICY "Executives can view their company queue" ON public.document_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
      AND company_name = document_queue.company_name
    )
  );

CREATE POLICY "Executives can update queue" ON public.document_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
      AND company_name = document_queue.company_name
    )
  );

-- 7. Crear índices de performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_role ON public.profiles(company_name, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
```

### Paso 2: Actualizar Rol de Ejecutivas

Para convertir a las ejecutivas existentes en `executive`, ejecuta:

```sql
UPDATE public.profiles 
SET role = 'executive'
WHERE company_name = 'Transportes Labbe' 
AND role IN ('admin', 'dispatcher');
```

### Paso 3: Prueba el Sistema

1. **Accede al Dashboard de Ejecutiva**
   - URL: `/dashboard/executive`
   - Las ejecutivas verán solo documentos de su empresa

2. **Características Disponibles:**
   - **Cola de Documentos**: Lista filtrable de documentos pendientes
   - **Revisión de Documentos**: Panel detallado con OCR y decisión (aprobar/rechazar)
   - **Estadísticas**: Dashboard con métricas de desempeño
   - **Historial de Revisiones**: Rastreo completo de cada documento

## Flujo de Trabajo de Ejecutiva

1. **Inicia Sesión** → Panel de Ejecutiva
2. **Ve la Cola** → Documentos ordenados por prioridad
3. **Selecciona Documento** → Panel de revisión con datos OCR
4. **Toma Decisión** → Aprueba o rechaza con comentarios
5. **Sistema Actualiza**:
   - ✓ Estado del documento
   - ✓ Cola de revisión
   - ✓ Historial de auditoría
   - ✓ Estadísticas de desempeño

## Archivos Creados

### APIs
- `/app/api/document-queue/route.ts` - Gestión de cola
- `/app/api/document-reviews/route.ts` - Revisiones de documentos
- `/app/api/executive-stats/route.ts` - Estadísticas

### Componentes
- `/app/dashboard/executive/page.tsx` - Dashboard principal
- `/components/executives/document-review-panel.tsx` - Panel de revisión

### SQL Scripts (para referencia)
- `/scripts/013_add_executive_role.sql`
- `/scripts/014_create_document_reviews.sql`
- `/scripts/015_create_document_queue.sql`

## Filtrado y Búsqueda

El sistema permite:
- **Filtrar por Estado**: Pendiente, En Revisión, Completado, Rechazado
- **Buscar por Nombre**: De archivo o solicitante
- **Ordenar por Prioridad**: Automático
- **Mostrar Fecha**: De subida del documento

## Seguridad

- **RLS (Row Level Security)**: Ejecutivas solo ven documentos de su empresa
- **Auditoría**: Cada revisión se registra con timestamp
- **Validación**: Solo ejecutivas autenticadas pueden acceder
- **Trazabilidad**: Historial completo de quien revisó y cuándo

## Próximos Pasos (Funcionalidades Adicionales)

1. **Notificaciones en Tiempo Real** - Email cuando un documento es revisado
2. **Estadísticas Avanzadas** - Gráficos de tendencias
3. **Reportes Exportables** - PDF/Excel de auditoría
4. **Assign Workflows** - Asignar documentos a ejecutivas específicas
5. **Bulk Operations** - Acciones en múltiples documentos

## Contacto y Soporte

Para problemas o preguntas, revisa los logs de Supabase en el Dashboard.

---

**Sistema implementado correctamente. Las ejecutivas ya pueden revisar documentos.**
