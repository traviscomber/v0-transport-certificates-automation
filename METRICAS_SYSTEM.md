# Sistema de Métricas de Ejecutivas

## Visión General

El sistema de métricas fue diseñado para medir el desempeño de las ejecutivas de validación de documentos, proporcionando insights sobre:
- **Productividad**: Documentos procesados por ejecutiva
- **Calidad**: Tasa de aprobación vs recomendación de IA
- **Eficiencia**: Tiempo promedio de validación por documento
- **Confianza**: Promedio de confianza que el sistema IA asignó a sus decisiones

## Flujo de Validación con Captura de Métricas

```
1. Documento llega → Sistema IA escanea y extrae datos
2. IA proporciona recomendación + confianza + datos extraídos
   - ai_recommendation: "aprobado" / "rechazado" / "revisar_manual"
   - ai_confidence: 0-100 (confianza de la IA)
   - ai_extracted_data: { vencimiento, nombres, etc }

3. Ejecutiva ABRE el documento (opened_at registrado)
   - Lee la recomendación de IA
   - Verifica manualmente los datos
   - Toma decisión (aprobado/rechazado)
   
4. Al APROBAR/RECHAZAR:
   - validation_time_seconds: Tiempo desde opened_at hasta validación
   - validated_by: ID de la ejecutiva
   - validated_at: Timestamp
   - discrepancy_type: 
     - "none" = ejecutiva estuvo de acuerdo con IA
     - "más_estricta" = ejecutiva rechazó lo que IA aprobó
     - "más_permisiva" = ejecutiva aprobó lo que IA rechazó
     - "data_correction" = ejecutiva corrigió datos de IA
```

## Métricas Capturadas

### Por Ejecutiva:
- **documents_processed**: Total de documentos validados en el período
- **approval_rate**: % de documentos aprobados vs rechazados
- **avg_validation_time**: Promedio de segundos por validación
- **avg_ai_confidence**: Promedio de confianza de IA en los documentos que ella validó
- **ai_concordance**: % de casos donde su decisión coincidió con la recomendación de IA

### Agregadas:
- **total_documents**: Total en período
- **avg_approval_rate**: Promedio de todas las ejecutivas
- **avg_validation_time**: Promedio de todas las ejecutivas
- **documents_increase**: Comparación con período anterior

## Interpretación de Métricas

### Tasa de Aprobación Alta (>80%)
- ✓ Positivo: Ejecutiva es confiable, documentos son válidos
- ⚠ Negativo: Podría estar siendo muy permisiva

### Tasa de Aprobación Baja (<30%)
- ✓ Positivo: Ejecutiva es estricta, filtra riesgos
- ⚠ Negativo: Podría estar siendo muy restrictiva, frustrando usuarios

### Tiempo de Validación Alto (>120s)
- ✓ Positivo: Validación cuidadosa, menos errores
- ⚠ Negativo: Bottleneck en productividad

### Tiempo de Validación Bajo (<20s)
- ✓ Positivo: Rápida, eficiente
- ⚠ Negativo: Podría estar siendo superficial

### Alta Concordancia con IA (>85%)
- ✓ Significa que la IA está bien entrenada para este tipo de validación
- ⚠ Podría indicar que la ejecutiva no está revisando más allá de la recomendación

### Baja Concordancia con IA (<50%)
- ✓ Positivo: Ejecutiva tiene criterio independiente, encuentra errores de IA
- ⚠ Negativo: O IA necesita reentrenamiento, o ejecutiva es inconsistente

## Dashboard de Métricas

**URL**: `/dashboard/company/metrics`

### Componentes:

1. **KPI Cards** (4 tarjetas principales)
   - Documentos Validados (total período)
   - Tasa de Aprobación Promedio
   - Tiempo Promedio por Validación
   - Ejecutivas Activas

2. **Selector de Rango de Tiempo**
   - Hoy (últimas 24h)
   - Esta Semana (últimos 7 días)
   - Este Mes (últimos 30 días)

3. **Tabla de Desempeño**
   - Ejecutiva (nombre/ID)
   - Documentos Procesados
   - Tasa de Aprobación
   - Tiempo Promedio
   - Confianza IA Promedio
   - Botón "Ver detalle" (expandible)

4. **Vista Detallada de Ejecutiva** (modal)
   - Gráficas de tendencia
   - Discrepancias (casos donde no estuvo de acuerdo con IA)
   - Documentos rechazados recientes
   - Datos extraídos vs observación real

## API Endpoints

### GET `/api/company/metrics?range=week`
Parámetros:
- `range`: "day" | "week" | "month"

Respuesta:
```json
{
  "executives": [
    {
      "executive_id": "uuid",
      "executive_name": "nombre",
      "documents_processed": 145,
      "approval_rate": 78,
      "avg_validation_time": 65,
      "avg_ai_confidence": 82
    }
  ],
  "summary": {
    "total_documents": 1250,
    "avg_approval_rate": 75,
    "avg_validation_time": 68
  }
}
```

## Beneficios

✓ **Ejecutivas**: Ven su desempeño, motivación, auto-mejora
✓ **Managers**: Visibilidad de productividad, identificar entrenamientos necesarios
✓ **Negocio**: Mide SLA, tasa de conversión, calidad de validaciones
✓ **IA**: Recibe feedback para reentrenamiento (discrepancias = oportunidades de mejora)

## Próximos Pasos

1. Capturar `discrepancy_type` al validar (comparar decisión ejecutiva vs IA)
2. Agregar gráficos de tendencia en vista detallada
3. Crear alertas si ejecutiva está fuera de parámetros normales
4. Integrar con IA para reentrenamiento automático de modelos
5. Exportar reportes para reuniones de desempeño
