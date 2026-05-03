## Configuración de Cron Job - Sistema de Alertas de Vencimiento

### ✅ ¿Qué está configurado?

El cron job está configurado en `vercel.json` para ejecutarse automáticamente:
- **Hora**: 6 AM UTC (ajustable)
- **Frecuencia**: Diariamente
- **Endpoint**: `/api/company/alerts/check-expiring-documents`
- **Qué hace**: Genera alertas para documentos próximos a vencer

### 📅 Configuración del Cron en vercel.json

```json
{
  "crons": [
    {
      "path": "/api/company/alerts/check-expiring-documents",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Formato de Schedule**: `minute hour day_of_month month day_of_week`
- `0 6 * * *` = 6 AM UTC todos los días
- `0 2 * * *` = 2 AM UTC todos los días
- `0 */6 * * *` = Cada 6 horas

### 🧪 Cómo Testear Manualmente

#### Opción 1: GET en desarrollo
```bash
curl http://localhost:3000/api/company/alerts/check-expiring-documents
```

#### Opción 2: POST con API key
```bash
curl -X POST http://localhost:3000/api/company/alerts/check-expiring-documents \
  -H "Authorization: Bearer YOUR_INTERNAL_API_KEY"
```

#### Opción 3: Desde la UI (en el admin panel)
Crear un botón "Test Expiration Alerts" que llame:
```javascript
fetch('/api/company/alerts/check-expiring-documents', {
  method: 'GET'
})
```

### 🔧 Variables de Entorno Necesarias

El endpoint puede usar `INTERNAL_API_KEY` si existe. Configúralo en Vercel Project Settings:

```
INTERNAL_API_KEY=tu-clave-secreta-aqui
```

### 📊 Alertas Generadas

El cron job genera alertas con estas prioridades automáticas:

| Situación | Prioridad | Acción |
|-----------|-----------|--------|
| Documento vencido hoy | CRITICAL (Rojo) | Acción inmediata |
| Vence en 1 día | CRITICAL (Rojo) | Acción inmediata |
| Vence en 7 días | HIGH (Naranja) | Planificar próximas 24h |
| Vence en 30 días | NORMAL (Azul) | Planificar renovación |

### 🔍 Dónde ver los Logs

En Vercel Deployment:
1. Ve a tu proyecto en vercel.com
2. Click en "Deployments"
3. Selecciona el deployment actual
4. Ve a "Functions" tab
5. Busca `/api/company/alerts/check-expiring-documents`
6. Verás los logs de cada ejecución del cron

### ⚙️ Cómo Cambiar el Horario

Edita `vercel.json` y cambia el `schedule`:

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

Luego despliega el cambio:
```bash
git add vercel.json
git commit -m "Update cron schedule to 9 AM UTC"
git push
```

### 🚀 Deploy a Producción

El cron se activa automáticamente cuando despliegas `vercel.json`:

```bash
git add .
git commit -m "Add expiration alerts cron job"
git push origin main
```

Vercel detectará `vercel.json` y activará el cron automáticamente.

### 📝 Notas Importantes

1. **Primer run**: El cron se ejecuta por primera vez 1 hora después del deploy
2. **Duración máxima**: El cron tiene un timeout de 30 segundos (suficiente para alertas)
3. **Deduplicación**: Las alertas se deduplicant usando `last_expiration_alert_sent` para no enviar duplicadas el mismo día
4. **Zona horaria**: El schedule está en UTC. Ajusta según tu zona:
   - UTC: `0 6 * * *`
   - EST: `0 11 * * *` (UTC + 5)
   - CST: `0 12 * * *` (UTC + 6)
   - PST: `0 14 * * *` (UTC + 8)

### ✅ Checklist de Implementación

- [x] ✓ Archivo `vercel.json` con configuración de cron
- [x] ✓ Endpoint `/api/company/alerts/check-expiring-documents` actualizado
- [x] ✓ GET para testing manual
- [x] ✓ POST para API calls con autenticación
- [x] ✓ Función `generateExpirationAlerts()` integrada
- [ ] TODO: Agregar endpoint en Admin Dashboard para "Test Now"
- [ ] TODO: Configurar INTERNAL_API_KEY en Variables de Entorno
- [ ] TODO: Deploy a producción para activar el cron

### 🐛 Troubleshooting

**El cron no se ejecuta:**
- Verifica que `vercel.json` esté en la raíz del proyecto
- Redeploy después de cambiar `vercel.json`
- Espera 1 hora después del deploy

**No se generan alertas:**
- Verifica logs en Vercel Deployment
- Ejecuta manualmente GET para testear
- Verifica que haya documentos con expiration_date en la BD

**Errores de timeout:**
- El cron tiene 30 segundos máximo
- Si hay muchos documentos, puede necesitar optimización
- Considera dividir en múltiples crons si es necesario
