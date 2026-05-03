-- Alerts System Tables

-- Main alerts log table
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- DOCUMENT_UPLOADED, DOCUMENT_EXPIRING, DOCUMENT_VALIDATED, DOCUMENT_REJECTED, COMPLIANCE_VIOLATION, SYSTEM_EVENT
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  title VARCHAR(255) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50), -- conductor, subcontractor, document, equipment
  entity_id VARCHAR(100),
  entity_name VARCHAR(255),
  related_rut VARCHAR(20),
  
  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  read_by UUID,
  read_at TIMESTAMP,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  
  -- Action links
  action_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Alert preferences by user
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  
  -- Alert types they want to receive
  document_uploads BOOLEAN DEFAULT TRUE,
  document_expirations BOOLEAN DEFAULT TRUE,
  document_validations BOOLEAN DEFAULT TRUE,
  compliance_violations BOOLEAN DEFAULT TRUE,
  system_events BOOLEAN DEFAULT TRUE,
  
  -- Frequency
  email_notifications BOOLEAN DEFAULT FALSE,
  notification_frequency VARCHAR(20) DEFAULT 'realtime', -- realtime, daily, weekly
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id),
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Alert trigger rules
CREATE TABLE IF NOT EXISTS alert_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  alert_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  
  -- Conditions
  trigger_condition JSONB NOT NULL, -- e.g., {"days_before_expiration": 7}
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_alerts_organization_created ON alerts_log(organization_id, created_at DESC);
CREATE INDEX idx_alerts_is_read ON alerts_log(organization_id, is_read);
CREATE INDEX idx_alerts_type ON alerts_log(alert_type);
CREATE INDEX idx_alerts_priority ON alerts_log(priority);
CREATE INDEX idx_alerts_entity ON alerts_log(entity_type, entity_id);

-- Enable RLS
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts_log (users can read alerts from their organization)
CREATE POLICY "Users can read organization alerts"
  ON alerts_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth.uid() = id
    )
  );

CREATE POLICY "Service role can insert alerts"
  ON alerts_log FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    organization_id IN (SELECT organization_id FROM users WHERE auth.uid() = id)
  );

-- RLS Policies for alert_preferences (users can only manage their own)
CREATE POLICY "Users can read their alert preferences"
  ON alert_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their alert preferences"
  ON alert_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their alert preferences"
  ON alert_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alert_triggers (only admins)
CREATE POLICY "Admins can manage alert triggers"
  ON alert_triggers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth.uid() = id AND role IN ('admin', 'supervisor')
    )
  );
