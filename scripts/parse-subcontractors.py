import sys

# Read the TSV data
data = """77653071-9	4Vial SPA	Ruben Marchant Needhan	18012757-7	Carolina	Ahumada 312 of 715	Santiago	9 7255 5016	g4vial@gmail.com				
76461213-2	Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.	Adolfo Gonzalez Meza	10907750-k	Carolina	Esmeralda 1561 Lote 2	Colina	9 9291 0830	adolfo.gonzalez.meza@hotmail.com	Ariztia	LTS		
76956797-6	AEROCAV SPA	JOSE MIGUEL ROJAS URBINA	25193295-6	Carolina	Argomedo 321	Santiago	9 5533 9046	JROJAS.SL@GMAIL.COM		LTS		
16181677-9	Aldo Antonio Bustamante Ortega	Aldo Antonio Bustamante Ortega	16181677-9	Carolina	Gacitua 564	Isla de Maipo	9 6431 9423	z71aldo@hotmail.com				
76463195-1	Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.	Ambrosio Casanova Naavarrete	12481902-4	Carolina	Pje los Pinos 1498	Rengo	9 7147 6688	juliancasanova1973@gmail.com		LTS		
77243323-9	Comercio, Servicios Y Transportes Mozó Spa	Falcon Nicolas Mozo Farfan	17191002-1	Carolina	Morande 835 of 518	Santiago	9 5630 6291	contacto@cerpaconsultores.cl				
78234684-9	F & F Spa	Francisco Andres Villagran Ramirez	17830498-4	Carolina	HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS	Talca	932652497	fyftranspspa@gmail.com	Ariztia	LTS		
78154645-3	Fever Spa	MANUEL ESTEBAN CASTAÑEDA CORNEJO	15337400-7	Carolina	SANTIAGO ALDEA 906	Padre Hurtado			Ariztia	LTS		
76260962-2	Hidroamerica Spa	Patricio Roberto Bambach Ugarte	7012984-1	Carolina	Avenida las Condes 9792	Las Condes	9 4287 4454	PBAMBACH@hidroamerica.cl	Ariztia	LTS		
78101236-K	LogÍstica Siete Robles Spa	PATRICIO AURELIO RIVAS PUENTES	13277753-5	Carolina	DIEZ NORTE 2314	TALCA	964452706	logisticasieterobles@gmail.com	Ariztia	LTS		
77490988-5	Transportes Doña Luciana SPA	ROBERTO REBOLLEDO LABRAÑA	16973068-7	Carolina	ALCIDES ROLDAN 1418	San Fernando	9 6125 4302	roberto2730@hotmail.com			Rendic	
78190172-5	Mr Transportes Chile Spa	MARIA DE LOS ANGELES SOLAR VARGAS	17341722-5	Carolina	MIGUEL CLARO 119 DP 3 NULL	Providencia	932492564	mr.transportes.chile@gmail.com				
78040304-7	R PeÑa Spa	Rodrigo Elias Peña Castillo	17690903-K	Carolina	Concejala Berta Carvajal 8089	Cerrillos	9 3873 7365	rpena3646@gmail.com	Ariztia			
77390218-6	Sociedad de Transportes Jole SPA	Juan Octavio Lillo Espinoza	10573425-5	Carolina	Carlos Palacios 228	Bulnes	9 4049 2462	flillo@lfconsulting.cl	Ariztia		Rendic	
76447559-3	Tello Y Tello Transportes Spa	Mauricio Esteban Tello Reyes	15402922-2	Carolina	Avda. Calera de Tango 0	Calera de Tango	228172612	tello.mauricio@gmail.com	Ariztia	LTS	Rendic	
77416162-7	Tranportes Por Carretara JL SPA	Juan Lopez Reyes	18364099-2	Carolina	Julio Valenzuela 836	Buin	9 6631 4314	ignacio_mania2@live.ccl			Rendic	
76848886-K	Transporte Brenet SPA	Luz Betsabet Alfaro Brenet	18623119-8	Carolina	Francisco Hidalgo 224	Peñaflor	9 6829 4217	transportes.brenet@gmail.com		LTS		
77772051-1	Transportes H & B Spa	Daniel Esteban Orellana Muñoz	17590791-2	Carolina	24 ABRIL ST 72 LTB	Paine	9 6407 7995	transporteshborellana@gmail.com		LTS		
77441798-2	TRANSPORTE CARGA POR CARRETERA DG SPA	DANILO ENRIQUE GAETE FUENZALIDA	10529089-6	Carolina	FERNANDO TORTEROLO 1771 SENDERO 12 FASE 1	QUILLOTA	963725085	gaetedanilo1967@gmail.com	Ariztia			
78150214-6	Transportes Jsp Spa	Juan Felix Saez Paredes	11966473-K	Carolina	CALLE 3 DE ABRIL 461	Renaico	9 4189 8175	juanfelix.sp@gmail.com		LTS		
78165845-6	Transportes Matus Salen Spa	Fabian Corona Figueroa	18402158-7	Carolina	ALTOS DE MACHICURA PARCEL 50	Parral	930966845	transportesmatussalen@gmail.com		LTS		
77827992-4	Transporte Y Comercializadora G Y R Spa	Yosselin Elizabeth Reyes Garrido	16274264-7	Carolina	Eulogio Robles 781	Linares	9 6519 0198	jgonzalemartinez86@gmail.com		LTS		
78156059-6	Transporte Yanina Ysabel Garcia Mora De Nakasone E.i.r.l.	Yanina Ysabel Garcia de Nakasone	22569415--k	Carolina	ABRANQUIL 1168 NULL QUINTA NORMAL	QUINTA NORMAL	987887693	yaninatransportes@gmail.com				
78087308-6	Transportes Roberto Estrada E.i.r.l	Roberto Andrés Estrada Riquelme	17102045-K	Carolina	LOS LIBERTADORES PP STA ANA PC 53 SN NULL	Til Til	949194583	restrada.prevencion@gmail.com		LTS		
77624057-5	Transportes Angelo Nicolas Carrasco Sanhueza EIRL	Angelo Carrasco Sanhueza	18388473-5	Carolina	Lautaro 740	Concepcion	9 7907 0145	angelo.nicolas93@hotmail.com		LTS		
77420673-6	Transportes Baeza SPA	Carlos Alberto Baeza Infante	11971405-2	Carolina	San Luis 841 Pueblo Antiguo	Pudahuel	9 6668 5424	transportescarlosbaezai@gmail.com		LTS		
78151772-0	Transportes Belen Spa	HUGO DEMECIO TILLERIA HUECHE	16585579-5	Carolina	AV LAS TORRES 250 CASA 97 NULL	Quilicura	944786241	tilleria2121@gmail.com				
78032375-2	Transportes Bosmann Spa	Antonio Bosmann Soto	20016670-1	Carolina	Malaquias concha 309	Paillaco	9 3870 1739	trbosmann@gmail.com		LTS		
77732652-K	Transportes Bricebor SPA	Patricia Briceño Paez	11508741-k	Carolina	Colombia 985	Vallenar	9 8548 7796	paty_briceno@hotmail.com	Ariztia	LTS	Rendic	
77647991-8	Transportes Bryan Dinamarca Castillo E.i.r.l.	Bryan Willian Dinamarca Castillo	19347747-K	Carolina	Parcela n 30 Lote A Gabriela Mistral	La Serena	9 4499 3574	transportebryandinamarca@gmail.com	Ariztia		Rendic	
77625968-3	Transportes Cale SPA	Hugo Nuñez Toro	17794905-1	Carolina	Villa los Castaños sitio 12	Curico	9 3769 6652	transportescale.22@gmail.com		LTS	Rendic	
77664223-1	Transportes Cardenas Limitada	Oscar Alberto Cardenas Rojas	24334657-6	Carolina	M Larrain 1154 BL 7 A DP Rolando Alarcon 0	Talagante	965132690	transcar2025ltda@gmail.com				
76494991-9	Transportes Carlos Marcelo Rebolledo Rojas Eirl	Carlos Marcelo Rebolledo Rojas	10242490-5	Carolina	Olegario Lazo 371	San Fernando	9 7498 0078	p_pereirah@hotmail.com	Ariztia	LTS		
77536347-9	Transportes Chocobar Spa	WILSON HERNAN CHOCOBAR VASQUEZ	16868967-5	Carolina	OSORNO 850 MZ 101 LT 19 TIERRAS BLANCAS	Coquimbo	966644778	yakko.j7@gmail.com		LTS	Rendic	
76518447-9	Transportes De Carga Jocelyn Carolina Silva Rojas Eirl	Jocelyn Carolina Silva Rojas	15404933-9	Carolina	Barrales 234	Melipilla	9 3243 4254	transportesacr@yahoo.com				
78029819-7	Transportes Doble Jj Spa	Israel Ariel Pradenas Piñeiro	15533220-4	Carolina	Jose Leyan 1228	Talagante	933638547	transportesdoblejj@gmail.com	Ariztia			
77401369-5	Transportes Domingo Alberto Cerda Lagos E.i.r.l.	Domingo Cerda Lagos	9957590-5	Carolina	Dr. Adan Henriquez S 03991	San Fernando	9 6607 6722	msoledadpavezf@gmail.com	Ariztia			
77822803-3	TRANSPORTES FELIPE ANDRÉS SARRIA JIMÉNEZ E.I.R.L.	FELIPE ANDRES SARRIA JIMENEZ	15633374-3	Carolina	AV. SAN LUIS 15 -- 76 CS 76 BARRIO EL ALBA 4	Lampa	930679958	felipe2925@gmail.com		LTS		
76994334-K	Transportes Fernando Patricio Valdes Silva Eirl	Fernando Patricio Valdes Silva	6448802-3	Carolina	Las Azucenas 1994	Santiago	9 4401 9637	transportesfernandovaldeseirl@gmail.com	Ariztia			
77624569-0	TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL	Ivan Diaz Rivas	12920772-8	Carolina	Avda Costanera 1174	San Pedro de la Paz	9 5188 8374	idiaz9252@gmail.com		LTS	Rendic	
77941312-8	TRANSPORTES J&F SPA	Daniel Esteban Orellana Muñoz	17590791-2	Carolina	24 de Abril St 72 lt b	Paine	9 6407 7995	transporteshborellana@gmail.com		LTS		
78244173-6	Transportes Jme Spa	John Francisco Jofre Gomez	18011702-4	Carolina	LOS FLAMENCOS 965 MEDIA HACIENDA NULL	Ovalle	975522197	johnfranci0511@gmail.com	Ariztia	LTS		
78165268-7	Transportes Jq Spa	Jhon Sebastian Quiroga Esparza	24118167-7	Carolina	PJE VALLE DEL SOL PNTE 2122 PQUE EL SOL NULL PADRE HURTADO	PADRE HURTADO	986292130	sebas.sparza@gmail.com	Ariztia			
77503624-9	Transportes Jrm E Hijos Limitada	Jimena Andrea Herminia Molinet Lillo	16405184-6	Carolina	Pje santa cruz 721, villa larqui	Bulnes	9 4068 4436	ximenamolinet.35@gmail.com		LTS	Rendic	Interpolar
78351383-8	Transportes L.y. R Spa	JUAN CARLOS LOPEZ DIAZ	9921513-5	Carolina	HERMANO DOMINGO 01485 HNOS DE LA SALLE NULL 01485	Puente alto	992788524	ignacio_mania2@live.cl	Ariztia			
77889348-7	Transportes Mad Spa	Hector Rene Ortiz Gonzalez	16285933-1	Carolina	PSJ LOS MANIOS 2022	TALCA	9 4967 1430	michel_jm@hotmail.cl	Ariztia	LTS		
78113086-9	Transportes Maxsu Limitada	ROBERTO EUGENIO SUAREZ LOPEZ	10697923-5	Carolina	LA ATAJADA 645 EL RODEO	HUECHURABA	941798421	Transportesmaxsu@gmail.com	Ariztia			
77531127-4	TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L	Michell Alexander Bravo Araya	18530382-9	Carolina	Casma 634	San Miguel	963739068	transportes.michell.bravo@gmail.com			Rendic	
77896328-0	Transportes Ms Spa	Felipe Francisco Miranda Amaya	17338237-5	Carolina	VOLCAN EL MIRADOR 189 SAN ENRIQUE	Quilicura	987301778	transportesms.1928@gmail.com				
76891488-5	Transportes Myz Spa	Oscar Martinez Arriagada	9807595-K	Carolina	San Antonio 385	Santiago	9 3122 9434	oscarmartinez.a@gmail.com				
78310280-3	Transportes Olmo Vega Spa	HUGO CAMILO OLMOS VEGA	18592248-0	Carolina	RIO COPIAPÓ 9558	Pudahuel	932248782	camiloolmos946@gmail.com				
78232853-0	Transportes Punolaf Lopez Spa	Segundo German Punolaf Queupumil	11114172-K	Carolina	AGUSTINAS 1442 DP 402 NULL	Santiago	947542370	Punolafgerman55@gmail.com	Ariztia			
77287076-0	Transportes Rene Ernesto Quiroz Rosales E.i.r.l.	Rene Ernesto Quiroz Rosales	11607319-6	Carolina	Lucero del Alba St48 V	Calera de Tango	9 4221 3307	renequirozcamionero@gmail.com				
77016329-3	Transportes Ruben Hernan Silva Vasquez E.i.r.l	Ruben Hernan Silva Vasquez	22027038-6	Carolina	Monjitas 550	Santiago	936170659	silvarubem600@gmail.com				
77893331-4	TRANSPORTES SERGIO SIMONCELLI E.I.R.L	Sergio Manuel Simoncelii Rey	7077324-4	Carolina	Gran Avenida 4697 depto 1614	San Miguel	9 5402 9356	transportescvalencia@gmail.com	Ariztia			
77325414-1	Transportes Suyai Spa	NICOLE CAROLINA CASTRO MUNOZ	18669080-K	Carolina	SOFIA CARMONA 051 DP 401 G SOFIA TRES G 401	La Granja	963936326	transportes.suyai.chile@gmail.com				
76970026-9	TRANSPORTES TRANS-LYON SPA	Marcelo Eduardo LeÓn Salvatierra	9982464-6	Carolina	Caleta Buena 9413, Campo Verde	La Florida	9 5715 8438	edubeo@gmail.com	Ariztia		Rendic	
78259175-4	Transportes Verpo Spa	Manuel Humberto Poza Torres	15954550-4	Carolina	4 NORTE 265 C 195	San Pedro de la paz	979366530	poza2102@gmail.com		LTS		
77926368-1	TRANSPORTES WEREK SPA	Rene Ignacio Henriquez Rivas	16935590-8	Carolina	Psje los Manios 2022, Barrio la Foresta	Talca	9 4967 1430	michel_jm@hotmail.cl		LTS		
77920451-0	TRANSPORTES Y LOGISTICA SERPA SPA	Sergio Antonio Figueroa Pinochet	14608934-8	Carolina	Mario Bahamonde 7865	San Pedro de la Paz	9 4612 2105	paula.bucarey.o@gmail.com		LTS		
78099193-3	Transportes Yuyo Spa	Raul Abraham Pena Calabrano	18345406-4	Carolina	Pje Pasadena 1000 MZ 2 LT 3	Los Angeles	9 2746 8487	raul.ap.c1993@gmail.com		LTS		
77806154-6	ZF TRANSPORTES SPA	Eduardo Andres Zuñiga Luengo	16275792-K	Carolina	San Antonio Lt2 a	Linares	9 8475 8779	edu223andres@gmail.com	Ariztia	LTS		
78032949-1	CLASSIC TRUCK TRANSPORT SPA	JOSE DAVID ESPINOZA CASTRO	8825579-8	Cecilia	CAMINO PAINE LONQUEN 4837 ST 1 -B LT D BUIN	Santiago	938937758	jose4837@gmailcom				
7321424-6	Fernando del Carmen Araya Araya	Fernando Del Carmen Araya Araya	7321424-6	Cecilia	Lago Ranco N°734 Villa Los Lagos	Panguipulli	947458117	macasf06@hotmailcom				
77492287-3	Lar Spa	Luis Angel Rodriguez Chacon	25477804-4	Cecilia	Pasaje Chonos 1376	Conchalí	959411152	luaro58@outlookcom				
77007552-1	Sociedad De Transportes Km Limitada	Luis Hernan Iturriaga Barahona	13353956-5	Cecilia	Corregidor de Calca 1116 Pedro de Oña	Isla De Maipo	959411152	claxel1970@hotmailcom				
76491308-6	Sociedad De Transportes Y Servicios Moreno Y Lopez Limitada	Leonardo Antonio Moreno Medina	6388956-3	Cecilia	Pasaje Parque Los Ciprece 2841, Nueva Vida	Alto Hospicio	993316895	leonardo_antonio24@hotmailcom		LTS		
77435776-9	Transporte De Carga Jose Rodrigo Burgos Muñoz E.i.r.l.	Jose Rodrigo Burgos Muñoz	15201366-3	Cecilia	La Estrella 1070	Pudahuel	977100258	joroburgos@hotmailcom			Rendic	
76303728-2	Transporte De Carga Por Carretera Juan Carlos Araya Rodriguez Eirl	Juan Carlos Araya Rodriguez	9271706-2	Cecilia	Avda Jorge Giacaman N°122, Villa San Ramon Palomares	Lampa	962186221	transportesdyh@gmail.com				Interpolar
76902431-k	Transporte De Carga Por Carretera Rudy David Mora Morales Eirl	Rudy David Mora Morales	9959005-K	Cecilia	Las Carabelas # 2002 Villa 5° Centenario	Mariquina	950754064	rudymoram@gmailcom		LTS	Rendic	
77856341-K	Transporte De Carga Raul Erasmo Chandia Zuñiga E.i.r.l.	Raul Erasmo Chandia Zuñiga	13269446-K	Cecilia	Roto Chileno Sitio N 19 Dpto 2 Villa 3	Talagante	930165437	chandicar@gmailcom				
78129079-3	Transporte De Carga Venegas Y Otro Limitada	Fernando Antonio Venegas Sandoval	13131472-8	Cecilia	CALLEJÓN BUSTAMANTE 000 SECTOR LAS CHILCAS	Chillan	959167179	fernando.venegas13@gmail.com				
77502623-5	TRANSPORTE FRANCISCO OYANADEL RAMOS SPA	Francisco Javier Oyanadel Ramos	11618935-6	Cecilia	PJE FLOR DEL COBRE 5344 LA FLORIDA ETAPA IV	La Serena	973957367	oyanadeljavier54@gmail.com	Ariztia		Rendic	
78001651-5	TRANSPORTE J Y D VERDEJO SPA	DIEGO MAURICIO VERDEJO ROBLES	17610706-5	Cecilia	RIGOLEMO 00 MALLOA	Malloa	940231167	diegoverdejorobles@gmailcom		LTS		
78099333-2	Transporte Js Spa	Juan Rodolfo Soto Zuñiga	11665170-K	Cecilia	Davila Rodriiguez Lote 2 Los Marcos San Francisco De Mostazal	San FcoMostazal	964898367	juan_soto5050@hotmailcom				
77505286-4	Transporte Matisaurio Spa	Matias Jose Rubio Galaz	19851132-3	Cecilia	Lt 4 De St Pp San Juan La Hacienda Olivar	Olivar	989397322	transportesmatisaurio@gmailcom	Ariztia			
77496396-0	Transporte Nelson Rodomir Sepulveda E.i.r.l.	Sepulveda Nelson	11567390-4	Cecilia	Nuevos Campos 8850 Lta 2 Silos De Tunca Graneros	Graneros	944064878	nelson.rodomir.sepulveda@gmail.com				
77642747-0	Transporte Santa Elena Spa	Juan Bautista Amaya Figueroa	9551388-3	Cecilia	Mz E Lt 6 Lora Lora	Licanten	943523282	jlamayaalbornoz1991@gmailcom	Ariztia	LTS		
76851961-7	Transporte Y Arriendo De Camion Pablo Cesar Silva San Martin Spa	Pablo Cesar Silva San Martin	15169825-5	Cecilia	Independencia 646	Tucapel	934197744	transportes.pablosilvasm@gmail.com	Ariztia			
78365117-3	Transportes Almendra Y Roco Spa	HUGOLINO OSCAR D'APREMONT FUENTES	8769209-4	Cecilia	VICTOR CUCCUINI 139	Recoleta	9 4415 1118	anaolate6@gmail.com				
77656577-6	Transportes Cristina Aguirre Spa	Cristina Adriana Aguirre Sobrecuevas	9371887-9	Cecilia	Sgto. Aldea 906	Padre Hurtado	56992593093	Pablo_briones@live.cl				
77974457-4	Transportes Arlette Spa	Jaime Ismael Astroza Rodríguez	17381973-0	Cecilia	Carmen Covarrubias 32 Of 512 Nunoa	Santiago	923926847	astrozajaime@gmailcom	Ariztia			
77965304-8	Transportes De Carga Hernan Segundo Cabrera Avila E.i.r.l	Hernan Segundo Cabrera Avila	12369186-5	Cecilia	Luis Mayol 001 Poblacion Padre Hurtado	Chimbarongo	56987439336	cabrerahernan5668@gmail.com				
77949497-7	TRANSPORTES KAISER SPA	Hector Rodrigo Garcia Quintana	6947243-5	Cecilia	Paseo Huerfanos 1055 503	Santiago	56942722979	contabilidad@cynasesorias.com		LTS		
77374557-9	Transportes Carlos González Loyola E.i.r.l.	Carlos Alberto Gonzalez Loyola	9348715-K	Cecilia	Salvador Allende 32 Pedro Aguirre Cerda	Puente Alto	935603611	carlos.gloyola@gmail.com		LTS		
77890332-6	Transportes Carlos Castillo Miñano E.i.r.l.	Carlos Alberto Castillo Miñano	14682246-0	Cecilia	Pje Volc Marmolejo 840 D- 2 Valle Norte Iv Lampa	Lampa	993217064	carlos19castillo70@gmailcom				
76826483-K	Transportes Carlos Rene Cornejo Molina E.i.r.l.	Carlos Rene Cornejo Molina	7479565-K	Cecilia	Pasaje Creta, Villa Parque Industrial 662	Talagante	998411537	Carloscornejomo@gmailcom			Rendic	
78132030-7	Transportes Claudio Painequeo E.i.r.l.	Claudio Alejandro Painequeo Concha	13498752-9	Cecilia	Jose Tomas Ovalle 143 Talagante	Talagante	963425496	claudiopaineq@gmailcom				
77373865-3	Transportes Claudio Vilogron Paredes E.i.r.l.	Claudio Antonio Dionisio Vilogron Paredes	11412638-1	Cecilia	P Valdivia 182 America I	Paine	998493641	claudiovilogron@gmail.com	Ariztia		Rendic	
77489241-9	Transportes Cruz Spa	Eduardo Felipe Cruz Molina	16125137-2	Cecilia	EL OLIMPO 1528 V EL OLIMPO NULL	Maipu	963510774	efcruzmolina@gmail.com				
77569357-6	Transportes De Carga Cya Spa	Jorge Humberto Castillo Perez	14629966-0	Cecilia	Panamericana sur km 41 parcela 114	Paine	935042369	jorgecastillo23816@gmailcom	Ariztia	LTS	Rendic	Interpolar
76987117-9	Transportes De Carga Magaly Rocio Añorga Huerta E.i.r.l.	Magaly Rocio Añorga Huerta	22508160-3	Cecilia	QUEMCHI 5836 ROBERT KENNEDY	ESTACION CENTRAL	959312065	nachito.2115@gmail.com				
76977185-9	Transportes Eduardo Alarcon Empresa Individual De Responsabilidad Li	Eduardo Benjamin Alarcon Espinoza	8596994-3	Cecilia	Los Claveles 1451 Villa El Bosque	Quinchao	986081662	eduardobenja2007@gmailcom		LTS		
77377507-9	Transportes Eric Darat E.i.r.l.	Eric Henry Darat Ramirez	9802602-9	Cecilia	Pasaje Tarragona 1486 V Galilea F 1	Curico	983843935	fmezacanales@gmailcom		LTS	Rendic	
78089406-7	Transportes Evem Spa	Veronica Del Pilar Panes Lopez	15493950-4	Cecilia	Lalo Parra 16 Lt 10 -m 10 Bicentenario Cabrero	Cabrero	998260911	pilarveronicapanes@gmailcom		LTS		
77849029-3	Transportes Expresso Ignacio Spa	JESSICA IDA PLAZA PLAZA	12945149-1	Cecilia	Hij La Chunga Lote 92 Null	La Serena	951787205	Tr.ignaciospa28@gmail.com	Ariztia	LTS		
77401233-8	Transportes Felipe Andres Rex Villalobos E.i.r.l.	Felipe Andres Rex Villalobos	16667244-9	Cecilia	General Jose Villagra 8086 33 Lo Prado	Lo Prado	974405765	feliperexvillalobos@gmail.com		LTS		
77375352-0	Transportes Fernando Darat Candia E.i.r.l.	Fernando Edinson Darat Candia	12785037-2	Cecilia	V Cordillera Pj 6 516 LT 1 B	San Clemente	997407947	fdarat@hotmail.com	Ariztia	LTS		
77032978-7	TRANSPORTES FLOR VALLADARES SPA	Flor Del Carmen Valladares Lopez	11785936-3	Cecilia	PINTOR JUAN FRANCISCO GON 343 ILUSIONES COMPARTIDA MELIPILLA	Santiago	966794362	transflova@gmailcom	Ariztia	LTS		
78027318-6	TRANSPORTES GERMAN EDUARDO PARDO ANTIHUAL E.I.R.L	German Eduardo Pardo Antihual	16670983-0	Cecilia	GUARDIA VIEJA 202 OF 403 4P PROVIDENCIA	Santiago	935833823	gpardotransportes@gmailcom				
77499811-K	Transportes Jahdiel Spa	Marco Antonio Sanhueza Espino	12022695-9	Cecilia	Avda Chile 14	San Bernardo	972909188	marcosanhuezaespino@gmailcom				
77495891-6	TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L	Jhon Chavarria Muñoz	11801151-1	Cecilia	Los Maitenes s/n volcan	Vilcun	979939809	jhonyteperman@gmailcom			Rendic	
78283626-9	Transportes Jkarimv Spa	JAMYR AJMED KARIM VARGAS	18316251-9	Cecilia	REGIMIENTO COQUIMBO 060 PARTE ALTA NULL	Coquimbo	986545451	j.karim.v@icloud.com				
77377829-9	TRANSPORTES JOSE MIGUEL ALARCON SpA	Jose Miguel Alarcon Aguilera	11534975-9	Cecilia	Panamericana sur km 41 parcela 114	Paine	963959732	vogelyalarcon@gmailcom		LTS		
78057959-5	Transportes Jota Castillo Spa	Jose Felix Castillo Oyarzo	12794947-6	Cecilia	Pje Gilberto Rojas 2258 B Del Boldo 4 Curico	Curico	987547915	trasportesjotacastillo@gmail.com				
77992492-0	TRANSPORTES JUAN AGUILAR VALENZUELA EIRL	Juan German Aguilar Valenzuela	12393328-1	Cecilia	PJE IRMA OYARZO 77 JOSE M CARRERA 2	Santiago	944926813	germanaguilarv@gmailcom	Ariztia			
76903711-K	Transportes Jyr Spa	Luis Hernan Jara Gonzalez	8662822-8	Cecilia	Pasaje Rio Yelcho 188 Villa Los Ríos	Panguipulli	977570705	ljg1509@hotmail.cl	Ariztia			
76507104-6	TRANSPORTES LOS ALAMOS LIMITADA	Andres Fernando Cardenas Neira	13403254-5	Cecilia	CALLE LA VENDIMIA 1322 VILLA LOS ALAMOS	Padre Hurtado	989205300	andrucane@gmailcom		LTS		
77389829-4	Transportes Manuel Perez Vilches E.i.r.l.	Manuel Natalio Pérez Vilches	9770990-4	Cecilia	Pj a blest gana 0379 ST 202 belgica	La Granja	991351497	manuelnperezvilches@gmailcom		LTS	Rendic	
77672752-0	Transportes Mauricio Lastra Azocar E.i.r.l	Mauricio Eduardo Lastra Azocar	17331983-5	Cecilia	LA GRANJA PC 16 LOTE 2-B RETIRO	Retiro	949880408	mauriciolastraazocar@gmailcom	Ariztia	LTS	Rendic	
77400529-3	Transportes Miguel Angel Sepulveda Verdugo Spa	Miguel Angel Sepulveda Verdugo	10516965-5	Cecilia	17 Med pte 0923 Jardin del Valle	Talca	994516466	denisesepulvedas@gmailcom		LTS		
78100599-1	Transportes Milady Spa	Milady Alejandra Ibañez Carvajal	13041969-0	Cecilia	Pas Pilmaiquen 1121 Renca	Renca	978416671	milyalejandraibanezc@gmailcom		LTS		
78125401-0	Transportes Miranda Y Bravo Limitada	Marta Carolina Miranda Ovalle	11395529-5	Cecilia	Las Nevadas 417	El Bosque	998004133	carolinamirandaovalle@gmailcom				
78157982-3	Transportes Navarro Spa	PEDRO ENRIQUE NAVARRO DELGADO	14046644-1	Cecilia	BERNARDO O'HIGGINS 2797	TALAGANTE	952876425	pnavarrod32@gmail.com				
78295014-2	Transportes Nino Spa	NINO ALVARO PINZAS JULCA	27364850-K	Cecilia	AMERICA INDIGENA 2248	Cerrillos	981207845	pinzasnino1@gmail.com				
77986483-9	TRANSPORTES OPTIMUM SPA	Álvaro Efraín Madrid Reyes	16296370-8	Cecilia	MEXICO 01892 LO ESPEJO	Santiago	972955712	madridalvaro112@gmail.com		LTS		
78000781-8	TRANSPORTES PABLO PEREZ SPA	PABLO ANDRES PEREZ URRUTIA	14467460-K	Cecilia	FUNDO SAN JUAN LOTE DOS 2	Mulchen	959300289	transportesperezu@gmailcom				
77425212-6	Transportes Patricio Romo Moreno E.i.r.l.	Patricio Enrique Romo Moreno	9646548-3	Cecilia	Panamericana sur km 41 parcela 114	Paine	953132168	pato370c1@gmail.com	Ariztia			
77703639-4	Transportes Pecort Spa	Marisel Haydee Gonzalez Varas	13176165-1	Cecilia	Pasaje Estero De Hunta 385	Coquimbo	968413432	pedro.cortes.rojas79@gmail.com	Ariztia		Rendic	
77509381-1	Transportes Reyes Quintero SPA	Alvaro Sebastian Reyes Alfaro	17429147-0	Cecilia	Panamericana sur km 41 parcela 114	Paine	935431034	transportesreyesquintero@gmailcom		LTS		
77843013-4	TRANSPORTES RICHARD AGUILERA CONTRERAS E.R.I.L	Richard Antonio Aguilera Contreras	12924248-5	Cecilia	HORNITOS 0859 PUENTE ALTO	Santiago	953337063	RICHARDAGUILERA0859@GMAILCOM				
77413603-7	Transportes Rodmac Spa	Rodrigo Araya Riquelme	17898038-6	Cecilia	Jorge Giacaman 122 palomares	Concepción	993279277	transportesrodmacspa@gmailcom		LTS	Rendic	
78302429-2	Transportes San Lorenzo Spa	LORENZO EDUARDO CHANDIA SALAZAR	17932540-3	Cecilia	JUAN PABLO II 317 MAULE	Maule	964829208	trans.chandia@gmail.com				
77848908-2	TRANSPORTES WALDO SALDAÑO E.I.R.L.	Waldo Agustin Saldaño Baez	11836287-K	Cecilia	BOMBERO SALAS 1445 DP 402 SANTIAGO	Maipú	961502033	waldosaldano360@gmailcom				
77931594-0	Transportes Y Servicios Fs Spa	Fernando Gonzalo Sabando Manriquez	14259603-2	Cecilia	Pje 6 162 Valle Del Sol Chgte	Chiguayante	957053373	transportesabando@gmailcom	Ariztia	LTS		
78115034-7	Transportes Y Servicios Jenavama Spa	Malco Agabo Cespedes Manquez	8461526-9	Cecilia	Pasaje El Álamo 14 Santa Mónica	Padre Hurtado	996822315	cespedesmalco@gmaillcom	Ariztia			
77369887-2	TRANSSAMY SPA	Raul Miguel Panes Lopez	17217685-2	Cecilia	PABLO NERUDA 140 LT 01 M 9 BICENTENARIO CABRERO	Los Angeles	966558687	TRANSSAMY06@GMAILCOM	Ariztia	LTS	Rendic	
78293071-0	Transportes Zura Spa	Genaro Francisco Zurita Hernandez	12756249-0	Cecilia	AV AMÉRICA 1084 NULL	San Bernardo	56961695562	zuritagenaro267@gmail.com				
12671737-7	Cristian Mauricio Jimenez Reyes	Cristian Mauricio Jimenez Reyes	12671737-7	Daniela	Quinchamali 14141	Lo Barnechea	972741479	camionerojimenez55@gmail.com				
77590685-5	Hisan Spa	Victor Rogelio San Martin Campos	13138612-5	Daniela	Las Tijeras Lote 17	Coihueco	997362809	consultoranyt@gmail.com		LTS		
76901231-1	inversiones Allende Limitada	Nibaldo Andres Rossel Allende	16193591-3	Daniela	Llaveria El Durazno S/N	Las Cabras	985030321	andyjak_182@gmail.com	Ariztia	LTS	Rendic	
77058007-2	Jose Antonio Puebla Quezada Spa	Jose Antonio Puebla Quezada	11990292-4	Daniela	Calle Estacion Sitio 4 N° 1175 Monte Negro	Til-Til	926006921	josepuebla0@gmail.com			Rendic	
76685344-7	Sociedad De Transportes Baguales Spa	Arturo Alejandro Herrera Giadala	6639764-5	Daniela	Avenida Los Urbanistas 961, Altos de Mirasur	Temuco	994432449	arturoherreragiadala@yahoo.es		LTS		
78101306-4	Tmp Transportes Spa	Alfredo Nicolas Hidalgo Aravena	19733547-5	Daniela	Pasaje El Higueral 6460	La Florida	946814861	alfredoaero@gmail.com		LTS		
76878075-7	Translainer SPA	Carlos Felipe Fuentealba Ordenes	18280017-1	Daniela	Essbio 111, Villa España	Cabrero	953082987	translainerspa@gmail.com		LTS		
76819041-0	Transporte Daniela Fernandez Buosi EIRL	Daniela Andrea Fernandez Buosi	17390559-9	Daniela	Pasaje 8 N° 5379 4A	San Miguel	964468447	transvyf@gmail.com		LTS		
77143848-2	Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.	Johanna del Pilar Alvarez Caneo	12029231-5	Daniela	Pasaje Las Carretas 908	Talagante 	942810314	ja296872@gmail.com	Ariztia			
77709716-4	Transporte Mapirito Spa	Crismara Peña de Nuñez	26536252-4	Daniela	Morande 835 piso 5 Oficina 518	Santiago	976854861	transportemapirito@gmail.com				
78208706-1	Transporte Roberto Lopez H. E.i.r.l.	Roberto Alonso Lopez Hernandez	12083320-0	Daniela	MORANDE 835 P 5 OF518 NULL SANTIAGO	Santiago	985362683	Kiwi1_71@hotmail.com	Ariztia	LTS		
77844986-2	TRANSPORTES HAKUNA MATATA SPA	Shakira Barker	26086312-6	Daniela	Pasaje Parque Nacional Queulat 4046	Puerto Montt	957796432	sconta1977@gmail.com	Ariztia	LTS		
77742801-2	transportes y logistica jose mariano benitez vega spa	Jose Mariano Benitez Vega	10511943-7	Daniela	Calle Delfin Muñoz 45, Monte Aguila	Cabrero	969151932	jose.m.benitezvega@gmail.com		LTS		
77941272-5	TRANSPORTES ALFER SPA	Eric Ivan Mendoza Cid	18348389-7	Daniela	Calle 5 Lote 4, 29	Cabrero	998863537	trans.alferspa@gmail.com		LTS		
77204205-1	Transportes Amal Spa	Ariel Martin Ameijeira	23642784-6	Daniela	Ahumada 254 OF 806	Santiago	961469130	transportesamalspa@gmail.com		LTS		
78043729-4	Transportes Arma Spa	Angela Andrea Pedreros Cerna	18301617-2	Daniela	SAN PIO X 2445 OF 510 5P	Providencia	962646273	Transportesarmaspa@gmail.com		LTS		
78310166-1	Transportes Beeweis Spa	PATRICIO HERNANDEZ BEWEIS	17109499-2	Daniela	ZAPADORES 441	Recoleta	987300549	Sebastian.beweis@gmail.com				
77724297-0	TRANSPORTES CORDINI SPA	Jonathan Reinaldo Cordini Beltran	18497643-9	Daniela	Huerfanos 1055 depto 503	Santiago	981433557	jcordinibeltran@gmail.com				
78350942-3	Transporte Brimarc Spa	Eduardo Enrique Brito Leiva	14126191-6	Daniela	Lago Chungara 334 	Quilicura	992115703	ebritoleivaabril2@gmail.com	Ariztia			
77225235-8	TRANSPORTES CRUC SPA	Claudio Robinson Urzua Cifuentes	9380195-4	Daniela	Pasaje Ramayana 661	Maipu	975556759	claudiorobinson1963@gmail.com				
77943651-9	Transportes Cs Spa	Fernando Jesus Celis Gutierrez	16568610-1	Daniela	Pasaje Progreso y Bienest 0105	Buin	977603049	ferna-908@yahoo.es	Ariztia			
77927983-9	TRANSPORTES DE CARGA MARCELA PATRICIA CAMACHO CAMACHO E.I.R.L	Marcela Patricia Camacho Camacho	16342771-0	Daniela	Villa La Palma pasaje 6 casa 173	Talagante	933906939	marcelitapatricia31@gmail.com				
78350787-0	Transportes Br Spa	Felipe Eduardo Martínez Solar	16114446-0	Daniela	Santiago Aldea 906	Padre Hurtado	973580530	pipemartinezsolar@gmail.com				
78364854-7	Transportes Don Augusto Spa	Italo Ramiro Suazo Torres	18653683-5	Daniela	Yerbas Buenas 490 A	Linares	988936845	italosuazot1993r@gmail.com				
77443906-4	Transportes Donatelo Spa	JUAN SEGUNDO MUÑOZ BUSTOS	16572863-7	Daniela	PSJE TRES PONIENTE CASA 105 VILLA JESUS NULL	Calera de Tango	932972689	juanpyalonso2020@gmail.com	Ariztia			
77919212-1	Transportes Franco Spa	Alejandro Javier Soto Morales	18877641-8	Daniela	PASAJE A 17 SITIO 68 INES ARAGAY III NULL	Parral	940078959	Transportesfrancospa@gmail.com	Ariztia	LTS		
78273793-7	Transportes Gianlucca Vitto Limitada	NICOLAS ANDRES MUNOZ DIAZ	18537552-8	Daniela	CONSTANTINOPLA 16269 EL ABRAZO NULL	Maipu	968953561	nicolasmunozdiaz@gmail.com				
76904819-7	Transportes Gonzalo Eduardo Araya Aguilar Eirl	Gonzalo Araya Aguilar	10906077-1	Daniela	Villa America pasaje 3 N° 595	Casablanca	961580795	asesorias.sofiaaraya@gmail.com			Rendic	
77547318-5	Transportes Ignacio Burgos E.i.r.l.	Ignacio Santiago Burgos Alamos	10842565-2	Daniela	Gaspar de Orense 982	Quinta Normal	991837272	nagiraburgos2017@gmail.com				
77349385-5	Transportes Inma Spa	Miguel Luis Infante Zambrano	15148994-K	Daniela	Pasaje Empedrado 1746	Maule	982510793	miguel.infante.zambrano@gmail.com	Ariztia			
78179126-1	Transportes Isacon Spa	CONSTANZA DEL PILAR RECABAL AVILA	18202693-K	Daniela	ANTONIO BELLET 193 OF 1210 12P NULL BLOCK 1210	Providencia	959220329	Isacon.transportes@gmail.com		LTS		
76808332-0	Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons	Juan Manuel Sarralde Aravena	10631473-K	Daniela	Julio Valenzuela 836	Buin	937401993	juansarralde49@gmail.com				
77381623-9	Transportes Luchito Spa	RAFAEL EDUARDO VIDAL CHAVARRIA	12141459-7	Daniela	LOS OLMOS 27 MONTE AGUILA	Cabrero	996241608	rafaelvidalch01@gmail.com		LTS		
77488785-7	Transportes Luis Araya Lazo E.i.r.l.	Luis Enrique Araya Lazo	17979506-K	Daniela	Calle principal 14	Coquimbo	976139547	kcortes.contabilidad@gmail.com	Ariztia	LTS		
77113814-4	Transportes Luis Eduardo Cruz Perez EIRL	Luis Eduardo Cruz Perez	12129517-2	Daniela	Pasaje El Ocaso La Islita parcela 3	Isla de Maipo	983345898	luis.cruz.perez44@gmail.com				
77382964-0	Transportes Luis Ignacio Urrutia Tiznado E.i.r.l.	Luis Ignacio Urrutia Tiznado	10190528-4	Daniela	Avenida Luis Cabrera 1475 A	Linares	974024936	anaolate6@hotmail.com		LTS	Rendic	
78301223-5	Transportes Lvs Spa	OSCAR ANTONIO LANDERO VERA	11963927-1	Daniela	AVENIDA FENIX 8555 3 24 LO ESPEJO	Lo Espeko	954643465	Landero24v@gmail.com				
76812672-0	Transportes M/r Limitada	RODRIGO ALEXANDER MUNOZ ECHEVERRIA	14145864-7	Daniela	PASAJE ERNEST UTHOFF 03021	SAN BERNARDO	991849530	Transportes.mrlogistica@gmail.com				
78178719-1	Transportes Magnate Spa	BASTIAN ELIAS URRUTIA GAVILAN	21935683-8	Daniela	SAN JUAN LOTE B	LINARES	934236726	bastianurrutia2015@gmail.com		LTS		
78069053-4	Transportes Mauricio Arroyo E.i.r.l.	Mauricio Antonio Arroyo Esfronceda	15107209-7	Daniela	Pasaje Eusebio Lillo 2	Mostazal	948517274	mauricioarroyo35@gmail.com				
77998655-1	TRANSPORTES MIGUEL JESUS URIBE COCA E.I.R.L	Miguel Jesus Uribe Coca	27446096-2	Daniela	Apoquindo 6410 Oficina 605 Piso 6	Las Condes	926338295	jesus.volvo.21@gmail.com				
78003531-5	Transportes Morales Castillo Spa	CAROLINA ANDREA CASTILLO CASTILLO	15195014-0	Daniela	PASAJE EL PEUMO 7 VILLA ESPERANZA	Cabrero	978506451	kaarito83@gmail.com		LTS		
77417801-5	Transportes Naranjo's Spa	Glassbeidey Naranjo Sanchez	25907316-2	Daniela	J SOLIS-ALGARROB OTE 520 DP 42 PARQUE LIBERTAD NULL	LA SERENA	958683547	contacto.gns20@gmail.com	Ariztia	LTS		
76843705-K	Transportes Pablo Cesar Soto Cruz E.i.r.l.	Pablo cesar Soto Cruz	12869737-3	Daniela	Rosendo Jaramillo N° 329	Chimbarongo	996426218	pablo.columbia1@gmail.com		LTS	Rendic	
77993482-9	TRANSPORTES PAISOL SPA	ALVARO LORENZO PAILLAN PALMA	16379465-9	Daniela	PSJE CUATRO ORIENTE CASA 27	Calera de Tango	976643992	transporte.paisol@gmail.com		LTS		
77852474-0	TRANSPORTES PEDRO VILLAGRAN E.I.R.L.	PEDRO SEBASTIAN VILLAGRAN SALDIAS	18670406-1	Daniela	PJE 10 74 ST 19 MZ C	Concepción	954391870	PEDRO.SVS.94@GMAIL.COM	Ariztia	LTS		
78242685-0	Transportes Rc Spa	RICHARD ANDRES CONTRERAS FORTON	16146554-2	Daniela	CALLE NUEVA 3860 8 14 JOSÉ GARDINJ	RENCA	999525901	richard.contrer85@gmail.com				
77692211-0	Transportes Renee Bastias P E Hijos Spa	Renee Nicole Bastias Pereira	15468813-7	Daniela	Morande 835	Santiago	942445867	reneebastiasp@gmail.com			Rendic	
77119982-8	Transportes Rodrigo Esteban Rojas Araya EIRL	Rodrigo Esteban Rojas Araya	15957473-3	Daniela	Pasaje Altue 3764 V Las Hortensias	Padre Hurtado	997078031	fegrande10@gmail.com				
77357401-4	Transportes Sebastian Exequiel Garcia Martini Empresa Individual De Re	Sebastian Exequiel Garcia Martini	15931067-1	Daniela	Pasaje San Simon 2607 San Ignacio 2	Padre Hurtado	992252150	kekita74@yahoo.es				
77640206-0	Transportes Sin Fronteras SPA	Antony Jesus Cosme Ircañaupa	21836416-0	Daniela	Apoquindo 7935	Las Condes	978508641	transportesinfronteras@gmail.com				
77982752-6	Transportes Villegas Y Villegas Spa	Robinson Nicolas Villegas Hernandez	20251681-5	Daniela	Simpson 997	Valdivia	941555921	transp.vyvspa@gmail.com		LTS		
78207782-1	Transportes M&f Spa	Rodrigo Andres Sarralde Diaz	13773888-0	Daniela	HUERFANOS 1055 OF 313 NULL	Santiago	987127769	Transportesmarfel5@gmail.com				
76937652-6	Trasportes Claudio Ortega Spa	Claudio Ivan Eduardo Ortega Escobar	16809991-6	Daniela	Pasaje Colonial 272	Isla De Maipo	940076378	claudiomaipo@gmail.com			Rendic	
77808136-9	Transportes Emimaxi Spa	Úrsula Fabiola Contreras Cerda	12272213-9	Daniela	Milloqueo 0982	Puente Alto	947435714	ismaelmorning@gmail.com				
77848888-4	Celin Spa	Hector Mario Ceballos Gallegos	15213567-K	Olga	Campos 120	Rancagua	974046956	trancelinspa@gmail.com		LTS	Rendic	
77083269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	Luis Anibal Vergara Cadiz	9875518-7	Olga	El Acacio Sitio 47 A P.14	Calera de tango			Ariztia			
77150766-2	Empresa De Transportes Nico Abarca Spa	Nelson Alejandro Abarca Leiva	12457226-6	Olga	5 de abril 413	Marchigue			Ariztia	LTS		
78174616-9	Jjb Transportes Spa	LUIS ALEJANDRO RODRIGUEZ GALLARDO	17512443-8	Olga	PASAJE EL BLANCO 1868 CONDOMINIO ESMERALDA	RIO BUENO	981261921	Rodriguez.jano.luis@gmail.com	Ariztia	LTS		
77929313-0	NAVARRETE SANCHEZ SPA	Manuel Modesto Navarrete Valdebenito	11185990-6	Olga	Av Las Tejas 1555	Maipu		manuel.nav99@gmail.com		LTS		
77548896-4	SERVICIO DE TRANSPORTE B Y B SPA	VÍctor Rodolfo Basoalto Tapia	17449523-8	Olga	El Cascajo, San Raul s/n	Longavi		victorbasoalto1990@gmail.com	Ariztia	LTS	Rendic	
76285729-4	Sociedad De Transportes Quintanilla Ltda.	Juan Pablo Quintanilla Gajardo	8591417-0	Olga	PANAMERICA SUR KM 145	SAN FERNANDO	944894012	jpabloquintanilla@hotmail.com	Ariztia	LTS	Rendic	
78099101-1	Transporte Diego Galdame Spa	DIEGO DILAN GALDAME GUTIERREZ	19723478-4	Olga	CALLE 1 349	PARRAL	945794915	diegogaldame97@gmail.com		LTS		
78303894-3	Transportes Chachy Spa	NANCY EDITH ALMONTE VASQUEZ	11524418-3	Olga	CAMINO OCHAGAVIA 02096 LA 02096	El Bosque	942812796	dorianjamett50@gmail.com				
78180641-2	Transportes Dancris Spa	CRISTIAN EMILIO HIDALGO YANTEN	10583929-4	Olga	PJ R MATTE 921 VILLA GABRIELA NULL	BUIN	940942053	Transportes.dancris@gmail.com		LTS		
7092038-7	Mario Fernando Urbina San Juan	Mario Fernando Urbina San Juan	7092038-7	Olga	PARAISO # 10, VILLA EL EDEN	REQUINOA						
77085832-1	Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez Muñoz E.i.r	Hernan Osvaldo Gutierrez Munoz	15401975-8	Olga	JOSE BRANCOLI CINQUINI 1363	TALAGANTE	56 9 9303 8834	hernan gutierrez muñoz <h.gutierrez.munoz@gmail.com>				
77941769-7	Transporte H&p Spa	HÉCTOR HERNÁN PARRA JARA	18617130-6	Olga	R. WARNER 03 MZA ST 2 VILLA LOS BOLDOS 0	CABRERO	56 9 3408 5419	hectorparra.jara@gmail.com	Ariztia	LTS	Rendic	
77852371-K	Transportes Escalona Spa	ANGELA POLET ESCALONA VEJAR	14195515-2	Olga	MARIA LUISA SEP 959 NULL	Quilicura	934888027	angelapoletesca1981@gmail.com				
77863057-5	TRANSPORTES DANIEL ALEJANDRO SEPULVEDA NEGRON E.I.R.L	DANIEL ALEJANDRO SEPÚLVEDA NEGRÓN	16996347-9	Olga	DELICIAS 400 0	TEMUCO	56 9 7527 0648	0		LTS		
76390125-4	Transportes Andres Lisandro Ramirez Tapia Eirl	Andres Lisandro Ramirez Tapia	7954905-3	Olga	PASAJE BOLIVIA 256	PAINE	56 9 9744 6927	andreacrm25@gmail.com		LTS		
78261292-1	Transportes Igm Spa	LUIS RAUL ARROYO ARRIAGADA	16675631-6	Olga	VILLAGRAN 1217	Los Angeles	956487351	transportesigmcontacto@gmail.com				
77560099-3	Transportes Arnoldo Carrasco Spa	ARNOLDO ALEJANDRO CARRASCO RAMIREZ	14380055-5	Olga	BARRALES 0234 SAN PEDRO 0	MELIPILLA	56 9 3243 4254	transportesacr@yahoo.com			Rendic	
77411735-0	Transportes Edol Spa	Eduardo Ignacio Olguin Lopez	18000462-9	Olga	MIGUEL DE CERVANTES 266 NICOLAS PALACIOS 0	SANTA CRUZ	56 9 4428 9400	eduardo.olguin1991@hotmail.es	Ariztia	LTS	Rendic	
76748766-5	Transportes Hector Galaz E.i.r.l.	Hector Antonio Galaz Contreras	13568803-7	Olga	CAMINO PUBLICO LOTE 0	OLIVAR	56 9 3390 2798	hgalazbeltran@gmail.com			Rendic	
76304483-1	Transportes Jose Luis Ubilla Mendoza Eirl	JOSÉ LUIS UBILLA MENDOZA	11473085-8	Olga	CAUPOLICAN 3295	PEÑAFLOR	56 9 4247 0013	0				
78295206-4	Transportes Lara Spa	ALAN GABRIEL LARA UBILLA	19422493-1	Olga	CONSEJAL TERESA HERRERA 6350	Cerrillos	959496368	Laraalan374@gmail.com				
76842089-0	Transportes Jose Rodolfo Vasquez Balboa Empresa Individual De Responsa	Jose Rodolfo Vasquez Balboa	10254247-9	Olga	CAMINO A CERRILLO CASA 20	LONGAVÍ	56 9 6225 7927	jose010293vasquez@gmail.com		LTS		
78255926-5	Transportes Luis Walter Jimenez Sepulveda E.i.r.l.	Luis Walter Jimenez Sepulveda	12097721-0	Olga	PC 20 LT 17 EL PAIQUITO NULL	El Monte	992560268	transportesluisjimenez@gmail.com				
77222214-9	Transportes Marco Antonio Gatica Moreno Spa	Marco Antonio Gatica Moreno	15665285-7	Olga	PJ COELEMU 02673 STA ROSA DE LIMA	SAN BERNANDO	983567470	marcogatica14@gmail.com				
77913183-1	TRANSPORTES LUIS IGNACIO CABRERA VERA E.I.R.L.	Luis Ignacio Cabrera Vera	19241866-6	Olga	BOMBERO LUIS MORONI 2601 DP 408 -A CIUDAD PARQUE BICENT 0	CERRILLOS	56 9 7852 8806	0				
77566202-6	Transportes Mc Spa	Jacky Lee Lopez Neculman	17937608-3	Olga	LOS CANTAROS 14563 LAS HORTENSIAS III 0	SAN BERNARDO	56 9 9181 1192	transportesmcspa1@gmail.com			Rendic	
77408422-3	Transportes Mejias Spa	Marco Antonio Rios Mejias	15868246-K	Olga	PARROCO A. ALVARADO 2918 EL PORVENIR 0	MAIPÚ	56 9 8397 6991	0		LTS		
77436503-6	Transportes Mj E Hijos Spa	Pablo Ignacio Escobedo Quintanilla	19034826-1	Olga	Av. Apoquindo 6410, 605	Las Condes	989055980	Pablo.mec1995@gmail.com		LTS		
77480102-2	Transportes Myt Spa	YESSENIA ANDREA PÉREZ ROMERO	17885015-6	Olga	PINTOR ALFREDO VALENZUELA 1015	LINARES	56 9 4466 7593	0		LTS	Rendic	
77392988-2	Transportes Nibaldo Araya Eirl	Nibaldo Patricio Araya Astorga	9407328-6	Olga	JM BALMACEDA 4878 0	RENCA	56 9 7495 0939	nibaldo1962@gmail.com				
77377291-6	Transportes Nicolas Spa	Pedro Benjasmin Soto Jara	9659299-K	Olga	LOS MONTONEROS 639 EL ESFUERZO 0	CHILLÁN	56 9 8582 9392	0		LTS		
77387969-9	Transportes Orlando Del Carmen Mendez Gutierrez Eirl	Orlando Del Carmen Mendez Gutierrez	10891710-5	Olga	LLANCANAO 915 BELLO HORIZONTE 0	LINARES	56 9 6806 7441	0		LTS		
77805935-5	Transportes Paola Garcia Fredes E.i.r.l	PAOLA DEL CARMEN GARCÍA FREDES	11361891-4	Olga	AV OHIGGINS 490 DP 28 A EDIF EL LIBERTADOR 0	MAIPÚ	56 9 3553 4723	paolagarciafre07@gmail.com				
77394975-1	Transportes Raul Marcelo Soto Bobadilla E.i.r.l.	RAÚL MARCELO SOTO BOBADILLA	15392455-4	Olga	HUECHUN BAJO PC 32 LT 6 0	MELIPILLA	56 9 9987 8369	0	Ariztia			
77117558-9	Transportes Ro Spa	RODRIGO IGNACIO UBILLA MUÑOZ	19212826-9	Olga	CAUPOLICAN 3295 0	PEÑAFLOR	56 9 4247 0013	0				
77110277-8	Transportes Santa Rafaela Spa	Luis Eduardo Perez Vargas	12880784-5	Olga	RAMON SUBERCASEAUX 1268 1204	SAN MIGUEL	56 9 7376 1474	tsr2020spa@gmail.com				
77713918-5	Transportes Victoria Spa	Francisco Adolfo Chamorro Sobarzo	17468168-6	Olga	SANTA VICTORIA LT.A Y B 0	TUCAPEL	56 9 5652 2508	0	Ariztia	LTS		
77888835-1	TRANSPORTES SANCHEZ SPA	DAVID SALOMON SANCHEZ OTAROLA	17900921-8	Olga	CALLE LOS AVELLANOS 1667 VILLA EL BOSQUE	SAN JAVIER	953006937	Davidsanchezotarola@gmail.com		LTS		
77383694-9	Transportes Wilson Antonio Cabello Reyes Eirl	Wilson Antonio Cabello Reyes	15943194-0	Olga	PJ CONSC ROJAS 0111 0	LINARES	56 9 8829 4958	0		LTS		
77273263-5	Transportes Taurus Spa	Jonathan Alfredo Vergara Osorio	18633398-5	Olga	ALMIRANTE LATORRE 255 PARTE ALTA	Coquimbo	935652585	Jonathan.osoriotr94@gmail.com		LTS	Rendic	
77698453-1	Transportes Trans Adroc Spa	ANDREA DEL PILAR DIAZ GARRIDO	15837517-6	Olga	AV. PAPA JUAN XXIII 368 C. DE P. H. PTE VI NULL 0 0	Padre hurtado	966036468	tran.adroc@gmail.com				
78296208-6	Transportes Venaur Spa	DARIO HERNAN CALDERON RODRIGUEZ	24425491-8	Olga	CORONEL GODOY 128	Estación Central	990227147	Rodriguezdario387@gmail.com				
78019868-0	Ubilla Transportes Spa	JOSÉ LUIS UBILLA MUÑOZ	17292956-7	Olga	CAUPOLICAN 3295 0	PEÑAFLOR	56 9 9442 3272	0				
77892137-5	TRANSPORTES WHITE EXPRESS SPA	OMAR CHRISTIAN PEREZ ENCINAS	22607329-9	Olga	BIO BIO 592	SANTIAGO	998015067	HOD_F17@HOTMAIL.COM		LTS"""

