/**
 * Cross-Verification Display Component
 * Shows verification results with discrepancies highlighted
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import type { CrossVerificationResult } from '@/lib/cross-verification'
import Link from 'next/link'

interface CrossVerificationDisplayProps {
  results: CrossVerificationResult[]
  onReview?: (result: CrossVerificationResult) => void
}

export function CrossVerificationDisplay({ results, onReview }: CrossVerificationDisplayProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificación Cruzada</CardTitle>
          <CardDescription>No hay verificaciones pendientes</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const critical = results.filter(r => r.riskLevel === 'critical')
  const warnings = results.filter(r => r.riskLevel === 'warning')
  const passed = results.filter(r => r.riskLevel === 'ok')

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={critical.length > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crítica</p>
                <p className={`text-2xl font-bold ${critical.length > 0 ? 'text-red-600' : ''}`}>
                  {critical.length}
                </p>
              </div>
              {critical.length > 0 && <AlertTriangle className="h-8 w-8 text-red-600" />}
            </div>
          </CardContent>
        </Card>

        <Card className={warnings.length > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Advertencia</p>
                <p className={`text-2xl font-bold ${warnings.length > 0 ? 'text-yellow-600' : ''}`}>
                  {warnings.length}
                </p>
              </div>
              {warnings.length > 0 && <AlertCircle className="h-8 w-8 text-yellow-600" />}
            </div>
          </CardContent>
        </Card>

        <Card className={passed.length > 0 ? 'border-green-200 bg-green-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verificado</p>
                <p className={`text-2xl font-bold ${passed.length > 0 ? 'text-green-600' : ''}`}>
                  {passed.length}
                </p>
              </div>
              {passed.length > 0 && <CheckCircle2 className="h-8 w-8 text-green-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Results */}
      {critical.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Problemas Críticos</CardTitle>
            <CardDescription>Requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {critical.map(result => (
              <VerificationResultCard key={result.id} result={result} onReview={onReview} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-600">Advertencias</CardTitle>
            <CardDescription>Revisar posibles inconsistencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warnings.map(result => (
              <VerificationResultCard key={result.id} result={result} onReview={onReview} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Passed */}
      {passed.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-600">Verificados</CardTitle>
            <CardDescription>Datos consistentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passed.map(result => (
              <VerificationResultCard key={result.id} result={result} onReview={onReview} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface VerificationResultCardProps {
  result: CrossVerificationResult
  onReview?: (result: CrossVerificationResult) => void
}

function VerificationResultCard({ result, onReview }: VerificationResultCardProps) {
  const getBgColor = () => {
    if (result.riskLevel === 'critical') return 'bg-red-50 border-red-200'
    if (result.riskLevel === 'warning') return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const getIconColor = () => {
    if (result.riskLevel === 'critical') return 'text-red-600'
    if (result.riskLevel === 'warning') return 'text-yellow-600'
    return 'text-green-600'
  }

  const getIcon = () => {
    if (result.riskLevel === 'critical') return <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
    if (result.riskLevel === 'warning') return <AlertCircle className={`h-5 w-5 ${getIconColor()}`} />
    return <CheckCircle2 className={`h-5 w-5 ${getIconColor()}`} />
  }

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div>
            <p className="font-medium">{result.name}</p>
            <p className="text-sm text-muted-foreground">{result.type}</p>
          </div>
        </div>
        <Badge
          variant={result.riskLevel === 'ok' ? 'default' : 'destructive'}
          className={result.riskLevel === 'warning' ? 'bg-yellow-600' : ''}
        >
          {result.riskLevel === 'critical' ? 'Crítico' : result.riskLevel === 'warning' ? 'Advertencia' : 'OK'}
        </Badge>
      </div>

      {/* Discrepancies */}
      {result.discrepancies.length > 0 && (
        <div className="mb-4 space-y-2 bg-white rounded-lg p-3">
          {result.discrepancies.map((disc, idx) => (
            <div key={idx} className="border-l-2 border-gray-300 pl-3">
              <p className="text-sm font-medium">{disc.field}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                <div>
                  <p className="text-muted-foreground">Base de datos:</p>
                  <p className="font-mono text-foreground">{disc.databaseValue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documento:</p>
                  <p className="font-mono text-foreground">{disc.documentValue}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{disc.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium">Recomendaciones:</p>
          <ul className="text-sm space-y-1">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReview?.(result)}
        >
          Revisar <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
