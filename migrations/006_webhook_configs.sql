-- Create webhook_configs table for storing webhook integrations
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('slack', 'teams', 'email')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  min_severity TEXT NOT NULL DEFAULT 'medium' CHECK (min_severity IN ('low', 'medium', 'high', 'critical')),
  active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_webhook_configs_company_id ON webhook_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_type ON webhook_configs(type);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON webhook_configs(active);

-- Enable RLS
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "webhook_configs_select_company" ON webhook_configs
  FOR SELECT USING (
    company_id = current_user_company_id() OR
    current_user_is_admin()
  );

CREATE POLICY "webhook_configs_insert_company" ON webhook_configs
  FOR INSERT WITH CHECK (
    company_id = current_user_company_id() OR
    current_user_is_admin()
  );

CREATE POLICY "webhook_configs_update_company" ON webhook_configs
  FOR UPDATE USING (
    company_id = current_user_company_id() OR
    current_user_is_admin()
  );

CREATE POLICY "webhook_configs_delete_company" ON webhook_configs
  FOR DELETE USING (
    company_id = current_user_company_id() OR
    current_user_is_admin()
  );
