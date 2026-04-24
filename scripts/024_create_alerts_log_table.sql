-- Create alerts_log table for storing system alerts
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- SUCCESS, ERROR, WARNING, INFO
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  title VARCHAR(255) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50), -- document, driver, subcontractor, system
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_log_organization ON alerts_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_created_at ON alerts_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_log_alert_type ON alerts_log(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_log_is_read ON alerts_log(is_read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alerts_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_alerts_log_timestamp_trigger ON alerts_log;
CREATE TRIGGER update_alerts_log_timestamp_trigger
BEFORE UPDATE ON alerts_log
FOR EACH ROW
EXECUTE FUNCTION update_alerts_log_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON alerts_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON alerts_log TO service_role;
