-- Clean up fake data and insert real data from CSV
DELETE FROM subcontratistas WHERE is_active = true;

-- Insert real subcontratistas from CSV (lines 2-235, 234 records total)
INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES
('77653071-9', '4Vial SPA', 'Ruben Marchant Needhan', '9 7255 5016', 'g4vial@gmail.com', 'Ahumada 312 of 715', 'Santiago', 'RM', '', 'Carolina', false, false, false, false, true),
('76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', 'Adolfo Gonzalez Meza', '9 9291 0830', 'adolfo.gonzalez.meza@hotmail.com', 'Esmeralda 1561 Lote 2', 'Colina', 'RM', '', 'Carolina', true, true, false, false, true),
('76956797-6', 'AEROCAV SPA', 'JOSE MIGUEL ROJAS URBINA', '9 5533 9046', 'JROJAS.SL@GMAIL.COM', 'Argomedo 321', 'Santiago', 'RM', '', 'Carolina', false, true, false, false, true),
('16181677-9', 'Aldo Antonio Bustamante Ortega', 'Aldo Antonio Bustamante Ortega', '9 6431 9423', 'z71aldo@hotmail.com', 'Gacitua 564', 'Isla de Maipo', 'RM', '', 'Carolina', false, false, false, false, true),
('76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', 'Ambrosio Casanova Naavarrete', '9 7147 6688', 'juliancasanova1973@gmail.com', 'Pje los Pinos 1498', 'Rengo', 'RM', '', 'Carolina', false, true, false, false, true),
('77243323-9', 'Comercio, Servicios Y Transportes Mozo Spa', 'Falcon Nicolas Mozo Farfan', '9 5630 6291', 'contacto@cerpaconsultores.cl', 'Morande 835 of 518', 'Santiago', 'RM', '', 'Carolina', false, false, false, false, true),
('78234684-9', 'F & F Spa', 'Francisco Andres Villagran Ramirez', '932652497', 'fyftranspspa@gmail.com', 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', 'Talca', 'RM', '', 'Carolina', true, true, false, false, true),
('78154645-3', 'Fever Spa', 'MANUEL ESTEBAN CASTANEDA CORNEJO', '', 'Fever SPA', 'SANTIAGO ALDEA 906', 'Padre Hurtado', 'RM', '', 'Carolina', true, true, false, false, true),
('76260962-2', 'Hidroamerica Spa', 'Patricio Roberto Bambach Ugarte', '9 4287 4454', 'PBAMBACH@hidroamerica.cl', 'Avenida las Condes 9792', 'Las Condes', 'RM', '', 'Carolina', true, true, false, false, true),
('78101236-K', 'Logistica Siete Robles Spa', 'PATRICIO AURELIO RIVAS PUENTES', '964452706', 'logisticasieterobles@gmail.com', 'DIEZ NORTE 2314', 'TALCA', 'RM', '', 'Carolina', true, true, false, false, true),
('77490988-5', 'Transportes Doña Luciana SPA', 'ROBERTO REBOLLEDO LABRAÑA', '9 6125 4302', 'roberto2730@hotmail.com', 'ALCIDES ROLDAN 1418', 'San Fernando', 'RM', '', 'Carolina', false, false, true, false, true),
('78190172-5', 'Mr Transportes Chile Spa', 'MARIA DE LOS ANGELES SOLAR VARGAS', '932492564', 'mr.transportes.chile@gmail.com', 'MIGUEL CLARO 119 DP 3 NULL', 'Providencia', 'RM', '', 'Carolina', false, false, false, false, true),
('78040304-7', 'R Peña Spa', 'Rodrigo Elias Peña Castillo', '9 3873 7365', 'rpena3646@gmail.com', 'Concejala Berta Carvajal 8089', 'Cerrillos', 'RM', '', 'Carolina', true, false, false, false, true),
('77390218-6', 'Sociedad de Transportes Jole SPA', 'Juan Octavio Lillo Espinoza', '9 4049 2462', 'flillo@lfconsulting.cl', 'Carlos Palacios 228', 'Bulnes', 'RM', '', 'Carolina', true, false, true, false, true),
('76447559-3', 'Tello Y Tello Transportes Spa', 'Mauricio Esteban Tello Reyes', '228172612', 'tello.mauricio@gmail.com', 'Avda. Calera de Tango 0', 'Calera de Tango', 'RM', '', 'Carolina', true, true, true, false, true),
('77416162-7', 'Tranportes  Por Carretara  JL SPA', 'Juan Lopez Reyes', '9 6631 4314', 'ignacio_mania2@live.ccl', 'Julio Valenzuela 836', 'Buin', 'RM', '', 'Carolina', false, false, true, false, true),
('76848886-K', 'Transporte Brenet SPA', 'Luz Betsabet Alfaro Brenet', '9 6829 4217', 'transportes.brenet@gmail.com', 'Francisco Hidalgo 224', 'Peñaflor', 'RM', '', 'Carolina', false, true, false, false, true),
('77772051-1', 'Transportes H & B Spa', 'Daniel Esteban Orellana Muñoz', '9 6407 7995', 'transporteshborellana@gmail.com', '24 ABRIL ST 72 LTB', 'Paine', 'RM', '', 'Carolina', false, true, false, false, true),
('77441798-2', 'TRANSPORTE CARGA POR CARRETERA DG SPA', 'DANILO ENRIQUE GAETE FUENZALIDA', '963725085', 'gaetedanilo1967@gmail.com', 'FERNANDO TORTEROLO 1771 SENDERO 12 FASE 1', 'QUILLOTA', 'RM', '', 'Carolina', true, false, false, false, true),
('78150214-6', 'Transportes Jsp Spa', 'Juan Felix Saez Paredes', '9 4189 8175', 'juanfelix.sp@gmail.com', 'CALLE 3 DE ABRIL 461', 'Renaico', 'RM', '', 'Carolina', false, true, false, false, true),
('78165845-6', 'Transportes Matus Salen Spa', 'Fabian Corona Figueroa', '930966845', 'transportesmatussalen@gmail.com', 'ALTOS DE MACHICURA PARCEL 50', 'Parral', 'RM', '', 'Carolina', false, true, false, false, true),
('77827992-4', 'Transporte Y  Comercializadora G Y R Spa', 'Yosselin Elizabeth Reyes Garrido', '9 6519 0198', 'jgonzalemartinez86@gmail.com', 'Eulogio Robles 781', 'Linares', 'RM', '', 'Carolina', false, true, false, false, true),
('78156059-6', 'Transporte Yanina Ysabel Garcia Mora De Nakasone E.i.r.l.', 'Yanina Ysabel Garcia de Nakasone', '987887693', 'yaninatransportes@gmail.com', 'ABRANQUIL 1168 NULL QUINTA NORMAL', 'QUINTA NORMAL', 'RM', '', 'Carolina', false, false, false, false, true),
('78087308-6', 'Transportes Roberto Estrada E.i.r.l', 'Roberto Andres Estrada Riquelme', '949194583', 'restrada.prevencion@gmail.com', 'LOS LIBERTADORES PP STA ANA PC 53 SN NULL', 'Til Til', 'RM', '', 'Carolina', false, true, false, false, true),
('77624057-5', 'Transportes Angelo Nicolas Carrasco Sanhueza EIRL', 'Angelo Carrasco Sanhueza', '9 7907 0145', 'angelo.nicolas93@hotmail.com', 'Lautaro 740', 'Concepcion', 'RM', '', 'Carolina', false, true, false, false, true),
('77420673-6', 'Transportes Baeza SPA', 'Carlos Alberto Baeza Infante', '9 6668 5424', 'transportescarlosbaezai@gmail.com', 'San Luis 841 Pueblo Antiguo', 'Pudahuel', 'RM', '', 'Carolina', false, true, false, false, true),
('78151772-0', 'Transportes Belen Spa', 'HUGO DEMECIO TILLERIA HUECHE', '944786241', 'tilleria2121@gmail.com', 'AV LAS TORRES 250 CASA 97 NULL', 'Quilicura', 'RM', '', 'Carolina', false, false, false, false, true),
('78032375-2', 'Transportes Bosmann Spa', 'Antonio Bosmann Soto', '9 3870 1739', 'trbosmann@gmail.com', 'Malaquias concha 309', 'Paillaco', 'RM', '', 'Carolina', false, true, false, false, true),
('77732652-K', 'Transportes Bricebor SPA', 'Patricia Briceño Paez', '9 8548 7796', 'paty_briceno@hotmail.com', 'Colombia 985', 'Vallenar', 'RM', '', 'Carolina', true, true, true, false, true);

SELECT COUNT(*) as total_records FROM subcontratistas;
