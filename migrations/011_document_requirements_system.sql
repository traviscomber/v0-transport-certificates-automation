-- ============================================
-- Document Requirements Management System
-- Supports Chilean transport company compliance
-- ============================================

-- 1. Document Periodicity Enum
CREATE TYPE document_periodicity AS ENUM ('once', 'monthly', 'annual', 'biennial', 'triennial', 'as_needed');

-- 2. Document Category Enum
CREATE TYPE document_category AS ENUM ('company', 'vehicle', 'conductor');

-- 3. Validation Rule Type Enum
CREATE TYPE validation_rule_type AS ENUM (
  'date_format',
  'date_range',
  'rut_format',
  'license_format',
  'file_type',
  'file_size',
  'pattern_match',
  'custom_function'
);

-- 4. Main Document Requirements Table
-- Stores all document type requirements from the specification
CREATE TABLE IF NOT EXISTS document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "COND_AFP", "COMPANY_ROL"
  name VARCHAR(255) NOT NULL, -- e.g., "AFP Contribution"
  description TEXT,
  category document_category NOT NULL, -- company, vehicle, conductor
  
  -- Periodicity & Dates
  periodicity document_periodicity NOT NULL,
  renewal_days INTEGER, -- Days until renewal needed (e.g., 365 for annual)
  expiration_warning_days INTEGER DEFAULT 30, -- Alert 30 days before expiry
  
  -- Metadata
  applicable_to_transportista BOOLEAN DEFAULT TRUE,
  applicable_to_conductor BOOLEAN DEFAULT TRUE,
  applicable_to_vehicle BOOLEAN DEFAULT FALSE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Requirements Details
  required_fields JSONB DEFAULT '{}', -- {{"field": "rut", "type": "text", "required": true}, ...}
  file_requirements JSONB DEFAULT '{"allowed_types": ["pdf", "jpg", "png"], "max_size_mb": 10}',
  acceptance_criteria TEXT,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_category ON document_requirements(category),
  INDEX idx_code ON document_requirements(code),
  INDEX idx_periodicity ON document_requirements(periodicity)
);

-- 5. Validation Rules Table
-- Stores validation logic for each document requirement
CREATE TABLE IF NOT EXISTS document_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  document_requirement_id UUID NOT NULL REFERENCES document_requirements(id) ON DELETE CASCADE,
  
  -- Rule Configuration
  rule_type validation_rule_type NOT NULL,
  rule_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Rule Parameters (stored as JSON for flexibility)
  -- Examples:
  -- {"pattern": "^\\d{1,2}\\.\\d{3}\\.\\d{3}-[0-9K]$"} for RUT format
  -- {"min_days_valid": 90} for license expiry check
  -- {"allowed_types": ["pdf", "jpg"]} for file type
  parameters JSONB NOT NULL DEFAULT '{}',
  
  -- Error Messages
  error_message VARCHAR(500),
  error_message_es VARCHAR(500),
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_document_requirement ON document_validation_rules(document_requirement_id)
);

-- 6. Conductor Compliance Tracking Table
-- Tracks which documents each conductor has submitted and their status
CREATE TABLE IF NOT EXISTS conductor_document_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  conductor_id UUID NOT NULL REFERENCES conductores(id) ON DELETE CASCADE,
  document_requirement_id UUID NOT NULL REFERENCES document_requirements(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, submitted, approved, expired, missing
  
  -- Document Reference
  latest_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,
  submission_date TIMESTAMP WITH TIME ZONE,
  
  -- Expiry Tracking
  expiry_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER,
  expiry_alert_sent BOOLEAN DEFAULT FALSE,
  expiry_alert_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Compliance Notes
  rejection_reason TEXT,
  notes TEXT,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(conductor_id, document_requirement_id),
  INDEX idx_conductor ON conductor_document_compliance(conductor_id),
  INDEX idx_status ON conductor_document_compliance(status),
  INDEX idx_expiry ON conductor_document_compliance(expiry_date),
  INDEX idx_missing ON conductor_document_compliance(status) WHERE status = 'missing'
);

