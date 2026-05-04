# Configuración de Transportes Labbe

## Tema Visual (Naranja + Azul)

El sistema ahora está configurado con el tema corporativo de Transportes Labbe:

### Colores Principales
- **Primary (Naranja)**: `oklch(0.6 0.22 41)` - Color principal de la marca
- **Secondary (Azul)**: `oklch(0.55 0.15 264)` - Color de acento
- **Background (Oscuro)**: `oklch(0.12 0 0)` - Fondo oscuro profesional

### Componentes Actualizados
- ✅ Hero Section: Branding de Transportes Labbe
- ✅ Header Navigation: Logo y nombre actualizado
- ✅ Color Theme: Naranja con azul en toda la aplicación
- ✅ Botones: Primarios en naranja

## Filtrado por Empresa

La aplicación ahora filtra automáticamente los datos por:
- **Empresa**: Transportes Labbe
- **Estado**: Activo

### Áreas Filtradas

1. **Dashboard de Ejecutivas** (`/dashboard/executive`)
   - Solo ve documentos de Transportes Labbe
   - Acceso restringido por RLS

2. **Cola de Documentos** (`/api/document-queue`)
   - Filtra por `company_id` y estado

3. **Portal de Conductores** 
   - Solo conductores de Transportes Labbe

4. **Página de Ejecutivas** (`/executives`)
   - Solo muestra ejecutivas de la empresa

## Datos de Ejemplo

Para pruebas, los datos de ejemplo están en Supabase con:
- `company_name = "Transportes Labbe"`
- Ejecutivas registradas con rol `executive`
- Documentos asociados a la empresa

## URLs Importantes

- **Inicio**: `/` (Con branding de Labbe)
- **Portal de Ejecutivas**: `/dashboard/executive`
- **Lista de Ejecutivas**: `/executives`
- **Dashboard General**: `/dashboard`
- **Login**: `/auth/login`

## Siguientes Pasos

1. Verificar que todos los datos en Supabase tienen `company_name = "Transportes Labbe"`
2. Las ejecutivas verán automáticamente solo sus documentos
3. El tema naranja/azul se aplica globalmente
4. El sistema está listo para producción
