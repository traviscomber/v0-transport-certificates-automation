-- First add all missing transportistas from the complete list
INSERT INTO transportistas (rut, razon_social, nombre_fantasia, direccion, is_active)
SELECT DISTINCT 
  data.rut_proveedor,
  data.proveedor,
  data.proveedor,
  'Dirección' as direccion,
  true as is_active
FROM (
  SELECT '77653071-9' as rut_proveedor, '4Vial SPA' as proveedor UNION
  SELECT '76461213-2', 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.' UNION
  SELECT '76956797-6', 'AEROCAV SPA' UNION
  SELECT '16181677-9', 'Aldo Antonio Bustamante Ortega' UNION
  SELECT '76463195-1', 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.' UNION
  SELECT '78101236-K', 'Logística Siete Robles Spa' UNION
  SELECT '78032949-1', 'CLASSIC TRUCK TRANSPORT SPA' UNION
  SELECT '77243323-9', 'Comercio, Servicios Y Transportes Mozó Spa' UNION
  SELECT '12671737-7', 'Cristian Mauricio Jimenez Reyes' UNION
  SELECT '77083269-1', 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.' UNION
  SELECT '77150766-2', 'Empresa De Transportes Nico Abarca Spa' UNION
  SELECT '78234684-9', 'F & F Spa' UNION
  SELECT '7321424-6', 'Fernando del Carmen Araya Araya' UNION
  SELECT '78154645-3', 'Fever Spa' UNION
  SELECT '76260962-2', 'Hidroamerica Spa' UNION
  SELECT '77590685-5', 'Hisan Spa' UNION
  SELECT '76901231-1', 'inversiones  Allende Limitada' UNION
  SELECT '78174616-9', 'Jjb Transportes Spa' UNION
  SELECT '77058007-2', 'Jose Antonio Puebla  Quezada  Spa' UNION
  SELECT '76494991-9', 'Transportes Carlos Marcelo Rebolledo Rojas Eirl' UNION
  SELECT '77536347-9', 'Transportes Chocobar Spa' UNION
  SELECT '7092038-7', 'Mario Fernando Urbina San Juan' UNION
  SELECT '78190172-5', 'Mr Transportes Chile Spa' UNION
  SELECT '77929313-0', 'NAVARRETE SANCHEZ SPA' UNION
  SELECT '78040304-7', 'R Peña Spa' UNION
  SELECT '77548896-4', 'SERVICIO DE TRANSPORTE B Y B SPA' UNION
  SELECT '77115061-6', 'SERVICIOS GENERALES Y COMERCIALES KEVIN SPA' UNION
  SELECT '76685344-7', 'Sociedad De Transportes Baguales Spa' UNION
  SELECT '77390218-6', 'Sociedad de Transportes Jole SPA' UNION
  SELECT '77007552-1', 'Sociedad De Transportes Km Limitada' UNION
  SELECT '76285729-4', 'Sociedad De Transportes Quintanilla Ltda.' UNION
  SELECT '78029819-7', 'Transportes Doble Jj Spa' UNION
  SELECT '76491308-6', 'Sociedad De Transportes Y Servicios Moreno Y Lopez Limitada' UNION
  SELECT '76447559-3', 'Tello Y Tello Transportes Spa' UNION
  SELECT '78101306-4', 'Tmp Transportes Spa' UNION
  SELECT '77416162-7', 'Tranportes  Por Carretara  JL SPA' UNION
  SELECT '76878075-7', 'Translainer SPA' UNION
  SELECT '76848886-K', 'Transporte Brenet SPA' UNION
  SELECT '78350942-3', 'Transporte Brimarc Spa' UNION
  SELECT '77441798-2', 'TRANSPORTE CARGA POR CARRETERA DG SPA' UNION
  SELECT '76819041-0', 'Transporte Daniela Fernandez Buosi EIRL' UNION
  SELECT '77143848-2', 'Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.' UNION
  SELECT '77772051-1', 'Transportes H & B Spa' UNION
  SELECT '77085832-1', 'Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez Muñoz E.i.r' UNION
  SELECT '76303728-2', 'Transporte De Carga Por Carretera Juan Carlos Araya Rodriguez Eirl' UNION
  SELECT '76902431-K', 'Transporte De Carga Por Carretera Rudy David Mora Morales Eirl' UNION
  SELECT '77856341-K', 'Transporte De Carga Raul Erasmo Chandia  Zuñiga E.i.r.l.' UNION
  SELECT '78150214-6', 'Transportes Jsp Spa' UNION
  SELECT '78099101-1', 'Transporte Diego Galdame Spa' UNION
  SELECT '77502623-5', 'TRANSPORTE FRANCISCO OYANADEL RAMOS SPA' UNION
  SELECT '77941769-7', 'Transporte H&p Spa' UNION
  SELECT '78001651-5', 'TRANSPORTE J Y D VERDEJO SPA' UNION
  SELECT '78099333-2', 'Transporte Js Spa' UNION
  SELECT '77709716-4', 'Transporte Mapirito Spa' UNION
  SELECT '77505286-4', 'Transporte Matisaurio Spa' UNION
  SELECT '77496396-0', 'Transporte Nelson Rodomir Sepulveda E.i.r.l.' UNION
  SELECT '78208706-1', 'Transporte Roberto Lopez H. E.i.r.l.' UNION
  SELECT '77642747-0', 'Transporte Santa Elena Spa' UNION
  SELECT '77920451-0', 'TRANSPORTES Y LOGISTICA SERPA SPA' UNION
  SELECT '76851961-7', 'Transporte Y Arriendo De Camion Pablo Cesar Silva San Martin Spa' UNION
  SELECT '78156059-6', 'Transporte Yanina Ysabel Garcia Mora De Nakasone E.i.r.l.' UNION
  SELECT '77863057-5', 'TRANSPORTES   DANIEL ALEJANDRO SEPULVEDA NEGRON E.I.R.L' UNION
  SELECT '77844986-2', 'TRANSPORTES  HAKUNA MATATA  SPA' UNION
  SELECT '77742801-2', 'transportes  y logistica  jose mariano  benitiz  vega spa' UNION
  SELECT '77941272-5', 'TRANSPORTES ALFER SPA' UNION
  SELECT '78365117-3', 'Transportes Almendra Y Roco Spa' UNION
  SELECT '77204205-1', 'Transportes Amal Spa' UNION
  SELECT '76390125-4', 'Transportes Andres Lisandro Ramirez Tapia Eirl' UNION
  SELECT '77624057-5', 'Transportes Angelo Nicolas Carrasco Sanhueza EIRL' UNION
  SELECT '77974457-4', 'Transportes Arlette Spa' UNION
  SELECT '78043729-4', 'Transportes Arma Spa' UNION
  SELECT '77560099-3', 'Transportes Arnoldo Carrasco Spa' UNION
  SELECT '77420673-6', 'Transportes Baeza SPA' UNION
  SELECT '78310166-1', 'Transportes Beeweis Spa' UNION
  SELECT '78151772-0', 'Transportes Belen Spa' UNION
  SELECT '78032375-2', 'Transportes Bosmann Spa' UNION
  SELECT '78350787-0', 'Transportes Br Spa' UNION
  SELECT '78099193-3', 'Transportes Yuyo Spa' UNION
  SELECT '77647991-8', 'Transportes Bryan Dinamarca Castillo E.i.r.l.' UNION
  SELECT '77625968-3', 'Transportes Cale SPA' UNION
  SELECT '77664223-1', 'Transportes Cardenas  Limitada' UNION
  SELECT '77374557-9', 'Transportes Carlos  González Loyola E.i.r.l.' UNION
  SELECT '77890332-6', 'Transportes Carlos Castillo Miñano E.i.r.l.' UNION
  SELECT '77492287-3', 'Lar Spa' UNION
  SELECT '76826483-K', 'Transportes Carlos Rene Cornejo Molina E.i.r.l.' UNION
  SELECT '77435776-9', 'Transporte De Carga Jose Rodrigo Burgos Muñoz E.i.r.l.' UNION
  SELECT '78129079-3', 'Transporte De Carga Venegas Y Otro Limitada' UNION
  SELECT '78132030-7', 'Transportes Claudio Painequeo E.i.r.l.' UNION
  SELECT '77373865-3', 'Transportes Claudio Vilogron Paredes E.i.r.l.' UNION
  SELECT '77489241-9', 'Transportes Cruz Spa' UNION
  SELECT '77724297-0', 'TRANSPORTES CORDINI SPA' UNION
  SELECT '77656577-6', 'Transportes Cristina Aguirre Spa' UNION
  SELECT '77225235-8', 'TRANSPORTES CRUC SPA' UNION
  SELECT '77943651-9', 'Transportes Cs Spa' UNION
  SELECT '78180641-2', 'Transportes Dancris Spa' UNION
  SELECT '77927983-9', 'TRANSPORTES DE CARGA   MARCELA PATRICIA CAMACHO CAMACHO E.I.R.L' UNION
  SELECT '77569357-6', 'Transportes De Carga  Cya  Spa' UNION
  SELECT '77965304-8', 'Transportes De Carga Hernan Segundo Cabrera Avila E.i.r.l' UNION
  SELECT '76518447-9', 'Transportes De Carga Jocelyn Carolina Silva Rojas Eirl' UNION
  SELECT '76987117-9', 'Transportes De Carga Magaly Rocio Añorga Huerta E.i.r.l.' UNION
  SELECT '77827992-4', 'Transporte Y  Comercializadora G Y R Spa' UNION
  SELECT '77401369-5', 'Transportes Domingo Alberto Cerda Lagos E.i.r.l.' UNION
  SELECT '78364854-7', 'Transportes Don Augusto Spa' UNION
  SELECT '77443906-4', 'Transportes Donatelo Spa' UNION
  SELECT '77490988-5', 'Transportes Doña Luciana SPA' UNION
  SELECT '77411735-0', 'Transportes Edol Spa' UNION
  SELECT '76977185-9', 'Transportes Eduardo Alarcon Empresa Individual De Responsabilidad Li' UNION
  SELECT '77808136-9', 'Transportes Emimaxi Spa' UNION
  SELECT '77377507-9', 'Transportes Eric Darat E.i.r.l.' UNION
  SELECT '77852371-K', 'Transportes Escalona Spa' UNION
  SELECT '78089406-7', 'Transportes Evem Spa' UNION
  SELECT '77849029-3', 'Transportes Expresso Ignacio Spa' UNION
  SELECT '77401233-8', 'Transportes Felipe Andres Rex Villalobos E.i.r.l.' UNION
  SELECT '77822803-3', 'TRANSPORTES FELIPE ANDRÉS SARRIA JIMÉNEZ E.I.R.L.' UNION
  SELECT '77375352-0', 'Transportes Fernando Darat Candia E.i.r.l.' UNION
  SELECT '76994334-K', 'Transportes Fernando Patricio Valdes Silva Eirl' UNION
  SELECT '77032978-7', 'TRANSPORTES FLOR VALLADARES SPA' UNION
  SELECT '77919212-1', 'Transportes Franco Spa' UNION
  SELECT '78027318-6', 'TRANSPORTES GERMAN EDUARDO PARDO ANTIHUAL E.I.R.L' UNION
  SELECT '78273793-7', 'Transportes Gianlucca Vitto Limitada' UNION
  SELECT '76904819-7', 'Transportes Gonzalo Eduardo Araya Aguilar Eirl' UNION
  SELECT '77400529-3', 'Transportes Miguel Angel Sepulveda Verdugo Spa' UNION
  SELECT '76748766-5', 'Transportes Hector Galaz E.i.r.l.' UNION
  SELECT '78261292-1', 'Transportes Igm Spa' UNION
  SELECT '78100599-1', 'Transportes Milady Spa' UNION
  SELECT '77349385-5', 'Transportes Inma Spa' UNION
  SELECT '78179126-1', 'Transportes Isacon Spa' UNION
  SELECT '77624569-0', 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL' UNION
  SELECT '77499811-K', 'Transportes Jahdiel Spa' UNION
  SELECT '77495891-6', 'TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L' UNION
  SELECT '78283626-9', 'Transportes Jkarimv Spa' UNION
  SELECT '78244173-6', 'Transportes Jme Spa' UNION
  SELECT '76304483-1', 'Transportes Jose Luis Ubilla Mendoza Eirl' UNION
  SELECT '77377829-9', 'TRANSPORTES JOSE MIGUEL ALARCON SpA' UNION
  SELECT '76842089-0', 'Transportes Jose Rodolfo Vasquez Balboa Empresa Individual De Responsa' UNION
  SELECT '78057959-5', 'Transportes Jota Castillo Spa' UNION
  SELECT '77503624-9', 'Transportes Jrm E Hijos Limitada' UNION
  SELECT '77848908-2', 'TRANSPORTES WALDO SALDAÑO E.I.R.L.' UNION
  SELECT '77992492-0', 'TRANSPORTES JUAN AGUILAR VALENZUELA EIRL' UNION
  SELECT '76808332-0', 'Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons' UNION
  SELECT '76903711-K', 'Transportes Jyr Spa' UNION
  SELECT '77949497-7', 'TRANSPORTES KAISER SPA' UNION
  SELECT '78351383-8', 'Transportes L.y. R Spa' UNION
  SELECT '78295206-4', 'Transportes Lara Spa' UNION
  SELECT '76507104-6', 'TRANSPORTES LOS ALAMOS LIMITADA' UNION
  SELECT '77381623-9', 'Transportes Luchito Spa' UNION
  SELECT '77488785-7', 'Transportes Luis Araya Lazo E.i.r.l.' UNION
  SELECT '77113814-4', 'Transportes Luis Eduardo Cruz Perez EIRL' UNION
  SELECT '77913183-1', 'TRANSPORTES LUIS IGNACIO CABRERA VERA E.I.R.L.' UNION
  SELECT '77382964-0', 'Transportes Luis Ignacio Urrutia Tiznado E.i.r.l.' UNION
  SELECT '78255926-5', 'Transportes Luis Walter Jimenez Sepulveda E.i.r.l.' UNION
  SELECT '78301223-5', 'Transportes Lvs Spa' UNION
  SELECT '76812672-0', 'Transportes M/r Limitada' UNION
  SELECT '77889348-7', 'Transportes Mad Spa' UNION
  SELECT '78178719-1', 'Transportes Magnate Spa' UNION
  SELECT '77389829-4', 'Transportes Manuel  Perez Vilches E.i.r.l.' UNION
  SELECT '77222214-9', 'Transportes Marco Antonio Gatica Moreno Spa' UNION
  SELECT '78165845-6', 'Transportes Matus Salen Spa' UNION
  SELECT '78069053-4', 'Transportes Mauricio Arroyo E.i.r.l.' UNION
  SELECT '77732652-K', 'Transportes Bricebor SPA' UNION
  SELECT '77672752-0', 'Transportes Mauricio Lastra Azocar E.i.r.l' UNION
  SELECT '78113086-9', 'Transportes Maxsu Limitada' UNION
  SELECT '77566202-6', 'Transportes Mc Spa' UNION
  SELECT '77408422-3', 'Transportes Mejias Spa' UNION
  SELECT '77531127-4', 'TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L' UNION
  SELECT '77547318-5', 'Transportes Ignacio Burgos E.i.r.l.' UNION
  SELECT '77998655-1', 'TRANSPORTES MIGUEL JESUS URIBE COCA E.I.R.L' UNION
  SELECT '78125401-0', 'Transportes Miranda Y Bravo Limitada' UNION
  SELECT '78242685-0', 'Transportes Rc Spa' UNION
  SELECT '78003531-5', 'Transportes Morales Castillo Spa' UNION
  SELECT '77896328-0', 'Transportes Ms Spa' UNION
  SELECT '77480102-2', 'Transportes Myt Spa' UNION
  SELECT '76891488-5', 'Transportes Myz Spa' UNION
  SELECT '77417801-5', 'Transportes Naranjo´s Spa' UNION
  SELECT '78157982-3', 'Transportes Navarro Spa' UNION
  SELECT '77392988-2', 'Transportes Nibaldo Araya Eirl' UNION
  SELECT '77377291-6', 'Transportes Nicolas Spa' UNION
  SELECT '78295014-2', 'Transportes Nino Spa' UNION
  SELECT '77986483-9', 'TRANSPORTES OPTIMUM SPA' UNION
  SELECT '77387969-9', 'Transportes Orlando Del Carmen Mendez Gutierrez Eirl' UNION
  SELECT '76843705-K', 'Transportes Pablo Cesar Soto Cruz E.i.r.l.' UNION
  SELECT '78000781-8', 'TRANSPORTES PABLO PEREZ SPA' UNION
  SELECT '77993482-9', 'TRANSPORTES PAISOL SPA' UNION
  SELECT '77805935-5', 'Transportes Paola Garcia  Fredes E.i.r.l' UNION
  SELECT '77425212-6', 'Transportes Patricio Romo Moreno E.i.r.l.' UNION
  SELECT '77703639-4', 'Transportes Pecort Spa' UNION
  SELECT '77852474-0', 'TRANSPORTES PEDRO VILLAGRAN E.I.R.L.' UNION
  SELECT '78365485-7', 'Transportes Ql Spa' UNION
  SELECT '77394975-1', 'Transportes Raul Marcelo Soto Bobadilla E.i.r.l.' UNION
  SELECT '77848888-4', 'Celin Spa' UNION
  SELECT '77287076-0', 'Transportes Rene Ernesto Quiroz Rosales E.i.r.l.' UNION
  SELECT '77692211-0', 'Transportes Renee Bastias P E Hijos Spa' UNION
  SELECT '77509381-1', 'Transportes Reyes Quintero SPA' UNION
  SELECT '77843013-4', 'TRANSPORTES RICHARD AGUILERA CONTRERAS E.R.I.L' UNION
  SELECT '77117558-9', 'Transportes Ro Spa' UNION
  SELECT '78087308-6', 'Transportes Roberto Estrada E.i.r.l' UNION
  SELECT '77413603-7', 'Transportes Rodmac Spa' UNION
  SELECT '77119982-8', 'Transportes Rodrigo Esteban Rojas Araya EIRL' UNION
  SELECT '77110277-8', 'Transportes Santa Rafaela Spa' UNION
  SELECT '77357401-4', 'Transportes Sebastian Exequiel Garcia Martini Empresa Individual De Re' UNION
  SELECT '77893331-4', 'TRANSPORTES SERGIO SIMONCELLI E.I.R.L' UNION
  SELECT '77640206-0', 'Transportes Sin Fronteras SPA' UNION
  SELECT '77325414-1', 'Transportes Suyai Spa' UNION
  SELECT '77273263-5', 'Transportes Taurus Spa' UNION
  SELECT '77698453-1', 'Transportes Trans Adroc Spa' UNION
  SELECT '76970026-9', 'TRANSPORTES TRANS-LYON SPA' UNION
  SELECT '78296208-6', 'Transportes Venaur  Spa' UNION
  SELECT '78259175-4', 'Transportes Verpo Spa' UNION
  SELECT '77713918-5', 'Transportes Victoria Spa' UNION
  SELECT '77982752-6', 'Transportes Villegas Y Villegas Spa' UNION
  SELECT '78303894-3', 'Transportes Chachy Spa' UNION
  SELECT '77926368-1', 'TRANSPORTES WEREK SPA' UNION
  SELECT '77892137-5', 'TRANSPORTES WHITE EXPRESS SPA' UNION
  SELECT '77383694-9', 'Transportes Wilson Antonio Cabello Reyes Eirl' UNION
  SELECT '77436503-6', 'Transportes Mj E Hijos Spa' UNION
  SELECT '77931594-0', 'Transportes Y Servicios Fs Spa' UNION
  SELECT '78115034-7', 'Transportes Y Servicios Jenavama Spa' UNION
  SELECT '78293071-0', 'Transportes Zura Spa' UNION
  SELECT '78207782-1', 'Transportes   M&f Spa' UNION
  SELECT '77369887-2', 'TRANSSAMY SPA' UNION
  SELECT '76937652-6', 'Trasportes Claudio Ortega Spa' UNION
  SELECT '78019868-0', 'Ubilla Transportes Spa' UNION
  SELECT '10534518-6', 'Veronica Yolanda Silva Atenas' UNION
  SELECT '12044190-6', 'Victor Marcel Jimenez Reyes' UNION
  SELECT '77806154-6', 'ZF TRANSPORTES SPA'
) AS data
WHERE NOT EXISTS (
  SELECT 1 FROM transportistas WHERE transportistas.rut = data.rut_proveedor
)
ON CONFLICT (rut) DO NOTHING;

