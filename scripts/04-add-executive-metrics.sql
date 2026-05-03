-- Create view for executive metrics
CREATE OR REPLACE VIEW executive_metrics AS
SELECT 
  c.validated_by as executive_id,
  c.validated_by as executive_name,
  COUNT(*) as documents_processed,
  ROUND(AVG(COALESCE(c.validation_time_seconds, 0))::numeric, 2) as avg_validation_time,
  ROUND(CAST(SUM(CASE WHEN c.status = 'approved' THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(*), 0) * 100, 2) as approval_rate,
  DATE(c.validated_at) as validation_date
FROM certificates c
WHERE c.validated_at IS NOT NULL AND c.validated_by IS NOT NULL
GROUP BY c.validated_by, DATE(c.validated_at)
ORDER BY validation_date DESC, documents_processed DESC;
