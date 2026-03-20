-- ============================================================
-- FASE 2: HUMAN-IN-THE-LOOP - REVIEW QUEUE TABLES
-- Portal OCR Walmart Chile
-- ============================================================

-- Tabla de cola de revisión manual
CREATE TABLE IF NOT EXISTS review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES uploaded_documents(id) ON DELETE CASCADE,
  
  -- Prioridad y estado
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, in_review, completed, escalated
  
  -- Razón de revisión
  review_reason VARCHAR(100) NOT NULL, -- low_confidence, validation_failed, manual_request, random_audit
  confidence_score FLOAT,
  flags JSONB DEFAULT '[]'::jsonb,
  
  -- Asignación
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Tiempos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- SLA tracking
  sla_deadline TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN DEFAULT false
);

-- Tabla de decisiones de revisión
CREATE TABLE IF NOT EXISTS review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES review_queue(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Decisión
  decision VARCHAR(30) NOT NULL, -- approved, rejected, needs_correction, escalated
  
  -- Datos corregidos (si aplica)
  original_data JSONB,
  corrected_data JSONB,
  corrections_made JSONB DEFAULT '[]'::jsonb, -- lista de campos corregidos
  
  -- Notas y razón
  notes TEXT,
  rejection_reason VARCHAR(100),
  
  -- Métricas
  review_duration_seconds INT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de feedback para mejorar OCR
CREATE TABLE IF NOT EXISTS ocr_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_code VARCHAR(50) NOT NULL,
  
  -- Datos originales vs corregidos
  field_name VARCHAR(100) NOT NULL,
  original_value TEXT,
  corrected_value TEXT,
  
  -- Contexto
  ocr_confidence FLOAT,
  error_type VARCHAR(50), -- misread, missing, extra_text, format_error
  
  -- Para entrenamiento
  image_region JSONB, -- coordenadas del campo en la imagen
  used_for_training BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas de revisores
CREATE TABLE IF NOT EXISTS reviewer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métricas de volumen
  total_reviews INT DEFAULT 0,
  approved_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  corrected_count INT DEFAULT 0,
  escalated_count INT DEFAULT 0,
  
  -- Métricas de calidad
  accuracy_rate FLOAT,
  avg_review_time_seconds INT,
  sla_compliance_rate FLOAT,
  
  -- Feedback recibido
  reviews_audited INT DEFAULT 0,
  audit_pass_rate FLOAT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(reviewer_id, period_start, period_end)
);

-- Tabla de configuración SLA
CREATE TABLE IF NOT EXISTS review_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority VARCHAR(20) NOT NULL UNIQUE,
  max_hours INT NOT NULL,
  escalation_hours INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración SLA por defecto
INSERT INTO review_sla_config (priority, max_hours, escalation_hours) VALUES
  ('critical', 1, 2),
  ('high', 4, 8),
  ('medium', 24, 48),
  ('low', 72, 168)
