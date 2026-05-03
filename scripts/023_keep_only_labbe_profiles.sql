-- Delete all profiles that are NOT @labbe.cl accounts
DELETE FROM profiles
WHERE email NOT LIKE '%@labbe.cl'
  AND email NOT LIKE '%@transporteslabbe.cl';

-- Verify remaining profiles
SELECT id, email, full_name, role FROM profiles ORDER BY full_name;
