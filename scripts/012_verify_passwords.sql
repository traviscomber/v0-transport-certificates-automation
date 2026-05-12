-- Script to verify the password hash in transportista_auth
-- Execute this to see what password is stored for a specific RUT

SELECT 
  rut,
  password_hash,
  is_active,
  created_at,
  LENGTH(password_hash) as hash_length
FROM transportista_auth 
WHERE rut = '77653071-9';

-- Also check all hashes to see if they're properly formatted (should start with $2a$ or $2b$)
SELECT 
  COUNT(*) as total_records,
  SUM(CASE WHEN password_hash LIKE '$2%' THEN 1 ELSE 0 END) as valid_bcrypt_hashes,
  SUM(CASE WHEN password_hash NOT LIKE '$2%' THEN 1 ELSE 0 END) as invalid_hashes
FROM transportista_auth;
