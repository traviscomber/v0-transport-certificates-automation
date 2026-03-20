# Guía de Deployment - Portal OCR Walmart Chile

Instrucciones paso a paso para desplegar el portal OCR en Vercel con Supabase.

## Pre-Deployment Checklist

- [ ] Código funcionando en desarrollo (`npm run dev`)
- [ ] Todas las variables de entorno configuradas
- [ ] Tablas creadas en Supabase
- [ ] Documentos seededeados
- [ ] Repositorio GitHub sincronizado
- [ ] API Keys validadas (OpenAI, Supabase)

## Paso 1: Preparar Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click "New Project"
3. Configura:
   - **Organization**: Tu organización
   - **Project Name**: `walmart-ocr-chile`
   - **Database Password**: Genera contraseña segura
   - **Region**: Elige región cercana (São Paulo para Sudamérica)

4. Espera a que se cree (2-3 minutos)

### 1.2 Obtener credenciales

1. Ve a Project Settings → API
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: El `Service Role Key` es secreto. Nunca lo commits.

### 1.3 Ejecutar migraciones

1. En Supabase, ve a SQL Editor
2. Click "New Query"
3. Copia contenido de `scripts/create-document-types-tables.sql`
4. Click "Run"
5. Espera a que se creen las tablas

### 1.4 Seedear documentos

Ejecuta en tu terminal local:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
npm run seed:documents
```

Verifica en Supabase que se crearon 35 documento types.

## Paso 2: OpenAI API

### 2.1 Crear API Key

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Click Account → API Keys
3. Click "Create new secret key"
4. Nómbralo: `walmart-ocr-chile`
5. Copia el valor → `OPENAI_API_KEY`

⚠️ **IMPORTANTE**: Solo se muestra una vez. Guárdalo seguro.

### 2.2 Configurar créditos

1. Ve a Billing → Overview
2. Agrega método de pago
3. Establece Usage Limits para no gastar de más

## Paso 3: GitHub

### 3.1 Sincronizar repositorio

```bash
# En tu proyecto local
git remote add origin https://github.com/tu-usuario/v0-transport-certificates-automation.git
git branch -M main
git push -u origin main
```

### 3.2 Verificar archivos importantes

```bash
# Verifica que NO estén committeados:
cat .gitignore
# Debe incluir:
# .env.local
# node_modules/
# .next/
```

## Paso 4: Vercel

### 4.1 Conectar Vercel a GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import Git Repository"
4. Busca tu repo y click "Import"

Vercel automáticamente detectará:
- ✓ Framework: Next.js
- ✓ Build Command: `npm run build`
- ✓ Start Command: `npm run start`

### 4.2 Configurar variables de entorno

En Vercel, Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJ...
OPENAI_API_KEY = sk-...
```

✓ Selecciona que aplique a: **Production, Preview, Development**

### 4.3 Deploy

1. Click "Deploy"
2. Espera a que se compile (3-5 minutos)
3. Cuando termine, click "Visit"

Tu app estará en: `https://xxx.vercel.app`

## Paso 5: Post-Deployment

### 5.1 Verificar funcionamiento

En tu app desplegada:

1. Ve a `/walmart-ocr`
2. Carga un documento de prueba
3. Verifica que extrae datos correctamente
4. Ve a `/walmart-ocr/compliance`
5. Verifica que aparecen los documentos

### 5.2 Monitoreo

En Vercel Dashboard:
- Revisa "Deployments" para ver historial
- Revisa "Analytics" para ver traffic
- Revisa "Logs" si hay errores

### 5.3 Agregar dominio personalizado (opcional)

1. En Vercel Project → Domains
2. Click "Add Domain"
3. Ingresa tu dominio (ej: `ocr.walmart.cl`)
4. Sigue instrucciones para DNS

## Troubleshooting en Producción

### Error: "Supabase connection refused"

```bash
# Verifica credenciales
curl -X GET https://xxx.supabase.co/rest/v1/ \
  -H "Authorization: Bearer eyJ..."

# Comprueba en Vercel que vars están correctas
vercel env list
```

### Error: "OpenAI API key invalid"

```bash
# Test la API key localmente
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."

# Verifica que no tiene espacios o caracteres extras
echo $OPENAI_API_KEY | wc -c  # Debe ser ~48 caracteres
```

### App lenta o timeout

1. En Vercel Functions, aumenta timeout:
   ```
   export const config = {
     maxDuration: 60, // 60 segundos para análisis OCR
   };
   ```

2. Revisa Supabase performance:
   - Logs: Infraestructure → Logs
   - Queries lentas

### Documentos no se guardan

1. Verifica RLS policies en Supabase
2. En desarrollo: Desactiva RLS (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`)
3. Revisa logs de Supabase

## Rollback

Si algo sale mal:

```bash
# Vercel guarda todas las deployments
vercel deployments

# Redeploy una versión anterior
vercel rollback

# O especificar deployment anterior
vercel promote <deployment-id>
```

## Monitoreo Continuo

### 1. Configurar alertas

En Vercel Project → Settings → Notifications:
- Email en deploy failures
- Slack integration (opcional)

### 2. Health checks

Crea endpoint de health check:

```bash
curl https://tu-app.vercel.app/api/health
# Response: { "status": "ok" }
```

### 3. Logs

Ver logs en real-time:
```bash
vercel logs <project-name> --follow
```

## Escalabilidad Futura

Cuando crezca el tráfico:

1. **Upgraar Supabase**: De gratis a Pro ($25/mes)
2. **Usar Vercel Pro**: Para mejor performance ($20/mes)
3. **CDN para imágenes**: Vercel Blob o Cloudinary
4. **Caché**: Redis con Upstash
5. **Background jobs**: Temporal o Bull MQ

## Security Checklist Producción

- [ ] Habilitar RLS en Supabase
- [ ] Configurar CORS restrictivo
- [ ] Rate limiting en APIs
- [ ] WAF (Web Application Firewall)
- [ ] HTTPS forzado
- [ ] Secrets rotados regularmente
- [ ] Backups diarios Supabase
- [ ] Monitoring de errores (Sentry)

## URLs Importantes

| Recurso | URL |
|---------|-----|
| Dashboard Supabase | https://app.supabase.com |
| API OpenAI | https://platform.openai.com |
| Dashboard Vercel | https://vercel.com/dashboard |
| Tu app OCR | https://xxx.vercel.app |

## Soporte

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- OpenAI Docs: https://platform.openai.com/docs
- GitHub Issues: Tu repositorio
