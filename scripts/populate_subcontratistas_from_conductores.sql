-- Clear existing subcontratistas first to start fresh with correct data
TRUNCATE TABLE subcontratistas CASCADE;

-- Create a temporary table with unique providers from conductores
CREATE TEMP TABLE temp_proveedores AS
SELECT DISTINCT 
  t.rut as rut_proveedor,
  t.razon_social as proveedor_nombre
FROM conductores c
JOIN transportistas t ON c.transportista_id = t.id
WHERE t.rut IS NOT NULL;

-- Insert into subcontratistas with all unique providers
INSERT INTO subcontratistas (rut, razon_social, is_active)
SELECT DISTINCT
  rut_proveedor,
  proveedor_nombre,
  true
FROM temp_proveedores
ORDER BY rut_proveedor;

-- Verify the population
SELECT 
  COUNT(*) as total_subcontratistas,
  COUNT(DISTINCT rut) as unique_ruts
FROM subcontratistas;

-- Show sample data
SELECT rut, razon_social FROM subcontratistas LIMIT 10;
