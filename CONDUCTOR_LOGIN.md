# Sistema de Login para Conductores

El sistema ya tenía un login de conductores configur completamente. Los conductores pueden loguears con su **RUT** y una **contraseña** basada en su RUT.

## Cómo Loguearse como Conductor

**URL**: `/conductor/login`

### Credenciales de Prueba

Hay 3 conductores disponibles para probar:

| RUT | Nombre | Contraseña | 
|-----|--------|------------|
| `19.123.456-8` (o `19123456-8`) | María González | `labbe3456` |
| `20.234.567-9` (o `20234567-9`) | Carlos Rodríguez | `labbe4567` |
| `18.012.757-7` (o `18012757-7`) | Juan Pérez | `labbe2757` |

**Fórmula de Contraseña**: `labbe` + últimos 4 dígitos del RUT

Ejemplos:
- RUT: 19123456-8 → Últimos 4 dígitos: 3456 → Contraseña: `labbe3456`
- RUT: 20234567-9 → Últimos 4 dígitos: 4567 → Contraseña: `labbe4567`

## Flujo de Autenticación

```
1. Usuario accede a /conductor/login
2. Ingresa RUT (ej: 19.123.456-8 o 19123456-8)
3. Ingresa Contraseña (ej: labbe3456)
4. Sistema:
   - Normaliza RUT (elimina puntos)
   - Busca en tabla conductor_auth
   - Verifica contraseña con bcrypt
   - Obtiene datos de conductor desde tabla conductores
   - Redirige a /conductor/onboarding
```

## Tablas Involucradas

### `conductor_auth` 
Almacena autenticación de conductores:
- `conductor_id` (UUID) - FK a conductores
- `rut` (TEXT) - RUT normalizado sin puntos (ej: 19123456-8)
- `password_hash` (TEXT) - Contraseña hasheada con bcrypt
- `is_active` (BOOLEAN) - Si la cuenta está activa

### `conductores`
Datos del conductor:
- `id` (UUID)
- `rut` (TEXT) - RUT del conductor
- `nombres` (TEXT)
- `apellido_paterno` (TEXT)
- `email` (TEXT, nullable)
- `transportista_id` (UUID) - Pertenece a esta empresa
- `is_active` (BOOLEAN)

## Cómo Agregar Más Conductores

Para crear un nuevo conductor que pueda loguearse:

1. **Crear registro en `conductores`**:
```sql
INSERT INTO conductores (
  rut, nombres, apellido_paterno, apellido_materno,
  email, transportista_id, numero_licencia, clase_licencia,
  vencimiento_licencia, is_active
) VALUES (
  '21.345.678-0', 'Pedro', 'López', 'Martínez',
  'pedro@drivers.test', '<transportista_id>', 'LIC004', 'B',
  '2027-05-08', true
);
```

2. **Crear hash de contraseña**:
```javascript
// Password: labbe + últimos 4 dígitos = labbe5678
const bcrypt = require('bcryptjs');
const password = 'labbe5678';
const hash = await bcrypt.hash(password, 10);
```

3. **Crear registro en `conductor_auth`**:
```sql
INSERT INTO conductor_auth (
  conductor_id, rut, password_hash, is_active
) VALUES (
  '<conductor_id>', '21345678-0', '<hash_bcrypt>', true
);
```

## Qué Pueden Hacer los Conductores

Después de loguearse, los conductores pueden:

✅ Ver su perfil  
✅ Subir documentos (licencia, certificados, etc)  
✅ Ver estado de sus documentos (Pendiente, Aprobado, Rechazado)  
✅ Ver historial de documentos  

❌ No pueden cambiar estado de documentos  
❌ No pueden ver documentos de otros conductores  
❌ No pueden ver datos de otras transportistas  

## Endpoints Relacionados

- **Login**: `POST /api/auth/login-conductor`
  - Body: `{ rut: string, password: string }`
  - Response: `{ conductor_id, rut, nombre_completo, email, transportista_id }`
  - Cookies: `conductor_id`, `conductor_rut`, `conductor_nombre`, `user_email`

- **Login Page**: `GET /conductor/login`
  - Componente: `components/conductor/login-form.tsx`

- **Dashboard**: `GET /conductor/onboarding`
  - Redirige a dashboard después de login

## Notas de Seguridad

- Las contraseñas se hashean con **bcrypt** (salt rounds: 10)
- Nunca se almacenan contraseñas en texto plano
- Las cookies son `httpOnly` en producción
- El RUT se normaliza (sin puntos) para búsquedas en BD
- Las contraseñas no se repiten en logs (solo se muestra "labbe****")

## Test de Login

Desde la preview:

1. Accede a `http://localhost:3000/conductor/login`
2. Ingresa: RUT = `19123456-8`, Contraseña = `labbe3456`
3. Debería redirigir a `/conductor/onboarding` y cargar el dashboard del conductor
4. Las cookies deben estar presentes en DevTools → Application → Cookies
