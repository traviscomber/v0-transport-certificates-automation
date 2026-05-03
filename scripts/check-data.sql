-- Check if the data we updated is actually in the database
SELECT 
  rut,
  ejecutiva,
  region,
  direccion,
  COUNT(*) as count
FROM subcontratistas
WHERE ejecutiva IS NOT NULL
GROUP BY rut, ejecutiva, region, direccion
LIMIT 10;

-- Check specific RUTs from the screenshot
SELECT rut, ejecutiva, region, direccion, nombre FROM subcontratistas 
WHERE rut IN ('17824057-5', '11971485-2');

-- Count total records with complete data
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN ejecutiva IS NOT NULL THEN 1 END) as with_ejecutiva,
  COUNT(CASE WHEN region IS NOT NULL THEN 1 END) as with_region,
  COUNT(CASE WHEN direccion IS NOT NULL THEN 1 END) as with_direccion
FROM subcontratistas;
