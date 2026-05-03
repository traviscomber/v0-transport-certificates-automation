-- Insert 6 usuarios de Transportes Labbe
-- Get organization_id for Transportes Labbe
WITH labbe_org AS (
  SELECT id FROM organizations WHERE name = 'Transportes Labbe' LIMIT 1
)
INSERT INTO profiles (
  id, email, full_name, role, rut, phone, is_active, organization_id
) VALUES
  (
    gen_random_uuid(),
    'olga.carrasco@transporteslabbe.cl',
    'Olga Lydia Carrasco Olivares',
    'admin',
    '10574005-0',
    '+56977764753',
    true,
    (SELECT id FROM labbe_org)
  ),
  (
    gen_random_uuid(),
    'carolina.sepulveda@transporteslabbe.cl',
    'Carolina Pilar Sepulveda Contreras',
    'admin',
    '15464094-0',
    '+56950067666',
    true,
    (SELECT id FROM labbe_org)
  ),
  (
    gen_random_uuid(),
    'daniela.silva@transporteslabbe.cl',
    'Daniela Constanza Silva Rojas',
    'admin',
    '17768246-2',
    '+56978540722',
    true,
    (SELECT id FROM labbe_org)
  ),
  (
    gen_random_uuid(),
    'cecilia.farias@transporteslabbe.cl',
    'Cecilia Del Carmen Farias Muñoz',
    'admin',
    '9888992-2',
    '+56978540798',
    true,
    (SELECT id FROM labbe_org)
  ),
  (
    gen_random_uuid(),
    'diego.gonzalez@transporteslabbe.cl',
    'Diego Andres Gonzalez Valenzuela',
    'admin',
    '20114106-0',
    '+56978455527',
    true,
    (SELECT id FROM labbe_org)
  ),
  (
    gen_random_uuid(),
    'katherinne.canales@transporteslabbe.cl',
    'Katherinne Johanna Canales Hernandez',
    'admin',
    '18717311-6',
    '+56956139744',
    true,
    (SELECT id FROM labbe_org)
  );

-- Verify insertion
SELECT COUNT(*) as total_usuarios, 
       COUNT(DISTINCT rut) as unique_ruts
FROM profiles 
WHERE organization_id = (SELECT id FROM organizations WHERE name = 'Transportes Labbe');
