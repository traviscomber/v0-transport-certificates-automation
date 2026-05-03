-- Disable foreign key constraint temporarily for insertion
SET CONSTRAINTS ALL DEFERRED;

-- Insert transportistas (companies/subcontractors)
INSERT INTO public.transportistas (rut, razon_social, representante_legal, telefono, email, direccion, comuna) VALUES
('77653071-9', '4Vial SPA', 'Ruben Marchant Needhan', '9 7255 5016', 'g4vial@gmail.com', 'Ahumada 312 of 715', 'Santiago'),
('76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', 'Adolfo Gonzalez Meza', '9 9291 0830', 'adolfo.gonzalez.meza@hotmail.com', 'Esmeralda 1561 Lote 2', 'Colina'),
('76956797-6', 'AEROCAV SPA', 'JOSE MIGUEL ROJAS URBINA', '9 5533 9046', 'JROJAS.SL@GMAIL.COM', 'Argomedo 321', 'Santiago'),
('16181677-9', 'Aldo Antonio Bustamante Ortega', 'Aldo Antonio Bustamante Ortega', '9 6431 9423', 'z71aldo@hotmail.com', 'Gacitua 564', 'Isla de Maipo'),
('76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', 'Ambrosio Casanova Naavarrete', '9 7147 6688', 'juliancasanova1973@gmail.com', 'Pje los Pinos 1498', 'Rengo'),
('77243323-9', 'Comercio, Servicios Y Transportes Mozó Spa', 'Falcon Nicolas Mozo Farfan', '9 5630 6291', 'contacto@cerpaconsultores.cl', 'Morande 835 of 518', 'Santiago'),
('78234684-9', 'F & F Spa', 'Francisco Andres Villagran Ramirez', '932652497', 'fyftranspspa@gmail.com', 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', 'Talca'),
('78154645-3', 'Fever Spa', 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', '', '', 'SANTIAGO ALDEA 906', 'Padre Hurtado'),
('76260962-2', 'Hidroamerica Spa', 'Patricio Roberto Bambach Ugarte', '9 4287 4454', 'PBAMBACH@hidroamerica.cl', 'Avenida las Condes 9792', 'Las Condes'),
('78101236-K', 'Logística Siete Robles Spa', 'PATRICIO AURELIO RIVAS PUENTES', '964452706', 'logisticasieterobles@gmail.com', 'DIEZ NORTE 2314', 'TALCA')
ON CONFLICT (rut) DO NOTHING;

-- Continue with conductores (drivers)
-- Note: For drivers, we need to match them with transportista_id via the provider RUT from your data

INSERT INTO public.conductores (transportista_id, rut, nombres, apellido_paterno, apellido_materno, telefono, email) VALUES
-- Will link via provider RUT lookup after transportistas are loaded
('18012757-7', 'Ruben Marchant', '', 'Needhan', '', '', ''),
('10907750-K', 'Adolfo Gonzalez', '', 'Meza', '', '', ''),
('12879880-3', 'Juan Manuel Vargas', '', 'Jerve', '', '', ''),
('16181677-9', 'Aldo Bustamante', '', 'Ortega', '', '', '')
ON CONFLICT (rut) DO NOTHING;

-- Re-enable foreign key constraints
SET CONSTRAINTS ALL IMMEDIATE;
