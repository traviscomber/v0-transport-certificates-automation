-- Check the structure of subcontratistas table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subcontratistas'
ORDER BY ordinal_position;

-- Check sample data to see if ejecutiva, region, direccion are populated
SELECT rut, nombre, ejecutiva, region, direccion, comuna
FROM subcontratistas
LIMIT 20;

-- Count records with populated ejecutiva, region, direccion
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN ejecutiva IS NOT NULL THEN 1 END) as with_ejecutiva,
  COUNT(CASE WHEN region IS NOT NULL THEN 1 END) as with_region,
  COUNT(CASE WHEN direccion IS NOT NULL THEN 1 END) as with_direccion,
  COUNT(CASE WHEN comuna IS NOT NULL THEN 1 END) as with_comuna
FROM subcontratistas;
