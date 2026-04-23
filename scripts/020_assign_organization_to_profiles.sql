-- Update existing profiles to have organization_id for Transportes Labbe
UPDATE profiles
SET organization_id = (
  SELECT id FROM organizations 
  WHERE name = 'Transportes Labbe' 
  LIMIT 1
)
WHERE organization_id IS NULL
AND (rut IN ('10574005-0', '15464094-0', '17768246-2', '9888992-2', '20114106-0', '18717311-6'));

-- Verify update
SELECT COUNT(*) as profiles_with_org FROM profiles 
WHERE rut IN ('10574005-0', '15464094-0', '17768246-2', '9888992-2', '20114106-0', '18717311-6')
AND organization_id IS NOT NULL;
