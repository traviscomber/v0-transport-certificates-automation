# Guía de Desarrollo Local - Portal OCR Walmart Chile

Instrucciones para desarrollar el portal OCR localmente.

## Setup Inicial

### 1. Clonar y Instalar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/v0-transport-certificates-automation.git
cd v0-transport-certificates-automation

# Instalar dependencias
npm install
# o si usas pnpm
pnpm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### 3. Setup Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto nuevo
3. En SQL Editor, ejecuta `scripts/create-document-types-tables.sql`
4. Seedea los documentos: `npm run seed:documents`

### 4. Iniciar Desarrollo

```bash
npm run dev
```

Accede a:
- App: http://localhost:3000
- Portal OCR: http://localhost:3000/walmart-ocr
- Dashboard: http://localhost:3000/walmart-ocr/compliance

## Estructura del Proyecto

### Frontend Pages

```
app/walmart-ocr/
├── page.tsx                  # Upload de documentos
├── compliance/page.tsx       # Dashboard de compliance
├── layout.tsx                # Layout principal
└── index-page.tsx            # Homepage
```

**Modificar**: Agregua nuevas páginas en `/app/walmart-ocr/*`

### Backend APIs

```
app/api/v2/
├── documents/
│   ├── analyze/route.ts      # Procesar con OCR
│   └── list/route.ts         # CRUD documentos
└── compliance/
    ├── status/route.ts       # Estado compliance
    └── report/route.ts       # Generar reportes
```

**Modificar**: Agrega nuevas rutas en `/app/api/v2/*`

### Librerías Compartidas

```
lib/
├── document-types.ts         # Definición de 35 documentos
├── document-detection.ts     # Lógica de auto-detección
└── ...
```

### Componentes

```
components/
├── ui/                       # Componentes shadcn/ui
├── document-upload/          # Componentes de upload
└── compliance/               # Componentes del dashboard
```

## Flujo de Desarrollo

### 1. Agregar un nuevo tipo de documento

En `lib/document-types.ts`:

```typescript
{
  code: "MI-DOCUMENTO",
  name: "Mi Documento",
  category: "empresa",
  description: "Descripción del documento",
  ai_prompt: "Instrucción para GPT-4 Vision",
  required_fields: ["campo1", "campo2"],
  optional_fields: ["campo3"],
  expiration_days: 365,
  sort_order: 36,
}
```

Luego seedea: `npm run seed:documents`

### 2. Modificar un prompt de OCR

En `lib/document-types.ts`, actualiza el campo `ai_prompt`:

```typescript
ai_prompt: `
Instrucciones mejoradas para extraer datos...
Responde SOLO con JSON válido:
{
  "campo1": "valor",
  "campo2": "valor"
}
`
```

### 3. Agregar validación personalizada

En `lib/document-detection.ts`, crea una función de validación:

```typescript
export function validateCustomDocument(data: any): boolean {
  // Tu lógica de validación
  return true
}
```

### 4. Crear nueva página

Crea `/app/walmart-ocr/nueva-pagina/page.tsx`:

```typescript
'use client'

export default function NuevaPagina() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Mi Nueva Página</h1>
    </div>
  )
}
```

### 5. Crear nuevo API

Crea `/app/api/v2/nueva-ruta/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Tu lógica
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
```

## Testing Local

### 1. Test API con curl

```bash
# Upload documento
curl -X POST http://localhost:3000/api/v2/documents/analyze \
  -F "file=@documento.jpg" \
  -F "documentType=CEDULA-IDENTIDAD"

# Listar documentos
curl "http://localhost:3000/api/v2/documents/list?transporterId=demo-user-001"

# Estado compliance
curl "http://localhost:3000/api/v2/compliance/status?transporterId=demo-user-001"

# Generar reporte
curl "http://localhost:3000/api/v2/compliance/report?transporterId=demo-user-001&format=json"
```

### 2. Test en el navegador

1. Ve a http://localhost:3000/walmart-ocr
2. Selecciona tipo de documento
3. Carga una imagen
4. Click "Procesar Documento"
5. Verifica datos extraídos

### 3. Debug en VS Code

Agrega `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

Presiona F5 para debuggear.

## Debugging

### 1. Console logs

Agrega en tus componentes:

```typescript
console.log("[v0] Documento detectado:", document)
console.log("[v0] Datos extraídos:", extractedData)
```

### 2. Network tab

En DevTools (F12):
1. Ve a Pestaña "Network"
2. Carga un documento
3. Revisa las requests/responses
4. Verifica datos enviados y recibidos

### 3. Supabase logs

En https://app.supabase.com:
1. Ve a Project → Logs
2. Revisa queries ejecutadas
3. Identifica errores

### 4. OpenAI logs

En https://platform.openai.com:
1. Ve a Usage
2. Revisa llamadas recientes
3. Valida prompts enviados

## Performance

### 1. Analizar performance

```bash
npm run build
npm run start
# Mide tiempo de carga
```

### 2. Lighthouse score

En DevTools (F12):
1. Ve a Pestaña "Lighthouse"
2. Click "Analyze page load"
3. Revisa scores (Performance, Accessibility, etc)

### 3. Ver tamaño bundles

```bash
# Instala
npm install --save-dev @next/bundle-analyzer

# Crea next.config.js si no existe
# Agrega: withBundleAnalyzer()

npm run build
# Se abre análisis en navegador
```

## Errores Comunes

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
```

### "OPENAI_API_KEY is undefined"

1. Verifica `.env.local` existe
2. Tiene `OPENAI_API_KEY=sk-...`
3. Reinicia servidor: `npm run dev`

### "Document type not found"

1. Verifica que seededeaste: `npm run seed:documents`
2. En Supabase, comprueba: `SELECT * FROM document_types`
3. Verifica el `code` del documento es correcto

### "Database connection failed"

1. Verifica `NEXT_PUBLIC_SUPABASE_URL` es correcto
2. Verifica `SUPABASE_SERVICE_ROLE_KEY` es correcto
3. En Supabase Project → Settings, obtén credenciales nuevas

## Git Workflow

### 1. Crear rama para feature

```bash
git checkout -b feature/mi-feature
```

### 2. Hacer cambios y commit

```bash
git add .
git commit -m "feat: agregar mi feature"
```

### 3. Push y crear PR

```bash
git push origin feature/mi-feature
# Ve a GitHub y abre Pull Request
```

### 4. Merge después de review

```bash
git checkout main
git pull origin main
git merge feature/mi-feature
git push origin main
```

## Recursos Útiles

| Recurso | URL |
|---------|-----|
| Next.js Docs | https://nextjs.org/docs |
| React Docs | https://react.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com |
| Supabase Docs | https://supabase.com/docs |
| OpenAI API | https://platform.openai.com/docs |
| TypeScript | https://www.typescriptlang.org/docs |

## Tips & Tricks

### 1. Recargar datos en el cliente

Usa SWR para caché automático:
```typescript
import useSWR from 'swr'

const { data, mutate } = useSWR(
  `/api/v2/compliance/status?transporterId=${id}`
)

// Recargar cuando necesites
mutate()
```

### 2. Optimizar imágenes

Usa Next.js Image component:
```typescript
import Image from 'next/image'

<Image src="/image.jpg" alt="..." width={300} height={300} />
```

### 3. Pre-cargar datos

En pages RSC (Server Components):
```typescript
async function getData() {
  const res = await fetch('...')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return ...
}
```

## Contacting Support

- Issues en GitHub
- Supabase Support: https://supabase.com/support
- OpenAI Support: https://help.openai.com
