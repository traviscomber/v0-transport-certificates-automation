# 🎯 Guía Rápida - Sistema de Gestión Transportes Labbe

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Acceder al Portal de Empresas
```
URL: http://localhost:3000/auth/login-company
```

### 2️⃣ Credenciales de Prueba

#### Admin Labbe (Ve todas las empresas)
```
RUT: 77266269-9
Contraseña: labbe2024!
→ Redirige a: /dashboard/admin
```

#### Empresa Transportista (Ve solo sus datos)
```
RUT: 8596954-3  (Transportes Eduardo Aiarcon)
Contraseña: labbe2024!
→ Redirige a: /dashboard/company

O cualquier otro RUT de la lista importada
```

---

## 📋 Funcionalidades Actuales

### Dashboard Admin Labbe
✅ Ver todas las empresas transportistas (30+)
✅ Estadísticas: Total empresas, documentos pendientes, activos
✅ Tabla con: RUT, Empresa, Representante, Email, Región
✅ Botón "Ver Detalles" para cada empresa
✅ Opción para agregar nueva empresa

### Dashboard Empresa Transportista
✅ Ver información propia: RUT, nombre, representante, datos de contacto
✅ Estadísticas: Documentos subidos, en revisión, aprobados
✅ Sección para cargar documentos (UI básica)
✅ Botones: Configuración, Cerrar sesión

### Autenticación
✅ Login por RUT + contraseña
✅ Validación de campos en tiempo real
✅ Sesiones seguras (cookies HTTP-only)
✅ Redirección automática según rol
✅ Logout limpio

---

## 🗄️ Base de Datos

### Tabla `companies`
```sql
- id: UUID (Primary Key)
- rut: TEXT UNIQUE (12345678-9)
- name: TEXT
- representative: TEXT
- email: TEXT
- phone: TEXT
- address: TEXT
- region: TEXT
- password_hash: TEXT (bcrypt)
- is_labbe_admin: BOOLEAN (true solo para Labbe)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Datos Importados
- 30 empresas transportistas de 4 imágenes
- 1 admin Labbe (77266269-9)
- Total: 31 registros
- Todas con contraseña: `labbe2024!`

---

## 🔐 Contraseña Inicial

Todas las empresas tienen la misma contraseña inicial para simplificar las pruebas:

```
Contraseña: labbe2024!
Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.
```

### Cambiar Contraseña
El sistema tiene soporte para cambiar contraseña después del primer login.
Usar la función: `changeCompanyPassword(companyId, oldPassword, newPassword)`

---

## 📂 Estructura de Archivos

### Autenticación
- `/lib/supabase/auth-rut.ts` - Funciones de autenticación
- `/app/api/auth/login-rut/route.ts` - API de login
- `/app/api/auth/logout/route.ts` - API de logout

### Páginas
- `/app/auth/login-company` - Login de empresas/Labbe
- `/app/dashboard/admin` - Dashboard admin
- `/app/dashboard/company` - Dashboard empresa

### APIs de Datos
- `/app/api/company/profile` - Obtener perfil de empresa
- `/app/api/admin/companies` - Obtener todas las empresas

---

## 🧪 Casos de Prueba

### Caso 1: Empresa Transportista
1. Ir a `/auth/login-company`
2. Ingresar RUT: `8596954-3`
3. Ingresar contraseña: `labbe2024!`
4. ✅ Debe redirigir a `/dashboard/company`
5. ✅ Debe mostrar información de "Transportes Eduardo Aiarcon"

### Caso 2: Admin Labbe
1. Ir a `/auth/login-company`
2. Ingresar RUT: `77266269-9`
3. Ingresar contraseña: `labbe2024!`
4. ✅ Debe redirigir a `/dashboard/admin`
5. ✅ Debe mostrar lista de 30 empresas

### Caso 3: Login Incorrecto
1. Ir a `/auth/login-company`
2. Ingresar RUT: `1234567-8` (no existe)
3. Ingresar contraseña: `labbe2024!`
4. ✅ Debe mostrar error: "RUT o contraseña incorrectos"

### Caso 4: Logout
1. Después de login, hacer click en "Cerrar Sesión"
2. ✅ Debe limpiar cookies
3. ✅ Debe redirigir a `/auth/login-company`

---

## 🔗 URLs Principales

| URL | Descripción |
|-----|-------------|
| `/` | Home page (con links a portales) |
| `/auth/login-company` | Login de empresas y Labbe |
| `/auth/login` | Login tradicional (admin/dev) |
| `/dashboard/admin` | Dashboard admin Labbe |
| `/dashboard/company` | Dashboard empresa transportista |

---

## 📝 Empresas Disponibles para Prueba

| RUT | Empresa | Región |
|-----|---------|--------|
| 77266269-9 | Transportes Labbe (ADMIN) | Metropolitana |
| 8596954-3 | Transportes Eduardo Aiarcon | Cecilia |
| 8852602-9 | Transportes Eric Daret | Cecilia |
| 15499350-4 | Transportes Esem Spa | Cecilia |
| 12954149-1 | Transportes Espinoza Ignacio | Cecilia |
| 11789536-3 | TRANSPORTES HONI VALLADARES | Santiago |
| ... | (25+ más) | Varias |

Todas usan contraseña: **labbe2024!**

---

## 🚀 Próximos Pasos (Roadmap)

### Fase 2: Gestión de Documentos
- [ ] Crear tabla `documents` (company_id FK)
- [ ] Upload de documentos por empresa
- [ ] Vista de documentos en dashboard
- [ ] Estado de documentos: Pendiente, Revisado, Aprobado

### Fase 3: Revisión y Validación
- [ ] Panel de revisión para admin
- [ ] Validación automática de documentos
- [ ] Sistema de comentarios Labbe → Empresa

### Fase 4: Notificaciones y Reportes
- [ ] Alertas de vencimiento
- [ ] Reportes por empresa
- [ ] Reportes por región
- [ ] Email notifications

### Fase 5: Seguridad Avanzada
- [ ] Row Level Security (RLS) en Supabase
- [ ] 2FA (Two-Factor Authentication)
- [ ] Audit logs
- [ ] Rate limiting

---

## ⚠️ Notas Importantes

1. **Contraseña genérica**: Se usa `labbe2024!` para todas las empresas inicialmente
2. **No hay validación de RUT chileno**: Aceptas cualquier formato numérico
3. **Documentos no implementados**: Los dashboards muestran "0" documentos (placeholder)
4. **RLS no configurado**: Cualquier admin puede ver todas las empresas (sin restricciones en BD)
5. **Producción**: Cambiar contraseña genérica y configurar RLS en Supabase

---

## 💡 Tips

- Usa la contraseña `labbe2024!` para todos los logins de prueba
- Ingresa el RUT sin formatear: `77266269-9` o `772662699`
- Abre múltiples pestañas para probar admin y empresa simultáneamente
- Los errores de validación aparecen debajo de los campos
- La sesión dura 7 días (se resetea con logout)

---

**¡Sistema listo para usar!** 🎉