ON CONFLICT (priority) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON review_queue(priority);
CREATE INDEX IF NOT EXISTS idx_review_queue_assigned ON review_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_review_queue_document ON review_queue(document_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_sla ON review_queue(sla_deadline) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_review_decisions_queue ON review_decisions(queue_id);
CREATE INDEX IF NOT EXISTS idx_review_decisions_reviewer ON review_decisions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ocr_feedback_type ON ocr_feedback(document_type_code);
CREATE INDEX IF NOT EXISTS idx_ocr_feedback_training ON ocr_feedback(used_for_training) WHERE used_for_training = false;

-- Vista de cola pendiente con prioridad
CREATE OR REPLACE VIEW pending_reviews AS
SELECT 
  rq.id,
  rq.document_id,
  rq.priority,
  rq.status,
  rq.review_reason,
  rq.confidence_score,
  rq.flags,
  rq.assigned_to,
  rq.sla_deadline,
  rq.sla_breached,
  rq.created_at,
  ud.document_type_id,
  dt.code as document_type_code,
  dt.name as document_type_name,
  dt.category as document_category,
  ud.extracted_data,
  ud.original_filename,
  ud.file_url,
  CASE 
    WHEN rq.sla_deadline < NOW() THEN 'breached'
    WHEN rq.sla_deadline < NOW() + INTERVAL '1 hour' THEN 'urgent'
    WHEN rq.sla_deadline < NOW() + INTERVAL '4 hours' THEN 'warning'
    ELSE 'ok'
  END as sla_status,
  EXTRACT(EPOCH FROM (rq.sla_deadline - NOW())) / 3600 as hours_remaining
FROM review_queue rq
LEFT JOIN uploaded_documents ud ON rq.document_id = ud.id
LEFT JOIN document_types dt ON ud.document_type_id = dt.id
WHERE rq.status IN ('pending', 'in_review')
ORDER BY 
  CASE rq.priority 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    WHEN 'low' THEN 4 
  END,
  rq.sla_deadline ASC;

-- Vista de métricas de revisión por día
CREATE OR REPLACE VIEW daily_review_metrics AS
SELECT 
  DATE(rd.created_at) as review_date,
  COUNT(*) as total_reviews,
  SUM(CASE WHEN rd.decision = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN rd.decision = 'rejected' THEN 1 ELSE 0 END) as rejected,
  SUM(CASE WHEN rd.decision = 'needs_correction' THEN 1 ELSE 0 END) as corrected,
  SUM(CASE WHEN rd.decision = 'escalated' THEN 1 ELSE 0 END) as escalated,
  AVG(rd.review_duration_seconds) as avg_duration_seconds,
  COUNT(DISTINCT rd.reviewer_id) as active_reviewers
FROM review_decisions rd
GROUP BY DATE(rd.created_at)
ORDER BY review_date DESC;

-- Función para agregar documento a cola de revisión
CREATE OR REPLACE FUNCTION add_to_review_queue(
  p_document_id UUID,
  p_review_reason VARCHAR(100),
  p_confidence_score FLOAT DEFAULT NULL,
  p_flags JSONB DEFAULT '[]'::jsonb,
  p_priority VARCHAR(20) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_priority VARCHAR(20);
  v_sla_hours INT;
  v_queue_id UUID;
BEGIN
  -- Determinar prioridad basada en confianza si no se especifica
  IF p_priority IS NULL THEN
    IF p_confidence_score IS NULL OR p_confidence_score < 0.5 THEN
      v_priority := 'high';
    ELSIF p_confidence_score < 0.7 THEN
      v_priority := 'medium';
    ELSE
      v_priority := 'low';
    END IF;
  ELSE
    v_priority := p_priority;
  END IF;
  
  -- Obtener SLA para esta prioridad
  SELECT max_hours INTO v_sla_hours FROM review_sla_config WHERE priority = v_priority;
  
  -- Insertar en cola
  INSERT INTO review_queue (
    document_id,
    priority,
    review_reason,
    confidence_score,
    flags,
    sla_deadline
  ) VALUES (
    p_document_id,
    v_priority,
    p_review_reason,
    p_confidence_score,
    p_flags,
    NOW() + (v_sla_hours || ' hours')::INTERVAL
  ) RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar revisión
CREATE OR REPLACE FUNCTION assign_review(
  p_queue_id UUID,
  p_reviewer_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE review_queue 
  SET 
    assigned_to = p_reviewer_id,
    assigned_at = NOW(),
    status = 'in_review',
    started_at = COALESCE(started_at, NOW())
  WHERE id = p_queue_id 
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para completar revisión
CREATE OR REPLACE FUNCTION complete_review(
  p_queue_id UUID,
  p_reviewer_id UUID,
  p_decision VARCHAR(30),
  p_original_data JSONB DEFAULT NULL,
  p_corrected_data JSONB DEFAULT NULL,
  p_corrections JSONB DEFAULT '[]'::jsonb,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_started_at TIMESTAMP WITH TIME ZONE;
  v_duration INT;
  v_decision_id UUID;
BEGIN
  -- Obtener tiempo de inicio
  SELECT started_at INTO v_started_at FROM review_queue WHERE id = p_queue_id;
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_started_at))::INT;
  
  -- Crear decisión
  INSERT INTO review_decisions (
    queue_id,
    reviewer_id,
    decision,
    original_data,
    corrected_data,
    corrections_made,
    notes,
    rejection_reason,
    review_duration_seconds
  ) VALUES (
    p_queue_id,
    p_reviewer_id,
    p_decision,
    p_original_data,
    p_corrected_data,
    p_corrections,
    p_notes,
    p_rejection_reason,
    v_duration
  ) RETURNING id INTO v_decision_id;
  
  -- Actualizar cola
  UPDATE review_queue 
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_queue_id;
  
  RETURN v_decision_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para detectar SLA breach
CREATE OR REPLACE FUNCTION check_sla_breach() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_deadline < NOW() AND NEW.status = 'pending' THEN
    NEW.sla_breached := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_sla ON review_queue;
CREATE TRIGGER trigger_check_sla
  BEFORE UPDATE ON review_queue
  FOR EACH ROW
  EXECUTE FUNCTION check_sla_breach();
