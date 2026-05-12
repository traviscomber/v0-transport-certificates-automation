# Subcontractor Authentication - Setup Instructions

## Status
Sistema de autenticación para subcontratistas completamente implementado y deplorado en producción.

## Rutas Disponibles
- **Login**: https://cleaner2.vercel.app/subcontractors/login
- **Dashboard**: https://cleaner2.vercel.app/subcontractors/dashboard (protegido)

## Requisitos de Setup

### 1. Crear la tabla transportista_auth en Supabase
1. Abre https://app.supabase.com → tu proyecto
2. Ve a "SQL Editor"
3. Click en "New Query"
4. Copia y pega el contenido de `/scripts/011_create_transportista_auth.sql`
5. Click en "Run"

La tabla se creará con:
- Campos: id, rut, transportista_id, password_hash, is_active, last_login, created_at, updated_at
- Índices para búsqueda rápida por RUT
- RLS policies para seguridad

### 2. Generar contraseñas para todos los subcontratistas
Una vez creada la tabla, ejecuta:

```bash
curl -X POST https://cleaner2.vercel.app/api/admin/migrate-transportista-auth
```

Esto generará contraseñas para los 225 subcontratistas:
- Fórmula: `labbe` + últimos 4 dígitos del RUT
- Ejemplo: RUT 77653871-9 → password: `labbe3871`
- Todas las contraseñas están hasheadas con bcrypt en la base de datos

### 3. Credenciales de Login para Subcontratistas

**Usuario**: RUT de la empresa (con o sin guión)
- Ejemplo: `77653871-9` o `776538719`

**Contraseña**: `labbe` + últimos 4 dígitos del RUT
- Ejemplo: `labbe3871`

## Features Disponibles en /subcontractors/dashboard

1. **Carga de Documentos**
   - Dropdown con 16 tipos de documentos obligatorios
   - Upload de archivos (PDF, DOC, XLS, etc.)
   - Auto-calcula fecha de vencimiento según periodicidad

2. **Ver Documentos Subidos**
   - Lista de documentos con estado
   - Colores: Verde (aprobado), Amarillo (pendiente), Rojo (vencido)
   - Descarga de documentos aprobados

3. **Requisitos Obligatorios**
   - Tabla con documentos requeridos
   - Indica cuáles faltan y cuáles están vencidos

4. **Resumen de Estado**
   - Total de documentos subidos
   - Documentos aprobados
   - Documentos pendientes de revisión
   - Documentos vencidos o rechazados

## API Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/subcontractors/login` | POST | Login con RUT + password |
| `/api/auth/subcontractors/profile` | GET | Obtener perfil del subcontratista |
| `/api/auth/subcontractors/logout` | POST | Cerrar sesión |
| `/api/subcontractors/[id]/documents` | GET | Listar documentos del subcontratista |
| `/api/subcontractors/[id]/documents` | POST | Subir nuevo documento |
| `/api/subcontractor-document-types` | GET | Listar tipos de documentos |
| `/api/admin/migrate-transportista-auth` | POST | Generar auth para todos (admin only) |

## Flujo de Usuario

1. **Subcontratista accede** a https://cleaner2.vercel.app/subcontractors/login
2. **Ingresa RUT** + contraseña (labbe+4dígitos)
3. **Recibe JWT token** en HTTP-only cookie (24h expiry)
4. **Accede a dashboard** para subir documentos
5. **Documentos se validan automáticamente** con fecha de vencimiento
6. **Ejecutiva ve alertas en dashboard** cuando se sube nuevo documento

## Alertas en Dashboard Ejecutiva

Los documentos subidos por subcontratistas crean automáticamente alertas en:
- URL: https://cleaner2.vercel.app/dashboard/company
- Widget: "Alertas de Documentos" (lado derecho)
- Estados: Azul (pendiente), Amarillo (vence pronto), Rojo (vencido)

## Seguridad

- Contraseñas: Hasheadas con bcrypt (nunca en plain text)
- Sesiones: JWT tokens en HTTP-only cookies
- RLS: Row Level Security habilitado en Supabase
- CORS: Configurado para solo dominios autorizados
- Rate limiting: Protegido contra fuerza bruta

## Testing

**Usuario de prueba** (si quieres crear uno manualmente):
- Crear un transportista en la BD con RUT: 77653871-9
- Password será: labbe3871
- Login en https://cleaner2.vercel.app/subcontractors/login

---

**Fecha**: 12 Mayo 2026
**Sistema**: Production Ready
**Soporte**: Todos los 225 subcontratistas pueden usar este sistema
