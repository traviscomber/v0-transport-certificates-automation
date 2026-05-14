# Flujo Automatizado - Conductores y Subcontratos

## Resumen Ejecutivo

Cuando se crea un **SUBCONTRATO (Transportista)** o un **CONDUCTOR**, el sistema automáticamente habilita TODOS los portales y permisos necesarios sin intervención manual.

---

## Flujo 1: Crear Subcontrato (Empresa/Transportista)

### API Endpoint
```
POST /api/organizations
```

### Body Requerido
```json
{
  "name": "TRANSPORTES QL SPA",
  "tax_id": "78365485-7",
  "service_type": "TRANSPORTE",
  "email": "contacto@transportesql.cl"
}
```

### Auto-Setup Ejecutado
✅ Crea `organizaciones` en BD
✅ Crea `transportista_auth` con:
   - RUT: 78365485-7
   - Contraseña: `labbe5857` (labbe + últimos 4 dígitos)
   - is_active: true
✅ Empresa lista para login en Portal de Subcontratistas

### Resultado
- **URL Portal**: `/subcontractors/login`
- **Login**: RUT empresa + contraseña generada
- **Permisos**: Subir documentos, gestionar expedientes

---

## Flujo 2: Crear Conductor

### API Endpoint
```
POST /api/conductores/create
```

### Body Requerido
```json
{
  "rut": "22504079-6",
  "nombres": "Joaquín",
  "apellido_paterno": "Quispe",
  "apellido_materno": "Maguina",
  "rut_proveedor": "78365485",
  "clase_licencia": "B",
  "is_active": true
}
```

### Auto-Setup Ejecutado
✅ Crea `conductores` en BD
✅ Crea `conductor_auth` con:
   - RUT personal: 22504079-6
   - Contraseña: `labbe4079` (labbe + últimos 4 dígitos)
   - is_active: true
✅ Crea `conductor_licenses` (clases A2 y A5)
✅ Crea `conductor_settings` con:
   - can_upload_documents: true
✅ Conductor listo para login en Portal de Conductores

### Resultado
- **URL Portal**: `/auth/login-conductor`
- **Login**: RUT personal + contraseña generada
- **Permisos**: Ver documentos requeridos, subir documentos

---

## Proceso Completo: Del Subcontrato al Conductor Operativo

### Paso 1: Crear Subcontrato
```bash
curl -X POST "http://localhost:3000/api/organizations" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TRANSPORTES QL SPA",
    "tax_id": "78365485-7",
    "service_type": "TRANSPORTE"
  }'
```

**Resultado**: Empresa habilitada con credenciales automáticas

---

### Paso 2: Crear Conductor para Subcontrato
```bash
curl -X POST "http://localhost:3000/api/conductores/create" \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "22504079-6",
    "nombres": "Joaquín",
    "apellido_paterno": "Quispe",
    "apellido_materno": "Maguina",
    "rut_proveedor": "78365485",
    "clase_licencia": "B",
    "is_active": true
  }'
```

**Resultado**: Conductor habilitado con acceso a portal y permisos de documentos

---

### Paso 3: Conductor Hace Login (Sin Intervención Manual)
```
URL: /auth/login-conductor
RUT: 22504079-6
Contraseña: labbe4079
```

✅ Acceso inmediato a:
- Dashboard de Documentos
- Subir documentos requeridos
- Ver estado de revisión

---

### Paso 4: Ejecutiva Revisa y Aprueba (Sin Intervención Manual)
```
URL: /dashboard
Email: csepulveda@labbe.cl
```

✅ Acceso inmediato a:
- Gestor de Documentos
- Documentos Pendientes
- Aprobar/Rechazar documentos

---

## Contraseñas Generadas Automáticamente

### Fórmula Estándar
```
labbe + últimos 4 dígitos del RUT (sin guion, puntos ni dígito verificador)
```

### Ejemplos
| RUT | Contraseña |
|-----|-----------|
| 78365485-7 | labbe5485 |
| 22504079-6 | labbe4079 |
| 18450987-1 | labbe0987 |

**Nota**: El RUT se normaliza a 8 dígitos, luego se toman los últimos 4

---

## Tablas de BD Afectadas

### Organizaciones (Subcontratos)
- `organizations` - Empresa creada
- `transportista_auth` - Credenciales auto-creadas ✅

### Conductores
- `conductores` - Conductor creado
- `conductor_auth` - Credenciales auto-creadas ✅
- `conductor_licenses` - Licencias auto-creadas ✅
- `conductor_settings` - Permisos auto-creados ✅

---

## Endpoints Clave

| Endpoint | Método | Propósito | Auto-Setup |
|----------|--------|-----------|-----------|
| `/api/organizations` | POST | Crear subcontrato | ✅ Crea transportista_auth |
| `/api/conductores/create` | POST | Crear conductor | ✅ Crea auth, licenses, settings |
| `/api/admin/setup-transportista` | POST | Setup manual emergencia | Manual |
| `/subcontractors/login` | GET | Portal subcontratistas | Usa transportista_auth |
| `/auth/login-conductor` | GET | Portal conductores | Usa conductor_auth |
| `/dashboard` | GET | Panel ejecutivas | Usa executive_staff auth |

---

## Verificación

### Test Rápido: Crear Empresa + Conductor
```bash
# 1. Crear empresa
ORG_RESPONSE=$(curl -X POST "http://localhost:3000/api/organizations" \
  -H "Content-Type: application/json" \
  -d '{"name":"TEST SPA","tax_id":"12345678-9"}')

# 2. Crear conductor
curl -X POST "http://localhost:3000/api/conductores/create" \
  -H "Content-Type: application/json" \
  -d '{
    "rut":"20000000-1",
    "nombres":"Test",
    "apellido_paterno":"User",
    "rut_proveedor":"12345678",
    "clase_licencia":"B"
  }'

# 3. Verificar login
# - Portal subcontratistas: /subcontractors/login (RUT: 12345678-9, Pass: labbe5678)
# - Portal conductores: /auth/login-conductor (RUT: 20000000-1, Pass: labbe0001)
```

---

## Notas Importantes

1. **Automatización Completa**: No requiere intervención manual para habilitar portales
2. **Contraseñas**: Se generan automáticamente, no almacenadas en texto plano
3. **Ejecutivas**: Se asignan basado en `rut_proveedor` → match con `transportistas` → `assigned_executive_id`
4. **LTS Flag**: Se habilita automáticamente en subcontratistas para gestión de documentos
5. **Zero-Touch**: Después de crear empresa + conductor, ambos están 100% operativos

---

## Cambios Recientes (May 14, 2026)

✅ Auto-create `transportista_auth` en POST `/api/organizations`
✅ Auto-create `conductor_settings` en POST `/api/conductores/create`
✅ Contraseña estándar: `labbe + últimos 4 dígitos RUT`
✅ Documentos habilitados automáticamente para conductores
✅ Portales operativos sin intervención manual

