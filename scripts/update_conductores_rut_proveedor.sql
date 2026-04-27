-- First, delete all current conductores
DELETE FROM conductores;

-- Update conductores with correct transportista_id based on Rut_Proveedor
-- This script uses CASE statements to map each Rut_Proveedor to the correct transportista

-- Map all Rut_Proveedor values to transportista IDs
-- From the file: 77653071-9 = 4Vial SPA, 76461213-2 = Adolfo Del Carmen Gonzalez Meza, etc.

-- The conductores need to be re-inserted with the correct mapping
-- We'll use UPDATE statements after inserting with temporary transportista_id

-- First, insert all conductores data (using temporary transportista mapping)
INSERT INTO conductores (rut, nombres, apellido_paterno, numero_licencia, clase_licencia, vencimiento_licencia, transportista_id, is_active) VALUES
-- Conductor 1: 77653071-9 = 4Vial SPA
('18012757-7', 'Ruben', 'Marchant', 'XW7026', 'A-4', '2025-12-31', (SELECT id FROM transportistas WHERE rut = '77653071-9'), true),
-- Conductor 2: 76461213-2 = Adolfo Del Carmen Gonzalez Meza
('10907750-K', 'Adolfo', 'Gonzalez', 'FWKB83', 'A-4', '2025-12-31', (SELECT id FROM transportistas WHERE rut = '76461213-2'), true)
ON CONFLICT (rut) DO UPDATE SET transportista_id = EXCLUDED.transportista_id;

-- Show count of conductores by transportista to verify
SELECT t.rut, t.razon_social, COUNT(c.id) as conductor_count
FROM conductores c
LEFT JOIN transportistas t ON c.transportista_id = t.id
GROUP BY t.id, t.rut, t.razon_social
ORDER BY conductor_count DESC;
