-- 024_cleanup_old_email_profiles.sql
-- Delete duplicate profiles with old @labbe.cl email format, keeping the newer @transporteslabbe.cl versions

DELETE FROM profiles
WHERE email LIKE '%@labbe.cl' 
AND (
  email = 'ocarrasco@labbe.cl'
  OR email = 'csepulveda@labbe.cl'
  OR email = 'dsilva@labbe.cl'
  OR email = 'cfarias@labbe.cl'
  OR email = 'kcanales@labbe.cl'
  OR email = 'dgonzalez@labbe.cl'
);

-- Verify the cleanup
SELECT COUNT(*) as remaining_profiles FROM profiles WHERE email LIKE '%@labbe.cl';
