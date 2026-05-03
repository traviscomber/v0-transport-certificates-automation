# 🧪 Guía de Prueba Completa - Sistema Transportes Labbe

## 📋 Resumen de Implementación

El sistema está **completamente funcional** y listo para prueba. Incluye:

✅ Base de datos con 31 empresas importadas
✅ Autenticación por RUT con bcrypt
✅ Dashboards diferenciados (Admin/Empresa)
✅ APIs de datos seguras
✅ Sesiones HTTP-only
✅ Landing page actualizada

---

## 🧪 Casos de Prueba (Step-by-Step)

### TEST 1: Acceso a Home Page
**Objetivo:** Verificar que la home page muestra opciones de login correctas

1. Abrir: `http://localhost:3000/`
2. **Verificar:**
   - ✅ Título: "Compliance documental 100% automatizado"
   - ✅ Dos botones CTA: "Portal de Empresas" y "Admin/Desarrollador"
   - ✅ Navigation con links a ambos portales
   - ✅ Stats section visible

**Resultado esperado:** Home page carga sin errores

---

### TEST 2: Admin Labbe Login (Rut Válido)
**Objetivo:** Verificar que admin Labbe puede loguearse y accede al dashboard correcto

**Pasos:**
1. Click en "Portal de Empresas" o ir a `/auth/login-company`
2. Ingresar RUT: `77266269-9`
3. Ingresar contraseña: `labbe2024!`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Sin errores de validación
- ✅ Botón deshabilitado mientras se carga
- ✅ Redirige a `/dashboard/admin`
- ✅ Muestra "Dashboard Admin - Transportes Labbe"
- ✅ Stats muestran: 31 empresas, 30 activas
- ✅ Tabla muestra todas las empresas ordenadas por nombre

**Resultado esperado:** ✅ LOGIN EXITOSO → DASHBOARD ADMIN

---

### TEST 3: Empresa Transportista Login (Rut Válido)
**Objetivo:** Verificar que una empresa puede loguearse y accede a su dashboard

**Pasos:**
1. Ir a `/auth/login-company`
2. Ingresar RUT: `8596954-3`
3. Ingresar contraseña: `labbe2024!`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Sin errores de validación
- ✅ Redirige a `/dashboard/company`
- ✅ Muestra nombre de empresa: "Transportes Eduardo Aiarcon"
- ✅ Muestra datos: RUT, representante, email, teléfono, región, dirección
- ✅ Stats muestran: 0 documentos subidos, 0 en revisión, 0 aprobados
- ✅ Botones: "Configuración", "Cerrar Sesión"

**Resultado esperado:** ✅ LOGIN EXITOSO → DASHBOARD EMPRESA

---

### TEST 4: Validación de Campos - RUT Vacío
**Objetivo:** Verificar validación de entrada en RUT

**Pasos:**
1. Ir a `/auth/login-company`
2. Dejar RUT vacío
3. Ingresar contraseña: `labbe2024!`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Botón "Iniciar Sesión" está DESHABILITADO
- ✅ Mensaje de error bajo RUT: "El RUT es requerido"
- ✅ El formulario NO se envía

**Resultado esperado:** ✅ VALIDACIÓN CORRECTA

---

### TEST 5: Validación de Campos - RUT Inválido
**Objetivo:** Verificar formato de RUT

**Pasos:**
1. Ir a `/auth/login-company`
2. Ingresar RUT: `abc123`
3. Ingresar contraseña: `labbe2024!`

**Verificar:**
- ✅ Botón "Iniciar Sesión" está DESHABILITADO
- ✅ Mensaje de error: "RUT inválido. Ej: 12345678-9"

**Resultado esperado:** ✅ VALIDACIÓN CORRECTA

---

### TEST 6: Validación de Campos - Contraseña Corta
**Objetivo:** Verificar validación de contraseña

**Pasos:**
1. Ir a `/auth/login-company`
2. Ingresar RUT: `77266269-9`
3. Ingresar contraseña: `123`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Botón "Iniciar Sesión" está DESHABILITADO
- ✅ Mensaje de error: "Mínimo 6 caracteres"

