# LABBE — Gestión documental de transporte

LABBE es el sistema productivo para administrar transportistas, conductores, subcontratistas, tipos documentales, revisiones, alertas y cumplimiento.

## Fuente canónica

La definición vigente del dominio, reglas de datos, carga masiva, versionado documental, autenticación, RLS y estadísticas está en:

[`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md)

Ese documento debe leerse antes de modificar el esquema, las APIs, los dashboards o los procesos de carga.

## Reglas fundamentales

- Varias filas para la misma entidad, tipo documental y período pueden ser historial válido; no son duplicados automáticamente.
- Las cargas masivas existentes forman parte de la data productiva canónica.
- Una deduplicación futura requiere evidencia de contenido idéntico, preferentemente hash del archivo, y debe preservar trazabilidad.
- Los conteos deben usar consultas exactas y no depender del límite de 1.000 filas de Supabase.
- Las certificaciones actuales se calculan desde los flags `ariztia`, `lts`, `rendic` e `interpolar` de `transportistas`.
- RLS está habilitado y los datos sensibles deben consultarse desde APIs autenticadas usando clientes de servidor.
- No se deben inventar fechas de vencimiento ni estados que no tengan una fuente canónica.

## Arquitectura

| Capa | Tecnología |
|---|---|
| Aplicación | Next.js App Router + React + TypeScript |
| Backend | Next.js API Routes y lógica server-side |
| Base de datos | Supabase PostgreSQL |
| Seguridad | Autenticación de aplicación, RLS y `service_role` exclusivo del servidor |
| Almacenamiento documental | URLs persistidas en las tablas documentales |
| Deployment | Vercel |

## Entidades principales

- `transportistas`
- `transportista_auth`
- `conductores`
- `conductor_auth`
- `uploaded_documents`
- `subcontractor_documents`
- `document_types`
- `subcontractor_document_types`
- `alerts`
- `alerts_log`

## Desarrollo

```bash
npm install
npm run dev
```

Variables mínimas del servidor:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al navegador, incluirse en logs ni publicarse en el repositorio.

## Validación obligatoria antes de publicar

```bash
npm run build
```

Además del build, todo cambio relevante debe verificarse contra:

1. esquema y datos reales de Supabase;
2. políticas RLS y acceso por rol;
3. deployment productivo de Vercel;
4. logs de runtime;
5. flujo operacional afectado.

## Mantenimiento del modelo canónico

Cuando una mejora cambie una regla operacional o de datos, el mismo commit o migración debe actualizar `docs/LABBE_CANONICAL_SYSTEM.md`. Código, base de datos y documentación deben permanecer sincronizados.
