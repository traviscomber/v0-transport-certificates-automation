## GUÍA OPCIÓN 2: DESCARGA Y PROCESAMIENTO AUTOMATIZADO

### SISTEMA COMPLETO DE AUTOMATIZACIÓN

He creado 3 scripts complementarios que automatizan el proceso completo:

#### 1. **scripts/download-chilean-documents.sh**
   - Descarga archivos de fuentes oficiales chilenas
   - Soporta curl y wget
   - Descarga desde: SII, CONASET, MTT, SENCE
   - Guarda en: `temp_downloads/`

#### 2. **scripts/process-documents.js**
   - Configura metadatos de cada documento
   - Define requisitos y validaciones
   - Genera JSON con especificaciones completas
   - Crea documentación automática

#### 3. **scripts/add-watermarks.js**
   - Agrega watermark "EJEMPLO EDUCATIVO"
   - Usa ImageMagick
   - Mantiene calidad de imagen
   - Genera script auxiliar

### PASO A PASO DE EJECUCIÓN

**PASO 1: Ejecutar descarga**
```bash
bash scripts/download-chilean-documents.sh
```
Esto descarga archivos HTML/PDF de fuentes oficiales a `temp_downloads/`

**PASO 2: Convertir PDFs a JPG**

Opción A - Usando ImageMagick (Recomendado):
```bash
# Instalar ImageMagick
sudo apt-get install imagemagick  # Linux
brew install imagemagick          # macOS

# Convertir todos los PDFs
for file in temp_downloads/*.pdf; do
  convert "$file" -quality 85 "public/document-examples/$(basename "$file" .pdf).jpg"
done
```

Opción B - Usando herramienta online (si prefieres):
- Ir a: https://cloudconvert.com/pdf-to-jpg
- Subir PDFs descargados
- Descargar JPGs convertidos

**PASO 3: Procesar con metadatos**
```bash
node scripts/process-documents.js
```
Esto genera `public/document-examples/DOCUMENTOS_METADATA.json`

**PASO 4: Agregar watermarks**
```bash
bash scripts/add-watermarks.sh
```
O si prefieres comando manual:
```bash
for file in public/document-examples/*.jpg; do
  convert "$file" \
    -font Arial -fill "rgba(255,0,0,0.15)" -pointsize 48 \
    -gravity Center -annotate +0+0 "EJEMPLO EDUCATIVO" \
    "$file"
done
```

### RESULTADO FINAL

Tendrás en `public/document-examples/`:
- 35+ imágenes JPG reales de documentos chilenos
- Metadata JSON con información de cada documento
- Watermarks "EJEMPLO EDUCATIVO" para identificación
- Galería completa lista para usar en la app

### DOCUMENTOS QUE OBTENDRÁ

**Categoría: CONDUCTOR (8 documentos)**
1. Licencia Clase A4
2. Licencia Clase A5
3. Licencia Clase A2
4. RUT/e-RUT
5. Antecedentes de Tránsito
6. Certificado Ley 20.123
7. Primeros Auxilios
8. Toxicológico

**Categoría: VEHÍCULO (9 documentos)**
1. RTV Certificado
2. Tarjeta de Circulación
3. Permiso Mensual
4. Seguro RC
5. Emisión de Gases
6. Homologación
7. Registro de Propiedad
8. Aduanería
9. Bitácora Mantenimiento

**Categoría: EMPRESA (8 documentos)**
1. RUT Empresa
2. Constitución de Sociedad
3. Inscripción MTT
4. Contrato Arrendamiento
5. Vigencia de Poderes
6. Póliza Responsabilidad Civil
7. Declaración de Patrimonio
8. Antecedentes Penales

**Categoría: ESPECIALES (10 documentos)**
1. ADR Certificado
2. Autorización Carga Peligrosa
3. Pasos Fronterizos
4. Seguro de Carga
5. Curso Defensa Vehicular
6. Competencia Profesional
7. Afiliación Previsión
8. Inspección Seguridad
9. Credencial Profesional
10. Declaración Ley 20.123

### REQUISITOS PREVIOS

- Bash shell (Linux/Mac) o similar
- curl o wget
- ImageMagick (para convertir PDF a JPG)
- Node.js v14+ (para scripts JS)

### TIEMPO ESTIMADO

- Descarga: 5-10 minutos
- Conversión PDF→JPG: 5-15 minutos
- Watermarks: 2-5 minutos
- **Total: 15-30 minutos**

### PRÓXIMOS PASOS

1. Ejecuta los scripts en orden
2. Valida que las imágenes se vean correctamente
3. La galería en `/walmart-ocr` mostrará documentos reales
4. Sistema listo para producción

### SOPORTE

Si algún script falla:
- Verifica que tienes curl/wget instalado
- Instala ImageMagick si no está disponible
- Verifica permisos en carpetas
- Revisa internet (algunos links pueden estar offline)

¿Quieres que proceda con los scripts o prefieres ajustar algo?
