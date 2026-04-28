-- Add metrics columns to certificates table for executive performance tracking
-- Phase 1: Capture data for metrics

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS ai_recommendation VARCHAR(50);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS ai_confidence FLOAT DEFAULT 0;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS ai_extracted_data JSONB;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS validation_time_seconds INT DEFAULT 0;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS validated_by_id UUID REFERENCES auth.users(id);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS discrepancy_type VARCHAR(50) DEFAULT 'none';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS resubmitted_count INT DEFAULT 0;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_validated_by_id ON certificates(validated_by_id);
CREATE INDEX IF NOT EXISTS idx_certificates_validated_at ON certificates(validated_at);
CREATE INDEX IF NOT EXISTS idx_certificates_discrepancy_type ON certificates(discrepancy_type);

-- Create view for executive metrics (Phase 2)
CREATE OR REPLACE VIEW executive_metrics AS
SELECT 
  v.validated_by_id as executive_id,
  p.full_name as executive_name,
  COUNT(*) as documents_processed,
  ROUND(AVG(v.validation_time_seconds)::numeric, 2) as avg_validation_time,
  ROUND(CAST(SUM(CASE WHEN v.discrepancy_type = 'none' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as ai_concordance_percentage,
  ROUND(CAST(SUM(CASE WHEN v.status = 'approved' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as approval_rate,
  ROUND(AVG(v.ai_confidence)::numeric, 2) as avg_ai_confidence,
  DATE(v.validated_at) as validation_date
FROM certificates v
LEFT JOIN profiles p ON v.validated_by_id = p.id
WHERE v.validated_at IS NOT NULL AND v.validated_by_id IS NOT NULL
GROUP BY v.validated_by_id, p.full_name, DATE(v.validated_at)
ORDER BY validation_date DESC, documents_processed DESC;

COMMENT ON VIEW executive_metrics IS 'Metrics for executive performance tracking - documents processed, validation time, AI concordance, approval rates';