lines = data.strip().split('\n')

# Parse and deduplicate
seen_ruts = set()
records = []

for line in lines:
    parts = line.split('\t')
    if len(parts) >= 10:
        rut = parts[0].strip()
        if rut and rut not in seen_ruts:
            seen_ruts.add(rut)
            nombre = parts[1].strip()
            representante = parts[2].strip()
            ejecutiva = parts[4].strip()
            direccion = parts[5].strip()
            comuna = parts[6].strip()
            telefono = parts[7].strip()
            email = parts[8].strip()
            
            # Parse service flags
            ariztia = 'Ariztia' in line
            lts = 'LTS' in line
            rendic = 'Rendic' in line
            interpolar = 'Interpolar' in line
            
            # Determine region based on ejecutiva
            if ejecutiva in ['Carolina', 'Cecilia']:
                region = ejecutiva
            elif ejecutiva == 'Daniela':
                region = 'Daniela'
            elif ejecutiva == 'Olga':
                region = 'Olga'
            else:
                region = 'Carolina'
                
            records.append({
                'rut': rut,
                'nombre': nombre,
                'representante': representante,
                'ejecutiva': ejecutiva,
                'region': region,
                'direccion': direccion,
                'comuna': comuna,
                'telefono': telefono,
                'email': email,
                'ariztia': ariztia,
                'lts': lts,
                'rendic': rendic,
                'interpolar': interpolar,
            })

print(f"Total records: {len(records)}")
print(f"Records with duplicates removed: {len(records)}")
print(f"Sample record:")
if records:
    r = records[0]
    print(f"  RUT: {r['rut']}, Nombre: {r['nombre']}, Services: A={r['ariztia']} L={r['lts']} R={r['rendic']} I={r['interpolar']}")
