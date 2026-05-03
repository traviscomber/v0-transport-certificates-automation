-- Insert real subcontractors (transportistas) data
-- Data source: pasted-text-1SAhD.txt (235 subcontractors)

INSERT INTO transportistas (rut, nombre, representante_legal, rut_representante, ejecutiva, direccion, comuna, telefono, email) VALUES
('77653071-9', '4Vial SPA', 'Ruben Marchant Needhan', '18012757-7', 'Carolina', 'Ahumada 312 of 715', 'Santiago', '9 7255 5016', 'g4vial@gmail.com'),
('76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', 'Adolfo Gonzalez Meza', '10907750-K', 'Carolina', 'Esmeralda 1561 Lote 2', 'Colina', '9 9291 0830', 'adolfo.gonzalez.meza@hotmail.com'),
('76956797-6', 'AEROCAV SPA', 'JOSE MIGUEL ROJAS URBINA', '25193295-6', 'Carolina', 'Argomedo 321', 'Santiago', '9 5533 9046', 'JROJAS.SL@GMAIL.COM'),
('16181677-9', 'Aldo Antonio Bustamante Ortega', 'Aldo Antonio Bustamante Ortega', '16181677-9', 'Carolina', 'Gacitua 564', 'Isla de Maipo', '9 6431 9423', 'z71aldo@hotmail.com'),
('76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', 'Ambrosio Casanova Naavarrete', '12481902-4', 'Carolina', 'Pje los Pinos 1498', 'Rengo', '9 7147 6688', 'juliancasanova1973@gmail.com'),
('77243323-9', 'Comercio, Servicios Y Transportes Mozó Spa', 'Falcon Nicolas Mozo Farfan', '17191002-1', 'Carolina', 'Morande 835 of 518', 'Santiago', '9 5630 6291', 'contacto@cerpaconsultores.cl'),
('78234684-9', 'F & F Spa', 'Francisco Andres Villagran Ramirez', '17830498-4', 'Carolina', 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', 'Talca', '932652497', 'fyftranspspa@gmail.com'),
('78154645-3', 'Fever Spa', 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', '15337400-7', 'Carolina', 'SANTIAGO ALDEA 906', 'Padre Hurtado', '', ''),
('76260962-2', 'Hidroamerica Spa', 'Patricio Roberto Bambach Ugarte', '7012984-1', 'Carolina', 'Avenida las Condes 9792', 'Las Condes', '9 4287 4454', 'PBAMBACH@hidroamerica.cl'),
('78101236-K', 'Logística Siete Robles Spa', 'PATRICIO AURELIO RIVAS PUENTES', '13277753-5', 'Carolina', 'DIEZ NORTE 2314', 'TALCA', '964452706', 'logisticasieterobles@gmail.com')
ON CONFLICT (rut) DO NOTHING;

-- Insert real conductores (drivers) data
-- Data source: pasted-text-t2fMd.txt (293 drivers)
-- Truncate old data first
DELETE FROM conductores WHERE TRUE;

INSERT INTO conductores (rut, nombre, rut_proveedor, proveedor, patente_tracto) VALUES
('18012757-7', 'Ruben Marchant Needhan', '77653071-9', '4Vial SPA', 'XW7026'),
('10907750-K', 'Adolfo Gonzalez Meza', '76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', 'FWKB83'),
('12879880-3', 'Juan Manuel Vargas Jerve', '76956797-6', 'AEROCAV SPA', 'RVSD35'),
('16181677-9', 'Aldo Bustamante Ortega', '16181677-9', 'Aldo Antonio Bustamante Ortega', 'CHTV35'),
('12481902-4', 'Ambrosio Casanova Naavarrete', '76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', 'HWRC63'),
('13277753-5', 'Patricio Aurelio Rivas Puentes', '78101236-K', 'Logística Siete Robles Spa', 'JSHK45'),
('8825579-8', 'JOSE DAVID ESPINOZA CASTRO', '78032949-1', 'CLASSIC TRUCK TRANSPORT SPA', 'GXVX71'),
('7486285-3', 'Pedro Rafael Mozo Espina', '77243323-9', 'Comercio, Servicios Y Transportes Mozó Spa', 'CTHX29'),
('12671737-7', 'Cristian Mauricio Jimenez Reyes', '12671737-7', 'Cristian Mauricio Jimenez Reyes', 'BDTJ59'),
('17461633-7', 'Anibal Gregorich Vergara Miranda', '77083269-1', 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', 'ZN3559')
ON CONFLICT (rut) DO NOTHING;
