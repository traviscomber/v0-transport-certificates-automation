-- Insertar Transportes Labbe como admin
INSERT INTO companies (rut, name, representative, email, phone, address, region, password_hash, is_labbe_admin) VALUES
('76853071-9', 'Transportes Labbe SpA', 'Transportes Labbe - Admin', 'admin@transporteslabbe.cl', '600000000', 'Oficina Central', 'Santiago', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', true)
ON CONFLICT (rut) DO NOTHING;

-- Importar empresas adicionales de la segunda imagen (Carolina region)
INSERT INTO companies (rut, name, representative, email, phone, address, region, password_hash, is_labbe_admin) VALUES
('17635371-9', '4Vial SPA', 'Ruben Marchant Neerdhan', 'cecilia@transporteslabbe.cl', '92755016', 'Ahumada 312 of 715', 'Santiago', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7640121-2', 'Adagio Del Carmen Gonzalez Meza Transporte De Carga E I.R.L', 'Adolfo Gonzalez Meza', 'cecilia@transporteslabbe.cl', '9' 2893285', 'Hernandez 1854 Lote 2', 'Colina', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7505879-6', 'AEROCAY SPA', 'JOSE MIGUEL ROJAS URBINA', 'cecilia@transporteslabbe.cl', '9553046', 'Argomedo 321', 'Santiago', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('16181677-9', 'Aido Transportes Bustamante Ortega', 'Aido Antonio Bustamante Ortega', 'cecilia@transporteslabbe.cl', '9643823', 'Claudio 56', 'Isla de Maipú', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('8463195-1', 'Ambrosio Julian Casanova Navarrette Transporte De Carga E.I.R.L', 'Ambrosio Casanova Navarrete', 'cecilia@transporteslabbe.cl', '9147668', 'Pje Los Pinos 1498', 'Rengo', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7724333-3', 'Comercio Servicios Y Transporte Nico Spa', 'Falcon Nicolas Mozo Farfan', 'cecilia@transporteslabbe.cl', '9560408', 'Avenida 835 of 518', 'Santiago', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('18324684-9', 'F & F Spa', 'Francisco Andres Villagran Ramirez', 'cecilia@transporteslabbe.cl', '9326549', 'HUUELA N2/n LOTE- 2 PUERTAS NEGRAS', 'Talca', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7315465-3', 'Fever Spa', 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', 'cecilia@transporteslabbe.cl', '9319067', 'SANTIAGO ALEE 306', 'Padre Hurta', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7620690-2', 'Hidrocarrera Spa', 'Patricio Roberto Bambach Ugarte', 'cecilia@transporteslabbe.cl', '9701984', 'Avenida las Condes 8792', 'Las Condes', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7310125-K', 'Logistica Sima Roche Spa', 'PATRICIO AURELIO RIVAS PUENTES', 'cecilia@transporteslabbe.cl', '9327735', 'PJE NORTE 2314', 'TALCA', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7490988-5', 'Transportes Dorotea Luciana SPA', 'ROBERTO REBOOLLEDO LUBARANA', 'cecilia@transporteslabbe.cl', '9698068', 'ALCIDES ROLDAN 1418', 'San Fernanc', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7819017-5', 'Mr Transportes Qme Spa', 'MARIA DE LOS ANGELES SOLAR VARGAS', 'cecilia@transporteslabbe.cl', '9374122', 'MIGUEL CLARO 1197 0 NULL', 'Providencia', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('9804304-7', 'R Peña Son Transportes Jolie SPA', 'Rodrigo Elias Peña Castillo', 'cecilia@transporteslabbe.cl', '9769903', 'Concejala Berta Carvajal 8089', 'Cerrillos', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7739018-6', 'Sociedad De Transportes Jolle SPA', 'Juan Octavio Jolle Espinoza', 'cecilia@transporteslabbe.cl', '9035625', 'Calico Petrazco 228', 'Buines', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('8647259-3', 'Tello Y Tello Transportes Spa', 'Mauricio Esteban Tello Reyes', 'cecilia@transporteslabbe.cl', '21817262', 'Calera de Tango 0', 'Calera de T', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7416162-7', 'Transportes Por Carretera A 1574', 'Juan Lopez Reyes', 'cecilia@transporteslabbe.cl', '9186092', 'Julio Valenzuelo 836', 'Buin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('8848886-k', 'Transporte Brenet SPA', 'Luz Betsabet Alfaro Brenet', 'cecilia@transporteslabbe.cl', '9621119', 'Francisco Hidalgo 224', 'Peñaflor', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7777205-1', 'Transportes Dr R Spa', 'Daniel Esteban Orellano Muñoz', 'cecilia@transporteslabbe.cl', '9602795', '24 ABRIL ST-72 LTD', 'Peñaflor', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7441788-2', 'TRANSPORTE CARGA POR CARRETERA OG SPA', 'DANILO ENRIQUE GAETE FUENZALIDA', 'cecilia@transporteslabbe.cl', '9637250', 'FERNANDO TORTEROLO 1771 SENDERO 12 FASE 1', 'GUILLOTA', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7815021-6', 'Transportes Jose Spa', 'Juan Felix Sez Paredes', 'cecilia@transporteslabbe.cl', '9188275', 'CALLE D JR PAN, 661', 'Renaco', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7185945-6', 'Transportes Matus Solar Spa', 'Fabian Corona Figueroa', 'cecilia@transporteslabbe.cl', '9509666', 'ALTOS DE MACHICURA PARCEL 50', 'Parral', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7782792-4', 'Transporte Y Comercializacion Gy R Spa', 'Yosabet Elizabetn Reyes Garrido', 'cecilia@transporteslabbe.cl', '9632588', 'Estacion Belea 781', 'Linares', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('9165059-6', 'Transporte Yanina Ysbael Garcia Moia De Nakasone E.I.R.L', 'Yanina Ysbael Garcia de Nakasone', 'cecilia@transporteslabbe.cl', '9878789', 'ABRANGUIL 1168 NULL QUINTA NOF', 'QUINTA NOF', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('17102045-f', 'Transportes Roberto Estrada Riquejme', 'Roberto Acides Estrada Riquejme', 'cecilia@transporteslabbe.cl', '9619881', 'LOS LIBERTADORES DE PTA LIMA PC 53 SN NULL', 'Til-Til', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7624057-5', 'Transporte Nicolas Carrasco Sanhueza EIRL', 'Angelo Carrasco Sanhueza', 'cecilia@transporteslabbe.cl', '9707015', 'Lautaro 740', 'Concepción', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false),
('7542067-8', 'Transportes Sandi Spa', 'Carlos Alberto Baeza Infante', 'cecilia@transporteslabbe.cl', '9666524', 'San Luis 841', 'Huechuraba', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3njPtVfOUom', false);

-- Continuar con más empresas...
