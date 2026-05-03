-- Large dataset import (235+ companies)
-- This script imports the additional transport companies from the comprehensive dataset

INSERT INTO public.companies (id, rut, name, representative, email, phone, address, region, password_hash, is_labbe_admin)
VALUES
('c-77653071-9', '77653071-9', '4Vial SPA', 'Ruben Marchant Needhan', 'g4vial@gmail.com', '9 7255 5016', 'Ahumada 312 of 715', 'Santiago', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76461213-2', '76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', 'Adolfo Gonzalez Meza', 'adolfo.gonzalez.meza@hotmail.com', '9 9291 0830', 'Esmeralda 1561 Lote 2', 'Colina', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76956797-6', '76956797-6', 'AEROCAV SPA', 'JOSE MIGUEL ROJAS URBINA', 'jrojas.sl@gmail.com', '9 5533 9046', 'Argomedo 321', 'Santiago', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-16181677-9', '16181677-9', 'Aldo Antonio Bustamante Ortega', 'Aldo Antonio Bustamante Ortega', 'z71aldo@hotmail.com', '9 6431 9423', 'Gacitua 564', 'Isla de Maipo', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76463195-1', '76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', 'Ambrosio Casanova Naavarrete', 'juliancasanova1973@gmail.com', '9 7147 6688', 'Pje los Pinos 1498', 'Rengo', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77243323-9', '77243323-9', 'Comercio, Servicios Y Transportes Mozó Spa', 'Falcon Nicolas Mozo Farfan', 'contacto@cerpaconsultores.cl', '9 5630 6291', 'Morande 835 of 518', 'Santiago', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78234684-9', '78234684-9', 'F & F Spa', 'Francisco Andres Villagran Ramirez', 'fyftranspspa@gmail.com', '932652497', 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', 'Talca', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78154645-3', '78154645-3', 'Fever Spa', 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', 'fever.transportes@gmail.com', '', 'SANTIAGO ALDEA 906', 'Padre Hurtado', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76260962-2', '76260962-2', 'Hidroamerica Spa', 'Patricio Roberto Bambach Ugarte', 'pbambach@hidroamerica.cl', '9 4287 4454', 'Avenida las Condes 9792', 'Las Condes', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78101236-K', '78101236-K', 'Logística Siete Robles Spa', 'PATRICIO AURELIO RIVAS PUENTES', 'logisticasieterobles@gmail.com', '964452706', 'DIEZ NORTE 2314', 'TALCA', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77490988-5', '77490988-5', 'Transportes Doña Luciana SPA', 'ROBERTO REBOLLEDO LABRAÑA', 'roberto2730@hotmail.com', '9 6125 4302', 'ALCIDES ROLDAN 1418', 'San Fernando', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78190172-5', '78190172-5', 'Mr Transportes Chile Spa', 'MARIA DE LOS ANGELES SOLAR VARGAS', 'mr.transportes.chile@gmail.com', '932492564', 'MIGUEL CLARO 119 DP 3', 'Providencia', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78040304-7', '78040304-7', 'R Peña Spa', 'Rodrigo Elias Peña Castillo', 'rpena3646@gmail.com', '9 3873 7365', 'Concejala Berta Carvajal 8089', 'Cerrillos', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77390218-6', '77390218-6', 'Sociedad de Transportes Jole SPA', 'Juan Octavio Lillo Espinoza', 'flillo@lfconsulting.cl', '9 4049 2462', 'Carlos Palacios 228', 'Bulnes', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76447559-3', '76447559-3', 'Tello Y Tello Transportes Spa', 'Mauricio Esteban Tello Reyes', 'tello.mauricio@gmail.com', '228172612', 'Avda. Calera de Tango 0', 'Calera de Tango', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77416162-7', '77416162-7', 'Tranportes Por Carretara JL SPA', 'Juan Lopez Reyes', 'ignacio_mania2@live.ccl', '9 6631 4314', 'Julio Valenzuela 836', 'Buin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-76848886-K', '76848886-K', 'Transporte Brenet SPA', 'Luz Betsabet Alfaro Brenet', 'transportes.brenet@gmail.com', '9 6829 4217', 'Francisco Hidalgo 224', 'Peñaflor', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77772051-1', '77772051-1', 'Transportes H & B Spa', 'Daniel Esteban Orellana Muñoz', 'transporteshborellana@gmail.com', '9 6407 7995', '24 ABRIL ST 72 LTB', 'Paine', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-77441798-2', '77441798-2', 'TRANSPORTE CARGA POR CARRETERA DG SPA', 'DANILO ENRIQUE GAETE FUENZALIDA', 'gaetedanilo1967@gmail.com', '963725085', 'FERNANDO TORTEROLO 1771 SENDERO 12 FASE 1', 'QUILLOTA', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false),
('c-78150214-6', '78150214-6', 'Transportes Jsp Spa', 'Juan Felix Saez Paredes', 'juanfelix.sp@gmail.com', '9 4189 8175', 'CALLE 3 DE ABRIL 461', 'Renaico', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1l.', false)
ON CONFLICT (rut) DO NOTHING;
