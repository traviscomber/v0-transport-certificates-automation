# Sistema de Alertas Mejorado - Resumen Completo

## 🎯 Objetivo
Sistema inteligente de alertas para notificar sobre cambios de estado de documentos y vencimientos próximos con prioridades automáticas.

## ✅ Lo que está implementado

### 1. Funciones de Generación de Alertas (`lib/document-alerts-generator.ts`)

#### `generateDocumentStatusChangeAlert()`
- **Trigger**: Cuando documento cambia de estado (approved/rejected)
- **A quién notifica**: 
  - Conductor/cliente: notificación de aprobación/rechazo
  - Admins/supervisores: alertas HIGH cuando es rechazado
- **Prioridad automática**: CRITICAL si rechazado, NORMAL si aprobado
- **Incluye**: Tipo de documento, razón de rechazo, timestamp

#### `generateExpirationAlerts()`
- **Trigger**: Ejecutado por cron job diariamente (6 AM UTC)
- **Lógica de alertas**:
  - CRITICAL: Vencido hoy (acción inmediata)
  - CRITICAL: Vence en 1 día (acción inmediata)
  - HIGH: Vence en 7 días (planificar próximas 24h)
  - NORMAL: Vence en 30 días (informativo)
- **Deduplicación**: No envía múltiples alertas en 24h (usa `last_expiration_alert_sent`)
- **Targets**: Todos los ejecutivos/admins/supervisores

### 2. Integración en Endpoints

#### `/api/documents/validate` (Validación Directa)
```
✓ Importa generateDocumentStatusChangeAlert
✓ Se ejecuta al aprobar/rechazar
✓ Incluye nombre conductor y razón rechazo
```

#### `/api/v2/review-queue/[id]` (Cola de Revisión)
```
✓ Nueva función generateReviewAlerts() en human-in-the-loop.ts
✓ Se ejecuta al completar revisión
✓ Obtiene info conductor automáticamente
✓ Maneja notas y razones de rechazo
```

### 3. Cron Job Configuration

#### Archivo `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/company/alerts/check-expiring-documents",
      "schedule": "0 6 * * *"  // 6 AM UTC, todos los días
    }
  ]
}
```

#### Endpoint `/api/company/alerts/check-expiring-documents`
- **Métodos**: GET (testing) y POST (cron + API)
- **Autenticación**: Detecta Vercel Crons automáticamente o valida Authorization header
- **Response**: JSON con resumen de alertas generadas
- **Logs**: Visible en Vercel Deployment Functions logs

### 4. Dashboard de Alertas (`/dashboard/company/alertas`)

#### Estadísticas Mejoradas
- Total de alertas
- Conteo por prioridad (Critical/High/Normal/Low)
- Alertas no leídas

#### Filtros Avanzados
- Por prioridad (dropdown)
- Por categoría (document_approved, document_rejected, document_expiration, document_uploaded)
- Búsqueda de texto en título y mensaje
- Botón "Limpiar" para reset

#### Visualización
- Badges color-coded por prioridad (Rojo/Naranja/Azul/Gris)
- Indicador punto azul para no leídas
- Estado de resolución visible
- Links a detalles de documentos
- Timestamps formateados (Ahora, Hace 5m, Hace 2h, etc)

#### Tarjetas de Alerta Mejoradas
- Icono según prioridad
- Título y mensaje claros
- Badges de categoría
- Link "Ver detalles" con arrow
- Timestamp legible

## 📊 Flujo de Alertas

```
1. DOCUMENTO SUBE
   ↓
   ✓ generateDocumentUploadAlerts() - Notifica a supervisores

2. DOCUMENTO VALIDADO
   ↓
   Si Aprobado: generateDocumentStatusChangeAlert() con NORMAL priority
   Si Rechazado: generateDocumentStatusChangeAlert() con CRITICAL priority
   ↓
   ✓ Notifica conductor + Crea alertas para admins

3. DIARIAMENTE 6 AM UTC
   ↓
   ✓ Cron ejecuta generateExpirationAlerts()
   ↓
   Busca documentos con expiration_date próxima
   Genera alertas por prioridad (CRITICAL/HIGH/NORMAL)
   ↓
   Actualiza last_expiration_alert_sent para deduplicación
   ✓ Notifica admins/supervisores
```

## 🧪 Testing

### Testing Manual
```bash
# GET (desarrollo)
curl http://localhost:3000/api/company/alerts/check-expiring-documents

# POST con API key
curl -X POST http://localhost:3000/api/company/alerts/check-expiring-documents \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Verificar en Dashboard
1. Ve a `/dashboard/company/alertas`
2. Deberías ver alertas ordenadas por reciente
3. Filtra por "Crítica" para ver las más urgentes

### Logs en Producción
Vercel → Project → Deployments → Current → Functions → check-expiring-documents

## 🔧 Configuración

### Variables de Entorno Recomendadas
```
INTERNAL_API_KEY=tu-clave-secreta  # Opcional, para proteger API manual
```

### Cambiar Horario del Cron
Edita `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/company/alerts/check-expiring-documents",
      "schedule": "0 9 * * *"  // Cambiar a 9 AM UTC
    }
  ]
}
```

## 🚀 Deployment

El cron se activa automáticamente cuando despliegas:
```bash
git add vercel.json
git commit -m "Add expiration alerts cron job"
git push origin main
```

## 📝 Notas Importantes

1. **Primer run**: ~1 hora después del deploy
2. **Timeout**: 30 segundos máximo
3. **Deduplicación**: No envía alertas duplicadas en 24h
4. **Zona horaria**: Schedule está en UTC

## 🎨 Prioridades Visuales

| Prioridad | Color | Icono | Uso |
|-----------|-------|-------|-----|
| CRITICAL | Rojo | ⚠️ | Acción inmediata |
| HIGH | Naranja | ⚠️ | Próximas 24h |
| NORMAL | Azul | ℹ️ | Informativo |
| LOW | Gris | ℹ️ | Archivado |

## ✨ Mejoras Futuras

- [ ] Notificaciones push al celular
- [ ] Email alerts para prioridades críticas
- [ ] Webhook integrations (Slack, Teams)
- [ ] Historial de alertas resueltas
- [ ] Bulk actions (marcar como leído, resolver)
- [ ] Snooze alerts por X días
- [ ] Plantillas de emails personalizadas

## 📚 Documentación Adicional

Ver `docs/CRON_JOB_SETUP.md` para guía detallada de cron job setup, testing y troubleshooting.
