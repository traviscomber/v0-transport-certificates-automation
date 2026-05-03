# ✅ Sistema de Alertas - Checklist de Deployment

## Estado Actual
- [x] Funciones de alertas implementadas
- [x] Integración en endpoints de validación
- [x] Dashboard mejorado
- [x] Cron job configurado
- [x] Documentación completa

## Antes de Publicar a Producción

### 1. Verificar Base de Datos
- [ ] Tabla `alerts` existe con schema correcto:
  ```
  id, user_id, title, message, type, priority, level, category,
  read, is_resolved, metadata, action_url, created_at, updated_at
  ```
- [ ] Tabla `uploaded_documents` tiene columna `last_expiration_alert_sent`
- [ ] Tabla `conductores` existe con columnas: `nombres`, `apellido_paterno`, `apellido_materno`

### 2. Verificar Supabase
- [ ] Tabla `alerts` existe en Supabase
- [ ] RLS policies configuradas correctamente
- [ ] Service role key está en `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Admin client está configurado correctamente

### 3. Configurar Variables de Entorno
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `INTERNAL_API_KEY` configurada (opcional pero recomendado)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada si es pública

### 4. Testing en Desarrollo
- [ ] GET manual funciona: `curl http://localhost:3000/api/company/alerts/check-expiring-documents`
- [ ] Aparecen alertas en el dashboard
- [ ] Filtros funcionan correctamente
- [ ] Status change alerts se generan en validación
- [ ] Badges de prioridad se ven correctamente

### 5. Verificar Archivos Creados
- [ ] ✓ `/vercel/share/v0-project/vercel.json` (cron config)
- [ ] ✓ `/vercel/share/v0-project/app/api/company/alerts/check-expiring-documents/route.ts`
- [ ] ✓ Funciones en `lib/document-alerts-generator.ts`
- [ ] ✓ Integración en `app/api/documents/validate/route.ts`
- [ ] ✓ Integración en `lib/human-in-the-loop.ts`
- [ ] ✓ Dashboard mejorado en `app/dashboard/company/alertas/page.tsx`

### 6. Deploy Steps
```bash
# 1. Commit los cambios
git add .
git commit -m "feat: Add comprehensive alerts system with cron jobs

- Implement document status change alerts with priority levels
- Add automatic expiration alerts via Vercel cron jobs
- Improve alerts dashboard with filtering and better UI
- Integrate alerts in document validation endpoints
- Add GET/POST endpoints for manual and automatic triggers"

# 2. Push a rama de feature
git push origin feature/alerts-system

# 3. Crear PR y verificar
# - Tests pasan
# - Preview funciona
# - Logs muestran sin errores

# 4. Merge a main
git checkout main
git pull origin main
git merge feature/alerts-system
git push origin main

# 5. Verifica deployment en Vercel
# - Espera a que compile
# - Verifica que vercel.json se detecte
# - Cron job debe aparecer en Functions
```

### 7. Verificar Post-Deploy
- [ ] Deployment exitoso en Vercel
- [ ] `vercel.json` se detectó y cron está activo
- [ ] Endpoint `/api/company/alerts/check-expiring-documents` responde 200
- [ ] Logs muestran ejecución limpia
- [ ] Dashboard carga alertas correctamente
- [ ] Filtros funcionan

### 8. Monitoreo Primeras 24h
- [ ] Cron se ejecutó a las 6 AM UTC (esperado 1h después del deploy)
- [ ] Alertas se generaron correctamente
- [ ] No hay errores en logs de Vercel
- [ ] Dashboard muestra nuevas alertas
- [ ] Conductores reciben notificaciones

### 9. Configurar Alertas en Vercel (Opcional pero Recomendado)
En Vercel Project Settings:
- [ ] Habilitar notificaciones por email en deployments
- [ ] Configura webhook para errores de funciones
- [ ] Alertas de performance si es lenta

## Documentación Entregada
- [x] `/docs/ALERTS_SYSTEM.md` - Overview completo
- [x] `/docs/CRON_JOB_SETUP.md` - Guía detallada de cron
- [x] Este archivo - Checklist de deployment

## Tabla de Prioridades Implementada
```
┌────────────────────────────────────────────────────┐
│ PRIORIDAD │ COLOR   │ CUANDO                       │
├────────────────────────────────────────────────────┤
│ CRITICAL  │ ROJO    │ Vencido/Vence hoy            │
│ HIGH      │ NARANJA │ Vence en 7 días + Rechazos   │
│ NORMAL    │ AZUL    │ Vence en 30 días             │
│ LOW       │ GRIS    │ Informativo                  │
└────────────────────────────────────────────────────┘
```

## Endpoints Clave
```
GET/POST /api/company/alerts/check-expiring-documents
└─ Genera alertas de vencimiento
└─ GET: Testing manual (desarrollo)
└─ POST: Cron + API calls con auth
└─ Response: {success, message, timestamp, source}

GET/POST /api/alerts?limit=100&sort=created_at.desc
└─ Lista alertas del usuario
└─ Filtrable por tipo, prioridad, categoría
└─ Paginado

GET /dashboard/company/alertas
└─ Dashboard de alertas mejorado
└─ Filtros por prioridad y categoría
└─ Estadísticas por nivel
└─ Búsqueda por texto
```

## Funciones Integradas
```
generateDocumentStatusChangeAlert()
├─ Crea alertas cuando doc es aprobado/rechazado
├─ Notifica conductor + admins
├─ Prioridad automática según estado
└─ Incluye razón de rechazo

generateExpirationAlerts()
├─ Busca docs próximos a vencer
├─ Genera alertas por prioridad
├─ Deduplicación por 24h
└─ Notifica admins/supervisores

generateReviewAlerts() [en human-in-the-loop.ts]
├─ Complementa generateDocumentStatusChangeAlert
├─ Se ejecuta en revisiones manuales
├─ Obtiene conductor info automáticamente
└─ Maneja notas y razones
```

## Próximos Pasos Opcionales
- [ ] Agregar endpoint en Admin para "Test Alerts Now"
- [ ] Email notifications para alertas CRITICAL
- [ ] Integración Slack para notificaciones
- [ ] Dashboard analytics de alertas
- [ ] Webhook para sistemas externos

## Notas Importantes
⚠️ El cron se activa ~1 hora después del deploy inicial
⚠️ Timeout máximo: 30 segundos (suficiente para alertas)
⚠️ Schedule en UTC - ajustar según zona horaria
⚠️ Primera ejecución: ~1 hora después del deploy

## Soporte
Si hay problemas:
1. Ver logs en Vercel Deployment
2. Verificar que tabla `alerts` existe
3. Verificar service role key en Supabase
4. Ejecutar GET manual para debug
5. Ver `docs/CRON_JOB_SETUP.md` troubleshooting

---

**Creado**: Sistema de Alertas Inteligente v1.0
**Estado**: Ready for Production Deploy