**Resultado esperado:** ✅ VALIDACIÓN CORRECTA

---

### TEST 7: Login Incorrecto - RUT No Existe
**Objetivo:** Verificar manejo de credenciales incorrectas

**Pasos:**
1. Ir a `/auth/login-company`
2. Ingresar RUT: `99999999-9`
3. Ingresar contraseña: `labbe2024!`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Muestra alert error: "RUT o contraseña incorrectos"
- ✅ NO redirige a dashboard
- ✅ Usuario permanece en login page

**Resultado esperado:** ✅ ERROR CORRECTO

---

### TEST 8: Login Incorrecto - Contraseña Incorrecta
**Objetivo:** Verificar autenticación con contraseña incorrecta

**Pasos:**
1. Ir a `/auth/login-company`
2. Ingresar RUT: `77266269-9`
3. Ingresar contraseña: `contraseñaincorrecta`
4. Click en "Iniciar Sesión"

**Verificar:**
- ✅ Muestra alert error: "RUT o contraseña incorrectos"
- ✅ NO redirige a dashboard
- ✅ Usuario permanece en login page

**Resultado esperado:** ✅ ERROR CORRECTO

---

### TEST 9: Logout
**Objetivo:** Verificar que el logout limpia sesión correctamente

**Pasos:**
1. Login como admin Labbe (RUT: 77266269-9)
2. En dashboard, click en "Cerrar Sesión"
3. Esperar redirección

**Verificar:**
- ✅ Redirige a `/auth/login-company`
- ✅ Cookies eliminadas (company_id, company_rut, is_labbe_admin)
- ✅ No puedes acceder a `/dashboard/admin` sin login
- ✅ Intentar `/dashboard/admin` te devuelve a login

**Resultado esperado:** ✅ LOGOUT EXITOSO

---

### TEST 10: Sesión Activa - Acceso Directo
**Objetivo:** Verificar que puedes acceder directo al dashboard si hay sesión

**Pasos:**
1. Login como empresa (RUT: 8596954-3)
2. Nota la URL: `/dashboard/company`
3. Actualiza la página (F5)
4. Abre nueva pestaña y ve a `/dashboard/company`

**Verificar:**
- ✅ Dashboard sigue funcionando (sesión activa)
- ✅ Muestra datos de la misma empresa
- ✅ Datos se cargan correctamente

**Resultado esperado:** ✅ SESIÓN PERSISTENTE

---

### TEST 11: Acceso No Autorizado
**Objetivo:** Verificar separación de roles

**Pasos:**
1. Login como empresa (RUT: 8596954-3)
2. Intenta acceder a `/dashboard/admin`

**Verificar:**
- ✅ NO puedes ver datos de admin
- ✅ API `/api/admin/companies` retorna 403 Forbidden (porque is_labbe_admin ≠ true)

**Resultado esperado:** ✅ SEGURIDAD CORRECTA

---

### TEST 12: Múltiples Sesiones
**Objetivo:** Verificar que dos usuarios pueden estar logueados simultáneamente en pestañas diferentes

**Pasos:**
1. Pestaña A: Login como Admin Labbe (77266269-9)
2. Pestaña B: Login como Empresa (8596954-3)
3. Vuelve a Pestaña A
4. Vuelve a Pestaña B

**Verificar:**
- ✅ Pestaña A muestra Dashboard Admin
- ✅ Pestaña B muestra Dashboard Empresa
- ✅ Cada sesión es independiente (cookies diferentes)

**Resultado esperado:** ✅ SESIONES INDEPENDIENTES

---

### TEST 13: API - Obtener Perfil de Empresa
**Objetivo:** Verificar API de perfil

**Pasos:**
1. Login como empresa (RUT: 8596954-3)
2. Abre DevTools → Network
3. En dashboard, verifica la llamada a `/api/company/profile`
4. Verifica respuesta JSON

