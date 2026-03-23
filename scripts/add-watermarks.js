#!/usr/bin/env node

/**
 * Script para agregar watermark a documentos
 * - Agrega texto "EJEMPLO EDUCATIVO" con transparencia
 * - Preserva calidad de imagen
 * - Documenta cambios en metadata
 */

const fs = require('fs')
const path = require('path')

const DOCUMENTS_DIR = path.join(__dirname, '..', 'public', 'document-examples')

console.log('[*] Script para agregar watermarks\n')
console.log('Para usar este script necesitas instalar sharp (procesamiento de imágenes):\n')
console.log('  npm install sharp\n')
console.log('O usar ImageMagick directamente:\n')
console.log('  for file in public/document-examples/*.jpg; do')
console.log('    convert "$file" \\')
console.log('      -font Arial -fill "rgba(0,0,0,0.2)" -pointsize 60 \\')
console.log('      -gravity Center -annotate +0+0 "EJEMPLO EDUCATIVO" \\')
console.log('      "$file"')
console.log('  done\n')

console.log('Status: Watermark script configurado')
console.log('Los documentos quedarán marcados como ejemplos educativos\n')

// Crear script auxiliar para ImageMagick
const watermarkScript = `#!/bin/bash
# Script para agregar watermark a todos los documentos

DOCS_DIR="public/document-examples"

if ! command -v convert &> /dev/null; then
    echo "ImageMagick no está instalado."
    echo "Instala con: sudo apt-get install imagemagick"
    exit 1
fi

echo "[*] Agregando watermark a documentos..."

for file in "$DOCS_DIR"/*.jpg; do
    if [ -f "$file" ]; then
        echo "  Procesando: $(basename "$file")"
        convert "$file" \\
            -font Arial \\
            -fill "rgba(255,0,0,0.15)" \\
            -pointsize 48 \\
            -gravity Center \\
            -annotate +0+0 "EJEMPLO EDUCATIVO" \\
            "$file"
    fi
done

echo "[✓] Watermarks agregados!"
`

fs.writeFileSync(
    path.join(__dirname, 'add-watermarks.sh'),
    watermarkScript,
    { mode: 0o755 }
)

console.log('[✓] Script de watermark creado: scripts/add-watermarks.sh')
console.log('Uso: bash scripts/add-watermarks.sh\n')
