-- Populate Transportistas (Subcontractors/Companies)
INSERT INTO transportistas (rut, nombre, ejecutiva, representante, direccion, comuna, email, telefono, created_at, updated_at)
VALUES
  ('78376780-5', 'LABBE TRANSPORTES Y CIAS LTDA.', 'EJECUTIVA DE CUENTA', 'Juan Perez', 'Av. Principal 1234, Santiago', 'Santiago', 'labbe@transportes.cl', '+56998765432', NOW(), NOW()),
  ('77389829-4', 'Transportes Manuel Perez Vilches E.i.r.l.', 'EJECUTIVA DE CUENTA', 'Manuel Perez', 'Calle 5 789, Valparaiso', 'Valparaiso', 'manuel.perez@transport.cl', '+56987654321', NOW(), NOW()),
  ('77222214-9', 'Transportes Marco Antonio Gatica Moreno Spa', 'EJECUTIVA DE CUENTA', 'Marco Antonio', 'Avenida 10 567, Concepcion', 'Concepcion', 'marco@transport.cl', '+56912345678', NOW(), NOW()),
  ('77703639-4', 'Transportes Pecort Spa', 'EJECUTIVA DE CUENTA', 'Pedro Cortes', 'Pasaje 3 234, Valdivia', 'Valdivia', 'pecort@transport.cl', '+56923456789', NOW(), NOW()),
  ('78069053-4', 'Transportes Mauricio Arroyo E.i.r.l.', 'EJECUTIVA DE CUENTA', 'Mauricio Arroyo', 'Calle 7 456, Puerto Montt', 'Puerto Montt', 'mauricio@transport.cl', '+56934567890', NOW(), NOW()),
  ('77113814-4', 'Transportes Luis Eduardo Cruz Perez EIRL', 'EJECUTIVA DE CUENTA', 'Luis Cruz', 'Avenida 8 901, Los Angeles', 'Los Angeles', 'luiscruz@transport.cl', '+56945678901', NOW(), NOW())
ON CONFLICT (rut) DO NOTHING;

-- Get LABBE company ID for driver inserts
WITH labbe_company AS (
  SELECT id FROM transportistas WHERE rut = '78376780-5'
)

-- Populate Conductores (Drivers)
INSERT INTO conductores (rut, nombre, rut_proveedor, proveedor, patente_tracto, empresa_id, created_at, updated_at)
SELECT 
  drivers.rut,
  drivers.nombre,
  drivers.rut_proveedor,
  drivers.proveedor,
  drivers.patente_tracto,
  labbe_company.id,
  NOW(),
  NOW()
FROM (
  VALUES
    ('12967316-8', 'Cesar Augusto Romero Baez', '78100599-1', 'Transportes Milady Spa', 'GKZD53'),
    ('15148994-K', 'Miguel Luis Infante Zambrano', '77349385-5', 'Transportes Inma Spa', 'GXST33'),
    ('17231344-2', 'Isaac Rafael Iturrieta AÑo', '78179126-1', 'Transportes Isacon Spa', 'GWWR87'),
    ('12920772-8', 'Ivan Diaz Rivas', '77624569-0', 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL', 'LCXJ73'),
    ('17393582-K', 'Luis Alfonso Guerrero Díaz', '77624569-0', 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL', 'JRZH17'),
    ('19371373-4', 'Jose Ignacio Mendoza Cid', '77941312-8', 'TRANSPORTES J&F SPA', 'JCHR80'),
    ('12022695-9', 'Marco Antonio Sanhueza Espino', '77499811-K', 'Transportes Jahdiel Spa', 'ZN3943'),
    ('11801151-1', 'Jhon Chavarria Muñoz', '77495891-6', 'TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L', 'YW3574'),
    ('18316251-9', 'Jamyr Ajmed Karim Vargas', '78283626-9', 'Transportes Jkarimv Spa', 'FDKC88'),
    ('18011702-4', 'John Francisco Jofre Gomez', '78244173-6', 'Transportes Jme Spa', 'HSYC65')
) AS drivers(rut, nombre, rut_proveedor, proveedor, patente_tracto),
labbe_company
ON CONFLICT (rut) DO NOTHING;
