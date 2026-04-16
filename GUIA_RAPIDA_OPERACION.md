# 🚀 GUÍA RÁPIDA - Operación del Sitio

## ✅ LO QUE YA ESTÁ LISTO

### 1. FILTROS DE CONDUCTORES (Mejorado)
```
/admin/conductores

Nuevos filtros:
- Por empresa (RUT proveedor)
- Por tipo vehículo (TRACTO, TAXI, etc)
- Por estado de licencia (Activa/Por Vencer/Vencida)
- Búsqueda por RUT o nombre

Información mostrada:
- Licencia actual (A2 antigua → A5 nueva)
- Fecha de cambio legal (A2→A5)
- Estado de operación
- Certificaciones
```

### 2. MÓDULO DE POSTULANTES (Nuevo)
```
/admin/postulantes

Flujo:
1. Crear nuevo postulante
2. Sistema chequea antecedentes
3. Postulante sube documentación
4. Aprobación por Onboarding + Prevención de Riesgos
5. Conductor registrado en sistema operacional

Estados:
✓ Nuevo
✓ Chequeo de antecedentes
✓ Documentación
✓ Aprobado/Rechazado
```

### 3. GESTIÓN DE LIQUIDACIONES
```
Estados: RESUELTO EL PAIN POINT

- Ver estado de liquidación de cada conductor
- Filtrar por: Pendiente, En revisión, Aprobado, Pagado
- Auditoría de quién aprobó y cuándo
- Fecha de pago registrada
```

### 4. SERVICIOS LABBE COMO EMPRESA
```
Empresa: Labbe (Prestación de servicios)
Tipo: service_provider

Ya puedes:
- Registrar Labbe como empresa
- Clasificar sus servicios
- Filtrar conductores/operaciones por tipo
```

### 5. ESTANDARIZACIÓN DE ARCHIVOS
```
Nuevo campo: standardized_filename

Aplica a:
- Licencias
- Certificaciones
- Documentos de postulantes

Formato: [tipo]_[rut_conductor]_[fecha].pdf
```

---

## 📱 MENÚ DEL ADMIN

Ve a `/admin` y verás:

```
📊 Dashboard
🏢 Mandantes
🚛 Transportistas
🚗 Vehículos
👥 Conductores ← (Mejorado con filtros)
👤 Postulantes ← (NUEVO - Módulo completo)
📄 Documentos
🔐 Roles y Permisos ← (Actualizado con nuevos roles)
📈 Reportes
```

---

## 👥 PERMISOS POR ROL

**Admin** → Acceso a todo

**Onboarding** → 
- Ver/crear postulantes
- Aprobar postulantes
- Gestionar datos de conductores

**Prevención de Riesgos** →
- Ver postulantes
- Gestionar certificaciones
- Aprobar documentación

**Liquidaciones** →
- Ver liquidaciones
- Aprobar liquidaciones
- Marcar como pagado

---

## 🎯 PRÓXIMOS PASOS

### Ahora puedes:
1. ✅ Filtrar conductores por empresa/RUT/tipo vehículo
2. ✅ Gestionar postulantes desde registro hasta conductor
3. ✅ Ver estado de liquidaciones en tiempo real
4. ✅ Asignar roles granulares a usuarios
5. ✅ Registrar servicios Labbe como empresa
6. ✅ Estandarizar nombres de archivos

### Opcional (para mejorar):
- Integración con sitio de antecedentes (API automática)
- Dashboard de liquidaciones con gráficos
- Alertas de vencimientos (emails/notificaciones)
- Reportes operacionales
- Búsqueda avanzada de postulantes

---

## 🔗 URLS IMPORTANTES

```
/admin/conductores           → Gestión de conductores (MEJORADO)
/admin/postulantes           → Módulo de postulantes (NUEVO)
/admin/postulantes/nuevo     → Registrar nuevo postulante
/admin/roles                 → Gestión de roles (ACTUALIZADO)
```

---

## 💾 BASE DE DATOS

Se crearon **6 nuevas tablas**:
- `applicants` - Postulantes
- `driver_licenses` - Licencias
- `driver_certifications` - Certificaciones
- `driver_liquidations` - Liquidaciones
- `subcontractor_drivers` - Conductores subcontratistas
- `applicant_approvals` - Auditoría de aprobaciones

Todas con:
✅ RLS policies activadas
✅ Índices de performance
✅ Auditoría de cambios
✅ Permisos por rol

---

## 🆘 PROBLEMAS?

Si algo no funciona:
1. Verifica que ejecutaste ambos SQL scripts (Phase 1 y Phase 4)
2. Recarga la página (`Ctrl+Shift+R`)
3. Verifica que el usuario tiene rol asignado en la BD
4. Revisa los logs en la consola del navegador

---

**¡LISTO PARA PRODUCCIÓN!** 🎉
