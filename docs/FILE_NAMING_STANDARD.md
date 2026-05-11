# Nomenclatura Estándar de Archivos - Sistema de Documentos Labbe

## Formato Establecido

```
{TIPO_DOCUMENTO}_{RUT}_{YYYYMMDD}_{HASH}.{extension}
```

**Componentes:**
- **TIPO_DOCUMENTO**: Código del tipo de documento en mayúsculas (ej: CEDULA_IDENTIDAD, LIC_CONDUCIR)
- **RUT**: RUT del conductor (8 dígitos sin check digit)
- **YYYYMMDD**: Fecha de carga (año-mes-día)
- **HASH**: Identificador único MD5 de 8 caracteres (evita colisiones)
- **extension**: Extensión del archivo original en minúsculas (jpg, pdf, png)

## Ejemplos Reales

```
CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg
LIC_CONDUCIR_87654321_20260510_5678ef90.pdf
HOJA_VIDA_11223344_20260509_b4c5d6e7.png
CERT_ANTECEDENTES_55667788_20260508_c7d8e9f0.pdf
```

## Estructura de Carpetas

### Para Conductores
```
conductor-documents/
  └── {conductorId}/
      ├── CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg
      ├── LIC_CONDUCIR_12345678_20260510_5678ef90.pdf
      └── CERT_ANTECEDENTES_12345678_20260509_b4c5d6e7.pdf
```

### Para Empresa
```
company-documents/
  └── {companyId}/
      ├── CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg
      └── CONTRATO_TRABAJO_87654321_20260510_5678ef90.pdf
```

## Ventajas de este Estándar

1. **Legibilidad**: El nombre del archivo es auto-descriptivo
2. **Organización**: Fácil de buscar y clasificar por tipo de documento y fecha
3. **Unicidad**: El hash MD5 previene colisiones incluso si se suben múltiples archivos el mismo día
4. **Auditoría**: La fecha permite rastrear cuándo se subió cada documento
5. **Compatibilidad**: Funciona con sistemas de almacenamiento tradicionales y en la nube
6. **Sin caracteres especiales**: Solo usa caracteres válidos en URLs y sistemas de archivos

## Códigos de Tipo de Documento

```
CEDULA_IDENTIDAD         → Cédula de Identidad
LIC_CONDUCIR             → Licencia de Conducir
HOJA_VIDA                → Hoja de Vida
CERT_ANTECEDENTES        → Certificado de Antecedentes
INHABILIDADES_MENORES    → Inhabilidades Menores
CONTRATO_TRABAJO         → Contrato de Trabajo
CERT_AFP                 → Certificado AFP
REVISION_TECNICA         → Revisión Técnica
SOAP                     → SOAP
```

## Implementación en el Código

Usar las funciones del módulo `/lib/utils/file-naming.ts`:

```typescript
import { generateConductorFilePath, generateCompanyFilePath } from '@/lib/utils/file-naming'

// Para documentos de conductor
const filePath = generateConductorFilePath(
  conductorId,
  'CEDULA_IDENTIDAD',
  '12345678',
  'mi-cedula.jpg'
)
// Resultado: conductor-documents/{conductorId}/CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg

// Para documentos de empresa
const filePath = generateCompanyFilePath(
  companyId,
  'CONTRATO_TRABAJO',
  '87654321',
  'contrato.pdf'
)
// Resultado: company-documents/{companyId}/CONTRATO_TRABAJO_87654321_20260511_5678ef90.pdf
```

## Extracción de Metadata

Si necesitas extraer información del nombre del archivo:

```typescript
import { extractFileMetadata } from '@/lib/utils/file-naming'

const metadata = extractFileMetadata('CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg')
// Resultado:
// {
//   documentTypeCode: 'CEDULA_IDENTIDAD',
//   rut: '12345678',
//   date: Date(2026-05-11),
//   hash: 'a1b2c3d4',
//   extension: 'jpg'
// }
```

## Endpoints Actualizados

1. **POST /api/conductor/upload-document**
   - Utiliza `generateConductorFilePath()` para normalizar nombres
   - Estructura: `conductor-documents/{conductorId}/{NORMALIZED_NAME}`

2. **POST /api/company/documents/upload-with-metadata**
   - Utiliza `generateCompanyFilePath()` para normalizar nombres
   - Estructura: `company-documents/{conductorId}/{NORMALIZED_NAME}`

## Consideraciones

- Los nombres se normalizan automáticamente en el servidor
- Se preserva la extensión original del archivo
- Los espacios se reemplazan con guiones bajos en códigos de tipo
- Los RUTs se limpian para usar solo 8 dígitos numéricos
- El hash MD5 se genera a partir del timestamp para garantizar unicidad
