-- Remove duplicate profiles, keeping only one instance of each RUT
-- Keep only Admin role profiles

-- First, identify and delete duplicates (keep the oldest record by creation date)
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY rut ORDER BY created_at ASC) as rn
    FROM profiles
    WHERE rut IS NOT NULL AND rut != ''
  ) ranked
  WHERE rn > 1
);

-- Then, delete any profiles that are not 'admin' role
DELETE FROM profiles
WHERE role != 'admin' AND role IS NOT NULL;

-- Finally, show remaining profiles
SELECT id, email, full_name, rut, role, is_active
FROM profiles
ORDER BY full_name ASC;
