# PLAN EJECUTIVO - SEMANA 2 (MVP DocuFleet)

## ESTADO ACTUAL - SEMANA 1 vs REALIDAD

### ✅ COMPLETADO de Semana 1 (Infraestructura Base)
- [x] Configuración Supabase (Auth, DB, Storage, RLS)
- [x] Esquema DB finalizado (profiles, organizations, certificates, documents)
- [x] Sistema de autenticación con 5 roles (admin, dispatcher, driver, mandante, transportista)
- [x] Variables de entorno configuradas

### ⚠️ PARCIALMENTE - Semana 1
- [ ] CI/CD pipeline en Vercel (parcial - deploy automático OK, tests NO)

**Semana 1: 90% COMPLETO ✅**

---

## SEMANA 2: MODELO DE DATOS Y APIs

### Entregables Obligatorios (MVP Roadmap)
1. **API CRUD Organizaciones** (mandantes/transportistas)
   - POST /organizations - crear
   - GET /organizations - listar
   - PUT /organizations/:id - actualizar
   - DELETE /organizations/:id - eliminar
   - Status: NO HECHO

2. **API CRUD Conductores y Vehículos**
   - POST /drivers - crear conductor
   - GET /drivers - listar conductores
   - PUT /drivers/:id - actualizar
   - DELETE /drivers/:id - eliminar
   - POST /vehicles - crear vehículo
   - GET /vehicles - listar vehículos
   - PUT /vehicles/:id - actualizar
   - DELETE /vehicles/:id - eliminar
   - Status: NO HECHO

3. **API CRUD Certificados/Documentos**
   - POST /documents - guardar documento
   - GET /documents - listar documentos
   - PUT /documents/:id - actualizar
   - DELETE /documents/:id - eliminar
   - GET /documents/:id/validate - validar documento
   - Status: PARCIAL (solo save/validate, falta CRUD completo)

4. **API Alertas y Notificaciones**
   - POST /alerts/configure - configurar alertas
   - GET /alerts - listar alertas pendientes
   - POST /alerts/:id/acknowledge - marcar como visto
   - Status: NO HECHO

5. **Validaciones de Datos**
   - RUT (checksum chileno)
   - Patentes (formato)
   - Fechas (ISO 8601)
   - Status: PARCIAL (RUT OK, falta patentes)

6. **Middleware de Autorización por Rol**
   - Status: PARCIAL (auth básico OK, falta RLS completo en tablas)

7. **Documentación API (Swagger/OpenAPI)**
   - Status: NO HECHO

---

## PLAN EJECUTIVO SEMANA 2

### Prioridad 1 - CRÍTICO (Lunes-Miércoles)
**APIs CRUD Conductores y Vehículos**
- [ ] Crear tabla drivers (si no existe)
- [ ] Crear tabla vehicles (si no existe)
- [ ] Crear rutas GET /api/drivers
- [ ] Crear rutas POST /api/drivers
- [ ] Crear rutas PUT /api/drivers/:id
- [ ] Crear rutas DELETE /api/drivers/:id
- [ ] Crear rutas GET /api/vehicles
- [ ] Crear rutas POST /api/vehicles
- [ ] Crear rutas PUT /api/vehicles/:id
- [ ] Crear rutas DELETE /api/vehicles/:id
- [ ] Testing: 10 llamadas a cada endpoint

**Tiempo estimado:** 6 horas

### Prioridad 2 - ALTO (Miércoles-Jueves)
**APIs CRUD Organizaciones**
- [ ] Crear rutas GET /api/organizations
- [ ] Crear rutas POST /api/organizations
- [ ] Crear rutas PUT /api/organizations/:id
- [ ] Crear rutas DELETE /api/organizations/:id
- [ ] Asociar organizaciones a usuarios (1 org = 1 transportista/mandante)
- [ ] Testing: 10 llamadas a cada endpoint

**Tiempo estimado:** 4 horas

### Prioridad 3 - ALTO (Jueves)
**Validaciones de Datos**
- [ ] Validador de patentes (ABC-1234)
- [ ] Validador de RUT (ya existe, completar)
- [ ] Validador de fechas
- [ ] Aplicar validadores en todos los endpoints
- [ ] Testing: 30 casos de validación

**Tiempo estimado:** 3 horas

### Prioridad 4 - MEDIO (Viernes)
**Documentación API (Swagger)**
- [ ] Instalar swagger-ui-express
- [ ] Documentar todos los endpoints
- [ ] Crear endpoint GET /api/docs

**Tiempo estimado:** 2 horas

---

## HITO SEMANA 2
✅ **APIs funcionales con CRUD completo para:**
- Organizaciones (transportistas/mandantes)
- Conductores
- Vehículos
- Documentos (mejorado)

✅ **Validaciones de datos robustas**

✅ **Documentación Swagger/OpenAPI**

---

## DEPENDENCIAS SEMANAS FUTURAS
- Semana 3 requiere estas APIs funcionando 100%
- Semana 4 (Upload de documentos) depende de API de documentos
- Semana 5 (OCR) depende de API de documentos

---

## CRITERIOS DE ACEPTACIÓN SEMANA 2

- [ ] 100% de endpoints respondiendo con status 200/201/204
- [ ] 100% validaciones funcionando
- [ ] 0 console errors en backend
- [ ] Documentación Swagger accesible en /api/docs
- [ ] Base de datos sin datos corruptos
- [ ] Tests manuales exitosos (Postman/Thunder Client)

**Go/No-Go para Semana 3:** Todos los criterios deben estar ✅
