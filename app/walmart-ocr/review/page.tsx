'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Copy, Check } from 'lucide-react'

export default function ReviewPage() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  review_reason VARCHAR(100) NOT NULL,
  confidence_score FLOAT,
  flags JSONB DEFAULT '[]'::jsonb,
  assigned_to UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sla_deadline TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES review_queue(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  decision VARCHAR(30) NOT NULL,
  original_data JSONB,
  corrected_data JSONB,
  corrections_made JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  rejection_reason VARCHAR(100),
  review_duration_seconds INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority VARCHAR(20) NOT NULL UNIQUE,
  max_hours INT NOT NULL,
  escalation_hours INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO review_sla_config (priority, max_hours, escalation_hours) VALUES
  ('critical', 1, 2),
  ('high', 4, 8),
  ('medium', 24, 48),
  ('low', 72, 168)
ON CONFLICT (priority) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON review_queue(priority);
CREATE INDEX IF NOT EXISTS idx_review_queue_assigned ON review_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_review_decisions_queue ON review_decisions(queue_id);`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#18181B]">Portal de Revisión</h1>
        <p className="text-[#71717A]">Sistema de revisión manual de documentos OCR</p>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="ml-3">
          <p className="font-semibold text-yellow-900 mb-1">Configuración requerida</p>
          <p className="text-sm text-yellow-800">
            Necesitas ejecutar un script SQL en Supabase para crear las tablas de revisión.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Pasos de Configuración</CardTitle>
          <CardDescription>Sigue estos pasos para activar el sistema de revisión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">1</span>
              <span>Abre tu proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">2</span>
              <span>Ve a <strong>SQL Editor</strong> → <strong>Nueva Query</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">3</span>
              <span>Copia el script SQL de abajo y pégalo en el editor</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">4</span>
              <span>Haz clic en <strong>Run</strong> o presiona <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Ctrl+Enter</kbd></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-xs">5</span>
              <span>Recarga esta página para verificar que está listo</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Script SQL</CardTitle>
              <CardDescription>Copia y ejecuta en Supabase SQL Editor</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
            {sqlScript}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Después de Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">Una vez que hayas ejecutado el script, podrás:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#71717A]">
            <li>Ver documentos pendientes de revisión</li>
            <li>Asignar revisiones a tu equipo</li>
            <li>Registrar decisiones y correcciones</li>
            <li>Rastrear SLA y métricas</li>
            <li>Generar reportes de compliance</li>
          </ul>
          <Button className="w-full mt-4" onClick={() => window.location.reload()}>
            Verificar Configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
