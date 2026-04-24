-- Simplified alerts_log table without organization dependency
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_log_created_at ON alerts_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_log_alert_type ON alerts_log(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_log_is_read ON alerts_log(is_read);