-- 7. Company Compliance Tracking Table
-- Similar structure for company-level documents
CREATE TABLE IF NOT EXISTS company_document_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  transportista_id UUID NOT NULL REFERENCES transportistas(id) ON DELETE CASCADE,
  document_requirement_id UUID NOT NULL REFERENCES document_requirements(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, submitted, approved, expired, missing
  
  -- Document Reference
  latest_document_id UUID REFERENCES uploaded_documents(id) ON DELETE SET NULL,
  submission_date TIMESTAMP WITH TIME ZONE,
  
  -- Expiry Tracking
  expiry_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER,
  expiry_alert_sent BOOLEAN DEFAULT FALSE,
  expiry_alert_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Compliance Notes
  rejection_reason TEXT,
  notes TEXT,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(transportista_id, document_requirement_id),
  INDEX idx_transportista ON company_document_compliance(transportista_id),
  INDEX idx_status ON company_document_compliance(status),
  INDEX idx_expiry ON company_document_compliance(expiry_date)
);

-- 8. Compliance Score Table
-- Calculates and tracks compliance score over time
CREATE TABLE IF NOT EXISTS compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Either conductor or transportista (polymorphic)
  entity_type VARCHAR(50) NOT NULL, -- 'conductor' or 'transportista'
  entity_id UUID NOT NULL,
  
  -- Score Calculation
  total_required_documents INTEGER,
  completed_documents INTEGER,
  pending_documents INTEGER,
  expired_documents INTEGER,
  missing_documents INTEGER,
  
  -- Overall Score (0-100)
  compliance_score FLOAT NOT NULL DEFAULT 0,
  
  -- Risk Level
  risk_level VARCHAR(50), -- 'green' (90-100), 'yellow' (70-89), 'red' (<70)
  
  -- Tracking
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_entity ON compliance_scores(entity_type, entity_id),
  INDEX idx_risk ON compliance_scores(risk_level)
);

-- 9. Compliance Alerts Table
-- Stores generated compliance alerts
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Alert Target
  entity_type VARCHAR(50) NOT NULL, -- 'conductor' or 'transportista'
  entity_id UUID NOT NULL,
  
  -- Alert Details
  alert_type VARCHAR(50) NOT NULL, -- 'expiry_warning', 'missing_document', 'expired', 'compliance_issue'
  severity VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Document
  document_requirement_id UUID REFERENCES document_requirements(id),
  days_until_action INTEGER,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, acknowledged, resolved
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_entity ON compliance_alerts(entity_type, entity_id),
  INDEX idx_severity ON compliance_alerts(severity),
  INDEX idx_status ON compliance_alerts(status),
  INDEX idx_type ON compliance_alerts(alert_type)
);

-- 10. Create Indexes for performance
CREATE INDEX idx_compliance_alerts_active ON compliance_alerts(status) WHERE status = 'active';
CREATE INDEX idx_conductor_compliance_missing ON conductor_document_compliance(status, conductor_id);
CREATE INDEX idx_company_compliance_missing ON company_document_compliance(status, transportista_id);

-- Update trigger for document_requirements
CREATE OR REPLACE FUNCTION update_document_requirements_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_document_requirements_updated
  BEFORE UPDATE ON document_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_document_requirements_timestamp();

-- Update trigger for document_validation_rules
CREATE OR REPLACE FUNCTION update_validation_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validation_rules_updated
  BEFORE UPDATE ON document_validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_validation_rules_timestamp();

-- Update trigger for compliance tracking
CREATE OR REPLACE FUNCTION update_compliance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conductor_compliance_updated
  BEFORE UPDATE ON conductor_document_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_timestamp();

CREATE TRIGGER trigger_company_compliance_updated
  BEFORE UPDATE ON company_document_compliance
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_timestamp();
