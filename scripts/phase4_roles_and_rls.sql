-- Phase 4: Role-based permissions and RLS policies

-- 1. UPDATE ROLES - Agregar nuevos roles de onboarding y prevención de riesgos
INSERT INTO roles (name, description) VALUES 
  ('onboarding', 'Equipo de Onboarding - Gestiona postulantes y documentación'),
  ('prevencion_riesgos', 'Prevención de Riesgos - Aprueba postulantes finales'),
  ('liquidaciones', 'Gestión de Liquidaciones - Administra pagos de conductores')
ON CONFLICT (name) DO NOTHING;

-- 2. CREATE USER_ROLES mapping if not exists
-- (Assumes user_roles table exists)

-- 3. UPDATE RLS POLICIES FOR APPLICANTS
-- Allow admins and onboarding staff to view/manage applicants
DROP POLICY IF EXISTS "applicants_view_own_company" ON public.applicants;
DROP POLICY IF EXISTS "applicants_create" ON public.applicants;

CREATE POLICY "applicants_admin_view" ON public.applicants
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "applicants_onboarding_view" ON public.applicants
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('onboarding', 'prevencion_riesgos'))
    )
  );

CREATE POLICY "applicants_insert_admin" ON public.applicants
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "applicants_insert_onboarding" ON public.applicants
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name = 'onboarding')
    )
  );

-- Allow updates only by onboarding and prevencion_riesgos
CREATE POLICY "applicants_update" ON public.applicants
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles WHERE profiles.role IN ('admin', 'manager')
      UNION
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('onboarding', 'prevencion_riesgos'))
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles WHERE profiles.role IN ('admin', 'manager')
      UNION
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('onboarding', 'prevencion_riesgos'))
    )
  );

-- 4. UPDATE RLS FOR DRIVER_LICENSES
DROP POLICY IF EXISTS "licenses_view" ON public.driver_licenses;

CREATE POLICY "driver_licenses_view" ON public.driver_licenses
  FOR SELECT
  USING (true);

CREATE POLICY "driver_licenses_insert_admin" ON public.driver_licenses
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
  );

-- 5. UPDATE RLS FOR CERTIFICATIONS
DROP POLICY IF EXISTS "certifications_view" ON public.driver_certifications;

CREATE POLICY "driver_certifications_view" ON public.driver_certifications
  FOR SELECT
  USING (true);

CREATE POLICY "driver_certifications_insert_admin" ON public.driver_certifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
  );

-- 6. UPDATE RLS FOR LIQUIDATIONS
DROP POLICY IF EXISTS "liquidations_view_own" ON public.driver_liquidations;

CREATE POLICY "liquidations_view_all" ON public.driver_liquidations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
    OR auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name = 'liquidaciones')
    )
    OR auth.uid() = driver_id
  );

CREATE POLICY "liquidations_insert_admin" ON public.driver_liquidations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
    OR auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name = 'liquidaciones')
    )
  );

CREATE POLICY "liquidations_update_admin" ON public.driver_liquidations
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
    OR auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name = 'liquidaciones')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
    OR auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name = 'liquidaciones')
    )
  );

-- 7. UPDATE RLS FOR SUBCONTRACTOR_DRIVERS
DROP POLICY IF EXISTS "subcontractor_drivers_view" ON public.subcontractor_drivers;

CREATE POLICY "subcontractor_drivers_view" ON public.subcontractor_drivers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role IN ('admin', 'manager')
    )
  );

-- 8. GRANT PERMISSIONS BY ROLE
-- Grant execute permissions on functions to different roles
GRANT SELECT, INSERT, UPDATE ON applicants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON driver_licenses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON driver_certifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON driver_liquidations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subcontractor_drivers TO authenticated;

-- 9. CREATE APPROVAL AUDIT TABLE (for tracking approvals)
CREATE TABLE IF NOT EXISTS public.applicant_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  approved_by UUID NOT NULL REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_type VARCHAR(50), -- background_check, documents, final_approval
  status VARCHAR(50), -- approved, rejected
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_applicant_approvals_applicant ON public.applicant_approvals(applicant_id);
CREATE INDEX idx_applicant_approvals_status ON public.applicant_approvals(status);

ALTER TABLE public.applicant_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applicant_approvals_view" ON public.applicant_approvals
  FOR SELECT
  USING (true);

CREATE POLICY "applicant_approvals_insert" ON public.applicant_approvals
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profiles.id FROM profiles WHERE profiles.role IN ('admin', 'manager')
      UNION
      SELECT user_id FROM user_roles 
      WHERE role_id IN (SELECT id FROM roles WHERE name IN ('onboarding', 'prevencion_riesgos'))
    )
  );
