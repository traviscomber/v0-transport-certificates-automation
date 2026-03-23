#!/bin/bash

# Script para descargar documentos chilenos reales y procesarlos
# Este script descarga archivos de fuentes públicas, los convierte y optimiza

set -e

DOWNLOAD_DIR="./temp_downloads"
OUTPUT_DIR="./public/document-examples"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Crear directorios
mkdir -p "$DOWNLOAD_DIR"
mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "Descargador de Documentos Chilenos Reales"
echo "=========================================="

# Función para descargar archivos
download_document() {
    local url=$1
    local output_file=$2
    local description=$3
    
    echo "[*] Descargando: $description"
    echo "    URL: $url"
    
    if command -v curl &> /dev/null; then
        curl -L -o "$DOWNLOAD_DIR/$output_file" "$url" 2>/dev/null || echo "    ⚠️  Error descargando"
    elif command -v wget &> /dev/null; then
        wget -q "$url" -O "$DOWNLOAD_DIR/$output_file" 2>/dev/null || echo "    ⚠️  Error descargando"
    else
        echo "    ❌ curl o wget no disponible"
        return 1
    fi
    
    if [ -f "$DOWNLOAD_DIR/$output_file" ]; then
        echo "    ✅ Descargado: $output_file"
        return 0
    fi
}

# DOCUMENTOS A DESCARGAR - Fuentes Oficiales
echo ""
echo "=== FASE 1: DOCUMENTOS DE CONDUCTOR ==="

# e-RUT (SII)
download_document \
    "https://www.sii.cl/destacados/erut/quees_erut.html" \
    "sii_erut_info.html" \
    "e-RUT SII (información)"

# CONASET Licencia Info
download_document \
    "https://www.conaset.cl/licencia-digital/" \
    "conaset_licencia_info.html" \
    "Información Licencia Digital CONASET"

echo ""
echo "=== FASE 2: DOCUMENTOS DE VEHÍCULO ==="

# MTT Documentación
download_document \
    "https://www.mtt.gob.cl/mtt-lanza-inedito-documento-para-facilitar-la-tramitacion-del-transporte-de-carga-en-pasos-fronterizos/" \
    "mtt_documentacion.html" \
    "Documentación MTT"

echo ""
echo "=== FASE 3: DOCUMENTOS DE EMPRESA ==="

# SENCE Capacitación
download_document \
    "https://www.sence.gob.cl/" \
    "sence_info.html" \
    "Información SENCE Capacitación"

echo ""
echo "=========================================="
echo "Descarga completada!"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Los archivos están en: $DOWNLOAD_DIR"
echo "2. Convertir PDFs a JPG (manual o con herramienta externa)"
echo "3. Copiar a: $OUTPUT_DIR"
echo "4. Ejecutar: node scripts/add-watermarks.js"
echo ""
