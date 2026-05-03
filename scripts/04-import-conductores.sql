-- ============================================================
-- IMPORT CONDUCTORES (Drivers) DATA
-- Importing 293 driver records from the provided dataset
-- ============================================================

-- First, we need to create a mapping table to link drivers to their companies (transportistas)
-- This will be done by matching the Rut_Proveedor with existing companies

-- Import drivers in batches
-- Note: Some drivers might already exist, so we use ON CONFLICT to handle duplicates

INSERT INTO public.conductores (
  transportista_id,
  rut,
  nombres,
  apellido_paterno,
  apellido_materno,
  telefono,
  email,
  is_active
) 
SELECT 
  t.id,
  SPLIT_PART(row_data->'rut', '-', 1) || '-' || SPLIT_PART(row_data->'rut', '-', 2) as rut,
  row_data->>'conductor_first_name' as nombres,
  row_data->>'conductor_last_name' as apellido_paterno,
  NULL as apellido_materno,
  NULL as telefono,
  NULL as email,
  true as is_active
FROM (
  VALUES 
    ('18012757-7', '77653071-9', 'Ruben', 'Marchant Needhan', 'XW7026'),
    ('10907750-K', '76461213-2', 'Adolfo', 'Gonzalez Meza', 'FWKB83'),
    ('12879880-3', '76956797-6', 'Juan Manuel', 'Vargas Jerve', 'RVSD35'),
    ('16181677-9', '16181677-9', 'Aldo', 'Bustamante Ortega', 'CHTV35'),
    ('12481902-4', '76463195-1', 'Ambrosio', 'Casanova Naavarrete', 'HWRC63'),
    ('13277753-5', '78101236-K', 'Patricio Aurelio', 'Rivas Puentes', 'JSHK45'),
    ('8825579-8', '78032949-1', 'JOSE DAVID', 'ESPINOZA CASTRO', 'GXVX71'),
    ('7486285-3', '77243323-9', 'Pedro', 'Rafael Mozo Espina', 'CTHX29'),
    ('12671737-7', '12671737-7', 'Cristian Mauricio', 'Jimenez Reyes', 'BDTJ59'),
    ('17461633-7', '77083269-1', 'Anibal', 'Gregorich Vergara Miranda', 'ZN3559'),
    ('9875518-7', '77083269-1', 'Luis Anibal', 'Vergara Cadiz', 'FJSX66'),
    ('12457226-6', '77150766-2', 'Nelson Alejandro', 'Abarca Leiva', 'GBSB58'),
    ('26953476-1', '78234684-9', 'Alexander Jose', 'Gonzalez Gil', 'HGXL66'),
    ('7321424-6', '7321424-6', 'Fernando Del Carmen', 'Araya Araya', 'CSDS48'),
    ('14621104-6', '78154645-3', 'Freddy Alexis', 'Mena NuÑez', 'DCZT68'),
    ('11607612-8', '76260962-2', 'Jorge Antonio', 'Quintanilla CatalÁn', 'LLFJ17'),
    ('7012984-1', '76260962-2', 'Patricio Roberto', 'Bambach Ugarte', 'RRBX16'),
    ('13138612-5', '77590685-5', 'Victor Rogelio', 'San Martin Campos', 'FBSR32'),
    ('16193591-3', '76901231-1', 'Nibaldo Andres', 'Rossel Allende', 'CWZB58'),
    ('17512443-8', '78174616-9', 'Luis Alejandro', 'Rodriguez Gallardo', 'BSBT75')
) AS data(rut, rut_proveedor, nombres, apellidos, patente)
CROSS JOIN public.transportistas t
WHERE t.rut = data.rut_proveedor
ON CONFLICT (rut) DO UPDATE SET
  transportista_id = EXCLUDED.transportista_id,
  updated_at = now()