**Verificar:**
- ✅ GET `/api/company/profile` retorna 200
- ✅ Response incluye: id, rut, name, representative, email, phone, address, region
- ✅ Solo retorna datos de LA EMPRESA LOGUEADA

**Resultado esperado:** ✅ API FUNCIONANDO

---

### TEST 14: API - Listar Todas las Empresas
**Objetivo:** Verificar API de admin

**Pasos:**
1. Login como Admin Labbe (77266269-9)
2. Abre DevTools → Network
3. En dashboard, verifica llamada a `/api/admin/companies`
4. Verifica respuesta JSON

**Verificar:**
- ✅ GET `/api/admin/companies` retorna 200
- ✅ Response incluye array de 31 empresas (ordenadas por nombre)
- ✅ Cada empresa tiene: id, rut, name, representative, email, phone, region, is_labbe_admin

**Resultado esperado:** ✅ API FUNCIONANDO

---

### TEST 15: API - Admin Unauthorized
**Objetivo:** Verificar que empresa NO puede acceder a API de admin

**Pasos:**
1. Login como empresa (RUT: 8596954-3)
2. Abre DevTools → Console
3. Ejecuta:
   ```javascript
   fetch('/api/admin/companies').then(r => r.json()).then(console.log)
   ```

**Verificar:**
- ✅ Retorna 403 Forbidden
- ✅ Error: "No autorizado"

**Resultado esperado:** ✅ SEGURIDAD CORRECTA

---

## 📊 Datos de Prueba Completos

### Admin Labbe
```
RUT: 77266269-9
Contraseña: labbe2024!
is_labbe_admin: true
```

### Todas las Empresas Disponibles
```
RUT: 8596954-3 - Transportes Eduardo Aiarcon
RUT: 8852602-9 - Transportes Eric Daret
RUT: 15499350-4 - Transportes Esem Spa
RUT: 12954149-1 - Transportes Espinoza Ignacio Spa
RUT: 11789536-3 - TRANSPORTES HONI VALLADARES SPA
RUT: 9741038-0 - Transportes Ignacio Prat Aedo
RUT: 10748200-4 - Transportes Irene Toledo
RUT: 12149387-1 - Transportes Javier Guajardo
RUT: 15499316-2 - Transportes Jose Alejandro Diaz
RUT: 11759152-2 - Transportes Jose Luis Retamal
... (20+ más)
```

---

## ✅ Checklist de Validación

### Autenticación
- [ ] Login por RUT funciona
- [ ] Login rechaza credenciales incorrectas
- [ ] Validación de campos en tiempo real
- [ ] Mensajes de error claros
- [ ] Redirección según rol (admin vs empresa)
- [ ] Logout limpia sesión
- [ ] Sesión persiste al actualizar

### Seguridad
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Cookies HTTP-only
- [ ] Admin no puede acceder a datos de empresa
- [ ] Empresa no puede acceder a datos de admin
- [ ] API valida roles

### Dashboards
- [ ] Admin ve todas las empresas
- [ ] Empresa ve solo sus datos
- [ ] Stats se cargan correctamente
- [ ] Botones funcionan
- [ ] Navegación funciona

### APIs
- [ ] `/api/auth/login-rut` funciona
- [ ] `/api/auth/logout` funciona
- [ ] `/api/company/profile` funciona
- [ ] `/api/admin/companies` funciona
- [ ] Validación de autenticación funciona

---

## 🚀 Próximos Pasos

1. **Gestión de Documentos**
   - Crear tabla `documents` (company_id, filename, status, created_at)
   - API upload de documentos

2. **Cambio de Contraseña**
   - Interfaz en `/dashboard/settings`
   - Usar función `changeCompanyPassword()`

3. **Row Level Security**
   - Configurar RLS en Supabase
   - Documentos solo accesibles por empresa/admin

4. **Notificaciones**
   - Email alerts para vencimientos
   - Sistema de notificaciones en BD

---

**¡Listo para probar!** 🎉
