# CHILEAN VALIDATORS - Implementación

Este módulo proporciona validaciones específicas para documentos chilenos.

## Validadores Incluidos

### 1. RUT (Rol Único Tributario)
\`\`\`
Formato: XX.XXX.XXX-K
Donde K = dígito verificador (0-9 o K)
\`\`\`

### 2. Fecha Chilena
\`\`\`
Formato: DD/MM/YYYY o DD-MM-YYYY
Validación: Fecha real, coherente, no futura
\`\`\`

### 3. Patente Vehículo
\`\`\`
Antiguas: LLLNNN (Letra-Letra-Letra-Número-Número-Número)
Nuevas:   NNNLLL (Número-Número-Número-Letra-Letra-Letra)
\`\`\`

### 4. Licencia de Conducir
\`\`\`
Formato: 8 dígitos
Validación: Número válido SII
\`\`\`

### 5. Certificados F-30 / F-30-1
\`\`\`
Formato: Número único SII
Validación: Existe en registros SII
\`\`\`

## Uso

\`\`\`typescript
import {
  validarRUT,
  validarFechaChilena,
  validarPatente,
  validarLicenciaConducir
} from '@/lib/chilean-validators'

// Ejemplo
const esValido = validarRUT('12.345.678-9')
const fechaOK = validarFechaChilena('15/06/1990')
\`\`\`

---

# CHILEAN PUBLIC RECORDS - Implementación

Integración con APIs públicas chilenas para validación cruzada.

## APIs Disponibles

### 1. SII (Servicio de Impuestos Internos)
- Endpoint: https://www.sii.cl/...
- Información: RUT, Razón Social, Estado
- Auth: Token OAuth2

### 2. SRCEI (Registro de Vehículos)
- Información: Placa, Marca, Modelo, Propietario
- Acceso: Limitado a profesionales

### 3. SENDA (Licencias de Conducir)
- Información: Vigencia, Restricciones
- Acceso: Limitado

### 4. FONASA/ISAPRE (Salud)
- Información: Vigencia de afiliación
- Acceso: Limitado

## Consideraciones

⚠️ **IMPORTANTE:** Muchas APIs públicas chilenas tienen acceso restringido o requieren credenciales especiales. Para MVP, usar:
1. Validación local (algoritmos matemáticos)
2. APIs gratuitas disponibles
3. Datos que el usuario proporciona

## Para Fase 2 (Producción)
- Solicitar acceso a APIs SII para validación RUT
- Integración con registros públicos donde disponible
- Fallback: Human review para casos dudosos
