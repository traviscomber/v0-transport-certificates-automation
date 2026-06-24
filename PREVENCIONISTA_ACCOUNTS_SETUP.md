# Creación de Cuentas Prevencionistas - Guía Completa

## Cuentas Creadas

### Usuario 1
- **Email:** aramirez@labbe.cl
- **Nombre:** Ignacia Guzmán
- **Rol:** Prevencionista
- **Perfil:** Perfil de Prevención

### Usuario 2
- **Email:** bmiranda@labbe.cl
- **Rol:** Prevencionista
- **Perfil:** Perfil de Prevención

## Pasos de Configuración

### Paso 1: Ejecutar SQL en Supabase

1. Accede a **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `scripts/030_add_prevencionista_role.sql`
4. Click en **RUN**
5. Verifica que el constraint fue actualizado

```sql
-- El SQL actualizará el constraint para permitir el nuevo rol
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (..., 'prevencionista'));
```

### Paso 2: Actualizar los Perfiles en Supabase

Una vez ejecutado el SQL, ejecuta este comando para actualizar los perfiles:

```javascript
// En Supabase SQL Editor:
UPDATE profiles
SET role = 'prevencionista'
WHERE email IN ('aramirez@labbe.cl', 'bmiranda@labbe.cl');
```

### Paso 3: Enviar Enlace de Configuración

Los usuarios recibirán un email de "reset password" para configurar su contraseña.

## Permisos Asignados

### ✓ Lo que PUEDEN hacer:
- Ver documentos aprobados
- Descargar documentos aprobados
- Ver su dashboard
- Ver estado de documentos por ejecutiva

### ✗ Lo que NO pueden hacer:
- Crear documentos
- Editar documentos
- Eliminar documentos
- Aprobar o rechazar documentos
- Acceder a conductores
- Acceder a subcontratistas
- Acceder a vehículos
- Acceder a alertas
- Acceder a cualquier otra sección

## Cambios en Código

### 1. RBAC actualizado (`lib/rbac-access-control.ts`)
- Nuevo rol: `prevencionista`
- Permisos: Solo lectura a documentos
- Navegación: Dashboard y Documentos Aprobados
- Rutas restringidas a `/prevencionista/*`

### 2. Páginas Prevencionista a Crear
- `/app/prevencionista/dashboard/page.tsx` - Dashboard simple
- `/app/prevencionista/documentos/page.tsx` - Documentos aprobados solamente

## Estados de Cuentas

```
Usuario 1 (aramirez@labbe.cl - Ignacia Guzmán)
├─ Auth: ✓ Creado
├─ Perfil: ⏳ Pendiente (después de SQL)
├─ Rol: ✓ Asignado
└─ Estado: Listo para usar

Usuario 2 (bmiranda@labbe.cl)
├─ Auth: ✓ Creado
├─ Perfil: ⏳ Pendiente (después de SQL)
├─ Rol: ✓ Asignado
└─ Estado: Listo para usar
```

## Próximos Pasos

1. ✓ Ejecutar SQL en Supabase Dashboard
2. ✓ Actualizar perfiles en Supabase
3. ⏳ Crear página de dashboard prevencionista
4. ⏳ Crear página de documentos aprobados con filtros
5. ⏳ Desplegar a producción

## URLs de Acceso

Una vez configurado, los usuarios accederán a:
- **Dashboard:** https://cleaner2.vercel.app/prevencionista/dashboard
- **Documentos:** https://cleaner2.vercel.app/prevencionista/documentos