-- Now insert all 292 conductores from the complete list
INSERT INTO conductores (rut, nombres, apellido_paterno, rut_proveedor, transportista_id, is_active)
SELECT 
  data.rut,
  data.nombres,
  data.apellido_paterno,
  data.rut_proveedor,
  (SELECT id FROM transportistas WHERE LOWER(rut) = LOWER(data.rut_proveedor) LIMIT 1),
  true
FROM (
  SELECT '18012757-7' as rut, 'Ruben' as nombres, 'Marchant Needhan' as apellido_paterno, '77653071-9' as rut_proveedor UNION
  SELECT '10907750-K', 'Adolfo', 'Gonzalez Meza', '76461213-2' UNION
  SELECT '12879880-3', 'Juan Manuel', 'Vargas Jerve', '76956797-6' UNION
  SELECT '16181677-9', 'Aldo', 'Bustamante Ortega', '16181677-9' UNION
  SELECT '12481902-4', 'Ambrosio', 'Casanova Naavarrete', '76463195-1' UNION
  SELECT '13277753-5', 'Patricio Aurelio', 'Rivas Puentes', '78101236-K' UNION
  SELECT '8825579-8', 'JOSE DAVID', 'ESPINOZA CASTRO', '78032949-1' UNION
  SELECT '7486285-3', 'Pedro Rafael', 'Mozo Espina', '77243323-9' UNION
  SELECT '12671737-7', 'Cristian Mauricio', 'Jimenez Reyes', '12671737-7' UNION
  SELECT '17461633-7', 'Anibal', 'Gregorich Vergara Miranda', '77083269-1' UNION
  SELECT '9875518-7', 'Luis Anibal', 'Vergara Cadiz', '77083269-1' UNION
  SELECT '12457226-6', 'Nelson Alejandro', 'Abarca Leiva', '77150766-2' UNION
  SELECT '26953476-1', 'Alexander Jose', 'Gonzalez Gil', '78234684-9' UNION
  SELECT '7321424-6', 'Fernando Del Carmen', 'Araya Araya', '7321424-6' UNION
  SELECT '14621104-6', 'Freddy Alexis', 'Mena Nuñez', '78154645-3' UNION
  SELECT '11607612-8', 'Jorge Antonio', 'Quintanilla Catalán', '76260962-2' UNION
  SELECT '7012984-1', 'Patricio Roberto', 'Bambach Ugarte', '76260962-2' UNION
  SELECT '13138612-5', 'Victor Rogelio', 'San Martin Campos', '77590685-5' UNION
  SELECT '16193591-3', 'Nibaldo Andres', 'Rossel Allende', '76901231-1' UNION
  SELECT '17512443-8', 'Luis Alejandro', 'Rodriguez Gallardo', '78174616-9' UNION
  SELECT '11838643-4', 'Felipe Antonio', 'Gonzalez Molina', '77058007-2' UNION
  SELECT '11990292-4', 'Jose Antonio', 'Puebla Quezada', '77058007-2' UNION
  SELECT '10071434-5', 'Julio Nelson', 'Aguilera Diaz', '77058007-2' UNION
  SELECT '12472735-9', 'Sergio Alejandro', 'Faundez Mancilla', '77058007-2' UNION
  SELECT '10242490-5', 'Carlos Marcelo', 'Rebolledo Rojas', '76494991-9' UNION
  SELECT '10147115-2', 'Wilson Hernan', 'Chocobar Gonzalez', '77536347-9' UNION
  SELECT '7092038-7', 'Mario Fernando', 'Urbina San Juan', '7092038-7' UNION
  SELECT '15947526-3', 'Rodolfo Valentin', 'Orellana Serrano', '78190172-5' UNION
  SELECT '11185990-6', 'Manuel Modesto', 'Navarrete Valdebenito', '77929313-0' UNION
  SELECT '17690903-K', 'Rodrigo Elias', 'Peña Castillo', '78040304-7' UNION
  SELECT '17449523-8', 'Víctor Rodolfo', 'Basoalto Tapia', '77548896-4' UNION
  SELECT '13835882-8', 'Javier Ramon', 'Fuenzalida Almuna', '77115061-6' UNION
  SELECT '6639764-5', 'Arturo Alejandro', 'Herrera Giadala', '76685344-7' UNION
  SELECT '10573425-5', 'Juan Octavio', 'Lillo Espinoza', '77390218-6' UNION
  SELECT '12995031-5', 'Ivan Arturo', 'Cuevas Gatica', '77007552-1' UNION
  SELECT '13353956-5', 'Luis Hernan', 'Iturriaga Barahona', '77007552-1' UNION
  SELECT '18748311-5', 'Bryan Andres', 'Retamales Gallardo', '76285729-4' UNION
  SELECT '15533220-4', 'Israel Ariel', 'Pradenas Piñeiro', '78029819-7' UNION
  SELECT '9744124-3', 'Juan Alonso', 'Quintanilla Catalan', '76285729-4' UNION
  SELECT '19428444-6', 'Michelle Jacob', 'Retamales Gallardo', '76285729-4' UNION
  SELECT '12676471-5', 'Miguel Angel', 'Ortiz Romero', '76285729-4' UNION
  SELECT '7919871-4', 'Victor Arsenio', 'Rojas Gutierrez', '76285729-4' UNION
  SELECT '6388956-3', 'Leonardo Antonio', 'Moreno Medina', '76491308-6' UNION
  SELECT '11434690-K', 'Luis Patricio', 'Tello Reyes', '76447559-3' UNION
  SELECT '19548402-3', 'Matias Braulio', 'Baez Pacheco', '76447559-3' UNION
  SELECT '9795683-9', 'Oscar Custodio', 'Verdugo Quintanilla', '76447559-3' UNION
  SELECT '19733547-5', 'Alfredo Nicolas', 'Hidalgo Aravena', '78101306-4' UNION
  SELECT '18364099-2', 'Juan', 'Lopez Reyes', '77416162-7' UNION
  SELECT '19022717-0', 'Yerko Alberto', 'Meza Vidal', '76878075-7' UNION
  SELECT '13465548-8', 'Carlos', 'Miranda Diaz', '76848886-K' UNION
  SELECT '14126191-6', 'Eduardo Enrique', 'Brito Leiva', '78350942-3' UNION
  SELECT '10529089-6', 'Danilo Enrique', 'Gaete Fuenzalida', '77441798-2' UNION
  SELECT '16747931-6', 'Emilio Wladimir', 'Martinez Simoncelli', '76819041-0' UNION
  SELECT '18662721-0', 'Enzo', 'Francescolli Villalobos Simoncelli', '76819041-0' UNION
  SELECT '16669891-K', 'Elvis Antonio', 'Bravo Gonzalez', '77143848-2' UNION
  SELECT '14154431-4', 'Hector Fernando', 'Gonzalez Leyton', '77143848-2' UNION
  SELECT '13049990-2', 'Sergio Albino', 'Jerez Duran', '77143848-2' UNION
  SELECT '17590791-2', 'Daniel Esteban', 'Orellana Muñoz', '77772051-1' UNION
  SELECT '15401975-8', 'Hernan Osvaldo', 'Gutierrez Munoz', '77085832-1' UNION
  SELECT '14285398-1', 'Luis Rodrigo', 'Cabrera Jofre', '77085832-1' UNION
  SELECT '13465290-K', 'Orlando Alfonso', 'Reveco Calabriano', '77085832-1' UNION
  SELECT '9271706-2', 'Juan Carlos', 'Araya Rodriguez', '76303728-2' UNION
  SELECT '10866252-2', 'Antonio Renan', 'Wolpi Saldias', '76902431-K' UNION
  SELECT '14445738-2', 'Borys Johan', 'Luna Hurtado', '76902431-K' UNION
  SELECT '11947260-1', 'Juan Andres', 'Astorga Aros', '76902431-K' UNION
  SELECT '13152123-5', 'Rodolfo Rodrigo', 'Huenchullán Mardones', '76902431-K' UNION
  SELECT '13269446-K', 'Raul Erasmo', 'Chandia Zuñiga', '77856341-K' UNION
  SELECT '11966473-K', 'Juan Felix', 'Saez Paredes', '78150214-6' UNION
  SELECT '19723478-4', 'Diego Dilan', 'Galdame Gutierrez', '78099101-1' UNION
  SELECT '11618935-6', 'Francisco Javier', 'Oyanadel Ramos', '77502623-5' UNION
  SELECT '18617130-6', 'Hector Hernan', 'Parra Jara', '77941769-7' UNION
  SELECT '17610706-5', 'DIEGO MAURICIO', 'VERDEJO ROBLES', '78001651-5' UNION
  SELECT '11665170-K', 'Juan Rodolfo', 'Soto Zuñiga', '78099333-2' UNION
  SELECT '26599183-1', 'Rodolfo Jose', 'Nunez Blanco', '77709716-4' UNION
  SELECT '19851132-3', 'Matias Jose', 'Rubio Galaz', '77505286-4' UNION
  SELECT '11567390-4', 'Sepulveda', 'Nelson', '77496396-0' UNION
  SELECT '12083320-0', 'Roberto Alonso', 'Lopez Hernandez', '78208706-1' UNION
  SELECT '17853819-5', 'Juan Luis', 'Amaya Albornoz', '77642747-0' UNION
  SELECT '16515307-3', 'Cristian Felipe', 'Medina Albornoz', '77920451-0' UNION
  SELECT '15169825-5', 'Pablo Cesar', 'Silva San Martin', '76851961-7' UNION
  SELECT '22518660-K', 'Jose David', 'Nakasone Deza', '78156059-6' UNION
  SELECT '7445306-6', 'Daniel Alejandro', 'Sepulveda Pastene', '77863057-5' UNION
  SELECT '27704167-7', 'Anderson Alberto', 'Aguas Acosta', '77844986-2' UNION
  SELECT '10511943-7', 'Jose Mariano', 'Benitiz Vega', '77742801-2' UNION
  SELECT '18348389-7', 'Eric Ivan', 'Mendoza Cid', '77941272-5' UNION
  SELECT '8769209-4', 'Hugolino Oscar', 'D''Apremont Fuentes', '78365117-3' UNION
  SELECT '23642784-6', 'Ariel Martin', 'Ameijeira', '77204205-1' UNION
  SELECT '7954905-3', 'Andres Lisandro', 'Ramirez Tapia', '76390125-4' UNION
  SELECT '18388473-5', 'Angelo', 'Carrasco Sanhueza', '77624057-5' UNION
  SELECT '17381973-0', 'Jaime Ismael', 'Astroza Rodríguez', '77974457-4' UNION
  SELECT '26942243-2', 'Alexander Jefrey', 'Espiritu Santana', '78043729-4' UNION
  SELECT '17352242-8', 'Santiago Ignacio', 'Palma Avila', '77560099-3' UNION
  SELECT '15713508-2', 'Sergio HernÁn', 'Vera Duarte', '77560099-3' UNION
  SELECT '11971405-2', 'Carlos Alberto', 'Baeza Infante', '77420673-6' UNION
  SELECT '17109499-2', 'Sebastian Patricio', 'Hernandez Beweis', '78310166-1' UNION
  SELECT '16585579-5', 'Hugo Demecio', 'Tilleria Hueche', '78151772-0' UNION
  SELECT '20016670-1', 'Antonio Nicolas', 'Bosmann Soto', '78032375-2' UNION
  SELECT '16114446-0', 'Felipe Eduardo', 'Martinez Solar', '78350787-0' UNION
  SELECT '18345406-4', 'Raul Abraham', 'Peña Calabrano', '78099193-3' UNION
  SELECT '19347747-K', 'Bryan Willian', 'Dinamarca Castillo', '77647991-8' UNION
  SELECT '16443919-4', 'Ramon Antonio', 'Perez Michea', '77647991-8' UNION
  SELECT '17794905-1', 'Hugo', 'Nuñez Toro', '77625968-3' UNION
  SELECT '15701835-3', 'Cristopher Fernando', 'Loyola Pinto', '77664223-1' UNION
  SELECT '24334657-6', 'Oscar', 'Cardenas Rojas', '77664223-1' UNION
  SELECT '9348715-K', 'Carlos Alberto', 'Gonzalez Loyola', '77374557-9' UNION
  SELECT '14682246-0', 'Carlos Alberto', 'Castillo Miñano', '77890332-6' UNION
  SELECT '15790079-K', 'Juan Leandro', 'Riveros Godoy', '77890332-6' UNION
  SELECT '25477804-4', 'Luis Angel', 'Rodriguez Chacon', '77492287-3' UNION
  SELECT '7479565-K', 'Carlos Rene', 'Cornejo Molina', '76826483-K' UNION
  SELECT '15201366-3', 'Jose Rodrigo', 'Burgos Muñoz', '77435776-9' UNION
  SELECT '13131472-8', 'Fernando Antonio', 'Venegas Sandoval', '78129079-3' UNION
  SELECT '13498752-9', 'Claudio Alejandro', 'Painequeo Concha', '78132030-7' UNION
  SELECT '11412638-1', 'Claudio Antonio Dionisio', 'Vilogron Paredes', '77373865-3' UNION
  SELECT '18497643-9', 'Jonathan Reinaldo', 'Cordini Beltran', '77724297-0' UNION
  SELECT '13665163-3', 'Pablo Danilo', 'Briones Briones', '77656577-6' UNION
  SELECT '9380195-4', 'Claudio Robinson', 'Urzua Cifuentes', '77225235-8' UNION
  SELECT '16125137-2', 'Eduardo Felipe', 'Cruz Molina', '77489241-9' UNION
  SELECT '16568610-1', 'Fernando Jesus', 'Celis Gutierrez', '77943651-9' UNION
  SELECT '10583929-4', 'Cristian Emilio', 'Hidalgo Yanten', '78180641-2' UNION
  SELECT '14343223-8', 'Victor Hugo', 'Barahona Gomez', '77927983-9' UNION
  SELECT '20125037-4', 'Eric Alesander', 'Carrera Muñoz', '77569357-6' UNION
  SELECT '19533779-9', 'Kevin Alexander', 'Roldan Alegria', '77569357-6' UNION
  SELECT '12369186-5', 'Hernan Segundo', 'Cabrera Avila', '77965304-8' UNION
  SELECT '22504079-6', 'Joaquin Marcos', 'Quispe Maguina', '76518447-9' UNION
  SELECT '18537453-K', 'Ricardo Antonio', 'Sepulveda Briones', '76518447-9' UNION
  SELECT '22451330-5', 'Oscar Horacio', 'Uchasara Choque', '76987117-9' UNION
  SELECT '16274214-0', 'Carlos Alejandro', 'Gonzalez Martinez', '77827992-4' UNION
  SELECT '9957590-5', 'Domingo Cerda', 'Lagos', '77401369-5' UNION
  SELECT '18653683-5', 'Italo Ramiro', 'Suazo Torres', '78364854-7' UNION
  SELECT '16572863-7', 'Juan Segundo', 'Muñoz Bustos', '77443906-4' UNION
  SELECT '16973068-7', 'Roberto Rebolledo', 'Labrana', '77490988-5' UNION
  SELECT '18000462-9', 'Eduardo Ignacio', 'Olguin Lopez', '77411735-0' UNION
  SELECT '8596994-3', 'Eduardo Benjamin', 'Alarcon Espinoza', '76977185-9' UNION
  SELECT '17925492-1', 'Abraham Ismael', 'Zapata Contreras', '77808136-9' UNION
  SELECT '9802602-9', 'Eric Henry', 'Darat Ramirez', '77377507-9' UNION
  SELECT '14094120-4', 'Erwin Rodrigo', 'Rubio Urra', '77852371-K' UNION
  SELECT '16186315-7', 'Guillermo Andres', 'Diaz Gallegos', '78089406-7' UNION
  SELECT '18633909-6', 'Pablo Ignacio', 'Figueroa Plaza', '77849029-3' UNION
  SELECT '15931343-3', 'Cristian  Alejandro', 'Vergara Tapia', '77401233-8' UNION
  SELECT '16667244-9', 'Felipe Andres', 'Rex Villalobos', '77401233-8' UNION
  SELECT '15633374-3', 'Felipe Sarria', 'Jimenez', '77822803-3' UNION
  SELECT '12785037-2', 'Fernando Edinson', 'Darat Candia', '77375352-0' UNION
  SELECT '14159332-3', 'Cristian Vega', 'Barahona', '76994334-K' UNION
  SELECT '11271462-6', 'Andrés Marcelo', 'Santos Fuentes', '77032978-7' UNION
  SELECT '18877641-8', 'Alejandro Javier', 'Soto Morales', '77919212-1' UNION
  SELECT '16670983-0', 'German Eduardo', 'Pardo Antihual', '78027318-6' UNION
  SELECT '18537552-8', 'Nicolas Andres', 'Muñoz Diaz', '78273793-7' UNION
  SELECT '8515118-5', 'Claudio Hernan', 'Acevedo Seguel', '76904819-7' UNION
  SELECT '12627398-3', 'Gabriel Andres', 'Araya Aguilar', '76904819-7' UNION
  SELECT '17143468-8', 'Juan  Andres', 'Herrera  Lagos', '76904819-7' UNION
  SELECT '10516965-5', 'Miguel Angel', 'Sepulveda  Verdugo', '77400529-3' UNION
  SELECT '16492697-4', 'Fernando Horacio', 'Galaz Contreras', '76748766-5' UNION
  SELECT '13568803-7', 'Hector Antonio', 'Galaz Contreras', '76748766-5' UNION
  SELECT '18525551-4', 'Matias Alexi', 'Ortiz Castillo', '78261292-1' UNION
  SELECT '12967316-8', 'Cesar Augusto', 'Romero Baez', '78100599-1' UNION
  SELECT '15148994-K', 'Miguel Luis', 'Infante Zambrano', '77349385-5' UNION
  SELECT '17231344-2', 'Isaac Rafael', 'Iturrieta Año', '78179126-1' UNION
  SELECT '12920772-8', 'Ivan Diaz', 'Rivas', '77624569-0' UNION
  SELECT '17393582-K', 'Luis Alfonso', 'Guerrero Díaz', '77624569-0' UNION
  SELECT '19371373-4', 'Jose Ignacio', 'Mendoza Cid', '77941312-8' UNION
  SELECT '12022695-9', 'Marco Antonio', 'Sanhueza Espino', '77499811-K' UNION
  SELECT '11801151-1', 'Jhon Chavarria', 'Muñoz', '77495891-6' UNION
  SELECT '18316251-9', 'Jamyr Ajmed', 'Karim Vargas', '78283626-9' UNION
  SELECT '18011702-4', 'John Francisco', 'Jofre Gomez', '78244173-6' UNION
  SELECT '9778154-0', 'Juan Carlos', 'Escobar Monsalve', '76304483-1' UNION
  SELECT '11534975-9', 'Jose Miguel', 'Alarcon Aguilera', '77377829-9' UNION
  SELECT '18342814-4', 'Jose Luis', 'Vasquez Solar', '76842089-0' UNION
  SELECT '10254247-9', 'Jose Rodolfo', 'Vasquez Balboa', '76842089-0' UNION
  SELECT '12794947-6', 'Jose Felix', 'Castillo Oyarzo', '78057959-5' UNION
  SELECT '24118167-7', 'Jhon Sebastian', 'Quiroga Esparza', '78165268-7' UNION
  SELECT '17041135-8', 'Jonathan David', 'Rodriguez Vargas', '77503624-9' UNION
  SELECT '18144334-0', 'Marcelo Antonio', 'Sandoval Balboa', '77503624-9' UNION
  SELECT '11836287-K', 'Waldo Agustin', 'Saldaño Baez', '77848908-2' UNION
  SELECT '12393328-1', 'Juan  German', 'Aguilar Valenzuela', '77992492-0' UNION
  SELECT '15838826-K', 'Alfredo Andres', 'Berna Gajardo', '76808332-0' UNION
  SELECT '8163261-8', 'Gabriel Guillermo', 'Vargas Plaza', '76808332-0' UNION
  SELECT '10631473-K', 'Juan Manuel', 'Sarralde Aravena', '76808332-0' UNION
  SELECT '8662822-8', 'Luis Hernan', 'Jara Gonzalez', '76903711-K' UNION
  SELECT '6947243-5', 'Hector Rodrigo', 'Garcia Quintana', '77949497-7' UNION
  SELECT '9921513-5', 'Juan Carlos', 'Lopez Diaz', '78351383-8' UNION
  SELECT '19422493-1', 'Alan Gabriel', 'Lara Ubilla', '78295206-4' UNION
  SELECT '16262510-1', 'Cristobal Glem', 'Vidal Neira', '76507104-6' UNION
  SELECT '12141459-7', 'Rafael Eduardo', 'Vidal Chavarria', '77381623-9' UNION
  SELECT '17979506-K', 'Luis Enrique', 'Araya Lazo', '77488785-7' UNION
  SELECT '18960151-4', 'JOSÉ EDUARDO', 'CRUZ GONZÁLEZ', '77113814-4' UNION
  SELECT '19241866-6', 'Luis Ignacio', 'Cabrera Vera', '77913183-1' UNION
  SELECT '10190528-4', 'Luis Ignacio', 'Urrutia Tiznado', '77382964-0' UNION
  SELECT '12097721-0', 'Luis Walter', 'Jimenez Sepulveda', '78255926-5' UNION
  SELECT '11963927-1', 'Oscar Antonio', 'Landero Vera', '78301223-5' UNION
  SELECT '14145864-7', 'Rodrigo Alexander', 'Muñoz Echeverria', '76812672-0' UNION
  SELECT '16285933-1', 'Hector Rene', 'Ortiz Gonzalez', '77889348-7' UNION
  SELECT '21935683-8', 'Bastian Elias', 'Urrutia Gavilán', '78178719-1' UNION
  SELECT '16536523-2', 'Camilo Eduardo', 'Urrutia Retamal', '78178719-1' UNION
  SELECT '9770990-4', 'Manuel Natalio', 'Pérez Vilches', '77389829-4' UNION
  SELECT '17168357-2', 'Bruno  Ernesto', 'Alcantara  Henriquez', '77222214-9' UNION
  SELECT '13839392-5', 'Fernando  Andres', 'Huenchul  Zambrano', '77222214-9' UNION
  SELECT '26148843-4', 'Jhorney Alejandro', 'Quintero Prado', '77222214-9' UNION
  SELECT '10356240-6', 'Miguel Angel', 'Macias Macias', '77222214-9' UNION
  SELECT '11363580-0', 'Mario Enrique', 'Corona Madrid', '78165845-6' UNION
  SELECT '16121156-7', 'Jose Matias', 'Pino Cornejo', '78069053-4' UNION
  SELECT '12271447-0', 'Mauricio Alberto', 'Opazo Galloso', '78069053-4' UNION
  SELECT '8468759-6', 'Antonio Borquez', 'Varas', '77732652-K' UNION
  SELECT '17331983-5', 'Mauricio Eduardo', 'Lastra Azocar', '77672752-0' UNION
  SELECT '10697923-5', 'Roberto Eugenio', 'Suarez Lopez', '78113086-9' UNION
  SELECT '17937608-3', 'Jacky Lee', 'Lopez Neculman', '77566202-6' UNION
  SELECT '15398705-K', 'Luis Antonio', 'Valdenegro Navarro', '77566202-6' UNION
  SELECT '15868246-K', 'Marco Antonio', 'Rios Mejias', '77408422-3' UNION
  SELECT '19562294-9', 'Cristopher Matias', 'Muñoz Soto', '77531127-4' UNION
  SELECT '19026207-3', 'Giovanny Andres', 'Chandia  Caceres', '77531127-4' UNION
  SELECT '20532359-7', 'Josue Manuel', 'Diaz Espinoza', '77531127-4' UNION
  SELECT '18530382-9', 'Michell Alexander', 'Bravo Araya', '77531127-4' UNION
  SELECT '10842565-2', 'Ignacio Santiago', 'Burgos Alamos', '77547318-5' UNION
  SELECT '27446096-2', 'Miguel Jesus', 'Uribe Coca', '77998655-1' UNION
  SELECT '15107209-7', 'Mauricio Antonio', 'Arroyo Esfronceda', '78069053-4' UNION
  SELECT '10286272-4', 'Luis Fernando', 'Bravo Saldias', '78125401-0' UNION
  SELECT '16146554-2', 'Richard  Andres', 'Contreras Forton', '78242685-0' UNION
  SELECT '15493907-5', 'Juan Pablo', 'Morales Toloza', '78003531-5' UNION
  SELECT '17338237-5', 'Felipe Francisco', 'Miranda Amaya', '77896328-0' UNION
  SELECT '17166009-2', 'Moises Antonio', 'Muñoz Cerda', '77480102-2' UNION
  SELECT '16117345-2', 'Leonardo Andres', 'Sanhueza Valdes', '76891488-5' UNION
  SELECT '9807595-K', 'Oscar Martinez', 'Arriagada', '76891488-5' UNION
  SELECT '25598621-K', 'Wilder Alexander', 'Naranjo Zapata', '77417801-5' UNION
  SELECT '14046644-1', 'Pedro Enrique', 'Navarro Delgado', '78157982-3' UNION
  SELECT '9407328-6', 'Nibaldo Patricio', 'Araya Astorga', '77392988-2' UNION
  SELECT '9659299-K', 'Pedro Benjasmin', 'Soto Jara', '77377291-6' UNION
  SELECT '27364850-K', 'Nino Alvaro', 'Pinzas Julca', '78295014-2' UNION
  SELECT '18592248-0', 'Hugo Camilo', 'Olmos Vega', '78310280-3' UNION
  SELECT '16296370-8', 'Álvaro EfraÍn', 'Madrid Reyes', '77986483-9' UNION
  SELECT '10891710-5', 'Orlando Del Carmen', 'Mendez Gutierrez', '77387969-9' UNION
  SELECT '12869737-3', 'Pablo Cesar', 'Soto Cruz', '76843705-K' UNION
  SELECT '14467460-K', 'PABLO ANDRES', 'PEREZ URRUTIA', '78000781-8' UNION
  SELECT '16379465-9', 'ALVARO LORENZO', 'PAILLAN PALMA', '77993482-9' UNION
  SELECT '10813156-K', 'Daniel Hernan', 'Pacheco  Villacura', '77805935-5' UNION
  SELECT '9646548-3', 'Patricio Enrique', 'Romo Moreno', '77425212-6' UNION
  SELECT '10990624-7', 'Pedro Enrique', 'Cortes Rojas', '77703639-4' UNION
  SELECT '18670406-1', 'Pedro Sebastian', 'Villagran Saldias', '77852474-0' UNION
  SELECT '11114172-K', 'Segundo German', 'Punolaf Queupumil', '78232853-0' UNION
  SELECT '22504079-6', 'Joaquin Marcos', 'Quispe Maguina', '78365485-7' UNION
  SELECT '15392455-4', 'Raul Marcelo', 'Soto Bobadilla', '77394975-1' UNION
  SELECT '15213567-K', 'Hector Mario', 'Ceballos Gallegos', '77848888-4' UNION
  SELECT '13401728-7', 'Cuevas Gatica', 'Ariel Alejandro', '77287076-0' UNION
  SELECT '16682420-6', 'Luis Quiroz', 'Salazar', '77287076-0' UNION
  SELECT '13839705-K', 'Alexis Bladimir', 'Calfin Araya', '77692211-0' UNION
  SELECT '17429147-0', 'Alvaro Sebastian', 'Reyes Alfaro', '77509381-1' UNION
  SELECT '12924248-5', 'Richard Antonio', 'Aguilera Contreras', '77843013-4' UNION
  SELECT '27113827-K', 'Angel  Elias', 'Oberto  Serrano', '77117558-9' UNION
  SELECT '17102045-K', 'Roberto Andres', 'Estrada Riquelme', '78087308-6' UNION
  SELECT '8026404-6', 'Juan Carlos', 'Casanova Sanchez', '77413603-7' UNION
  SELECT '15957473-3', 'Rodrigo Esteban', 'Rojas Araya', '77119982-8' UNION
  SELECT '12509107-5', 'Alejandro Daniel', 'Iquilio Abarzua', '77016329-3' UNION
  SELECT '22329060-4', 'Cesar Augusto', 'Paz  Reyes', '77016329-3' UNION
  SELECT '13715309-2', 'Erik Hernan', 'Zuñiga Perez', '77016329-3' UNION
  SELECT '26390420-6', 'Jesus Efren', 'Angulo Calle', '77016329-3' UNION
  SELECT '8865083-2', 'Jorge Antonio', 'Boada Sepulveda', '77016329-3' UNION
  SELECT '22027038-6', 'Ruben Hernan', 'Silva Vasquez', '77016329-3' UNION
  SELECT '18512352-9', 'Esteban Ignacio', 'Villegas Letelier', '78302429-2' UNION
  SELECT '8189883-9', 'Juan Eduardo', 'Chandia Parra', '78302429-2' UNION
  SELECT '17932540-3', 'Lorenzo Eduardo', 'Chandia Salazar', '78302429-2' UNION
  SELECT '17900921-8', 'David Salomon', 'Sanchez Otarola', '77888835-1' UNION
  SELECT '19026744-K', 'Camilo Alejandro', 'Espinosa Navarro', '76285729-4' UNION
  SELECT '8942372-4', 'Samuel Marcelino', 'Vera Palma', '77110277-8' UNION
  SELECT '10623289-K', 'Marcelo Antonio', 'Barriga Contreras', '77357401-4' UNION
  SELECT '15931067-1', 'Sebastian Exequiel', 'Garcia Martini', '77357401-4' UNION
  SELECT '7077324-4', 'Sergio  Manuel', 'Simoncelii Rey', '77893331-4' UNION
  SELECT '21836416-0', 'Antony Jesus', 'Cosme  Ircanaupa', '77640206-0' UNION
  SELECT '18866252-8', 'Felipe Antonio', 'Castro Muñoz', '77325414-1' UNION
  SELECT '18633398-5', 'Jonathan Alfredo', 'Vergara Osorio', '77273263-5' UNION
  SELECT '16201301-7', 'Alejandro Andres', 'Calderon Figueroa', '77698453-1' UNION
  SELECT '9982464-6', 'Marcelo Eduardo', 'Leon Salvatierra', '76970026-9' UNION
  SELECT '24425491-8', 'Dario Hernan', 'Calderon Rodriguez', '78296208-6' UNION
  SELECT '15954550-4', 'Manuel Humberto', 'Poza Torres', '78259175-4' UNION
  SELECT '17468168-6', 'Francisco Adolfo', 'Chamorro Sobarzo', '77713918-5' UNION
  SELECT '20731894-9', 'Benjamin Eduardo', 'Cid Harcha', '77982752-6' UNION
  SELECT '20251681-5', 'Robinson Nicolas', 'Villegas Hernandez', '77982752-6' UNION
  SELECT '11142090-4', 'Dorian Gilberto', 'Jamett Maturana', '78303894-3' UNION
  SELECT '16935590-8', 'Rene Ignacio', 'Henriquez  Rivas', '77926368-1' UNION
  SELECT '22607329-9', 'Omar Christian', 'Perez Encinas', '77892137-5' UNION
  SELECT '15943194-0', 'Wilson Antonio', 'Cabello Reyes', '77383694-9' UNION
  SELECT '19034826-1', 'Pablo Ignacio', 'Escobedo Quintanilla', '77436503-6' UNION
  SELECT '14564017-2', 'Giovanne Isaac', 'Martinez Mella', '77931594-0' UNION
  SELECT '8461526-9', 'Malco Agabo', 'Cespedes Manquez', '78115034-7' UNION
  SELECT '12880784-5', 'Luis Eduardo', 'Perez Vargas', '77110277-8' UNION
  SELECT '12756249-0', 'Genaro Francisco', 'Zurita Hernandez', '78293071-0' UNION
  SELECT '13773888-0', 'Rodrigo Andres', 'Sarralde Diaz', '78207782-1' UNION
  SELECT '20077993-2', 'Francisco  Patricio', 'Valenzuela Barros', '77369887-2' UNION
  SELECT '17217685-2', 'Raul  Miguel', 'Panes  Lopez', '77369887-2' UNION
  SELECT '16809991-6', 'Claudio Ivan Eduardo', 'Ortega Escobar', '76937652-6' UNION
  SELECT '27132464-2', 'Angel Estiben', 'Zamora Gallego', '78019868-0' UNION
  SELECT '9609199-0', 'Luis Alberto', 'Silva Atenas', '10534518-6' UNION
  SELECT '12044190-6', 'Victor Marcel', 'Jimenez Reyes', '12044190-6' UNION
  SELECT '16275792-K', 'Eduardo Andres', 'Zuñiga Luengo', '77806154-6'
) AS data
ON CONFLICT (rut) DO NOTHING;

-- Final count
SELECT COUNT(*) as total_conductores FROM conductores;
