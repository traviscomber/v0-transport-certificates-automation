#!/usr/bin/env python3
"""
Script to sync 291 conductores from attachment to Supabase
"""
import os
import sys

# All 291 drivers from your text file
drivers_raw = """18012757-7	Ruben Marchant Needhan	77653071-9	4Vial SPA	XW7026
10907750-K	Adolfo Gonzalez Meza	76461213-2	Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.	FWKB83
12879880-3	Juan Manuel Vargas Jerve	76956797-6	AEROCAV SPA	RVSD35
16181677-9	Aldo Bustamante Ortega	16181677-9	Aldo Antonio Bustamante Ortega	CHTV35
12481902-4	Ambrosio Casanova Naavarrete	76463195-1	Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.	HWRC63
13277753-5	Patricio Aurelio Rivas Puentes	78101236-K	LogÍstica Siete Robles Spa	JSHK45
8825579-8	JOSE DAVID ESPINOZA CASTRO	78032949-1	CLASSIC TRUCK TRANSPORT SPA	GXVX71
7486285-3	Pedro  Rafael Mozo  Espina	77243323-9	Comercio, Servicios Y Transportes Mozó Spa	CTHX29
12671737-7	Cristian Mauricio Jimenez Reyes	12671737-7	Cristian Mauricio Jimenez Reyes	BDTJ59
17461633-7	Anibal Gregorich Vergara Miranda	77083269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	ZN3559
9875518-7	Luis Anibal Vergara Cadiz	77083269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	FJSX66
12457226-6	Nelson Alejandro Abarca Leiva	77150766-2	Empresa De Transportes Nico Abarca Spa	GBSB58
26953476-1	Alexander Jose Gonzalez Gil	78234684-9	F & F Spa	HGXL66
7321424-6	Fernando Del Carmen Araya Araya	7321424-6	Fernando del Carmen Araya Araya	CSDS48
14621104-6	Freddy Alexis Mena  NuÑez	78154645-3	Fever Spa	DCZT68
11607612-8	Jorge Antonio Quintanilla CatalÁn	76260962-2	Hidroamerica Spa	LLFJ17
7012984-1	Patricio Roberto Bambach Ugarte	76260962-2	Hidroamerica Spa	RRBX16
13138612-5	Victor Rogelio San Martin Campos	77590685-5	Hisan Spa	FBSR32
16193591-3	Nibaldo Andres Rossel Allende	76901231-1	inversiones  Allende Limitada	CWZB58
17512443-8	Luis Alejandro Rodriguez Gallardo	78174616-9	Jjb Transportes Spa	BSBT75
11838643-4	Felipe Antonio Gonzalez Molina	77058007-2	Jose Antonio Puebla  Quezada  Spa	HKDZ20
11990292-4	Jose Antonio Puebla Quezada	77058007-2	Jose Antonio Puebla  Quezada  Spa	FXCX98
10071434-5	Julio Nelson Aguilera Diaz	77058007-2	Jose Antonio Puebla  Quezada  Spa	FDHD91
12472735-9	Sergio Alejandro Faundez Mancilla	77058007-2	Jose Antonio Puebla  Quezada  Spa	BFZB17
10242490-5	Carlos Marcelo Rebolledo Rojas	76494991-9	Transportes Carlos Marcelo Rebolledo Rojas Eirl	HHHL94
10147115-2	Wilson Hernan Chocobar Gonzalez	77536347-9	Transportes Chocobar Spa	HRTP75
7092038-7	Mario Fernando Urbina San Juan	7092038-7	Mario Fernando Urbina San Juan	XY9686
15947526-3	Rodolfo Valentin Orellana Serrano	78190172-5	Mr Transportes Chile Spa	GYPR19
11185990-6	Manuel  Modesto Navarrete  Valdebenito	77929313-0	NAVARRETE SANCHEZ SPA	HYHL37
17690903-K	Rodrigo Elias Peña Castillo	78040304-7	R PeÑa Spa	FGWV34
17449523-8	VÍctor Rodolfo Basoalto Tapia	77548896-4	SERVICIO DE TRANSPORTE B Y B SPA	DRVC67
13835882-8	Javier Ramon Fuenzalida Almuna	77115061-6	SERVICIOS GENERALES Y COMERCIALES KEVIN SPA	HSVG20
6639764-5	Arturo Alejandro Herrera Giadala	76685344-7	Sociedad De Transportes Baguales Spa	BDXP58
10573425-5	Juan Octavio Lillo Espinoza	77390218-6	Sociedad de Transportes Jole SPA	CZYT21
12995031-5	Ivan Arturo Cuevas Gatica	77007552-1	Sociedad De Transportes Km Limitada	CDHC67
13353956-5	Luis Hernan Iturriaga Barahona	77007552-1	Sociedad De Transportes Km Limitada	CVTR62
18748311-5	Bryan Andres Retamales Gallardo	76285729-4	Sociedad De Transportes Quintanilla Ltda.	PLVY41
15533220-4	Israel Ariel Pradenas  PiÑeiro	78029819-7	Transportes Doble Jj Spa	FXRL17
9744124-3	Juan Alonso Quintanilla Catalan	76285729-4	Sociedad De Transportes Quintanilla Ltda.	LXCD78
19428444-6	Michelle Jacob Retamales Gallardo	76285729-4	Sociedad De Transportes Quintanilla Ltda.	GWXT86
12676471-5	Miguel Angel Ortiz Romero	76285729-4	Sociedad De Transportes Quintanilla Ltda.	PSZG88
7919871-4	Victor Arsenio Rojas Gutierrez	76285729-4	Sociedad De Transportes Quintanilla Ltda.	KBLL66
6388956-3	Leonardo Antonio Moreno Medina	76491308-6	Sociedad De Transportes Y Servicios Moreno Y Lopez Limitada	BKWZ91
11434690-K	Luis Patricio Tello Reyes	76447559-3	Tello Y Tello Transportes Spa	GBCC41
19548402-3	Matias Braulio Baez Pacheco	76447559-3	Tello Y Tello Transportes Spa	GBCC27
9795683-9	Oscar Custodio Verdugo Quintanilla	76447559-3	Tello Y Tello Transportes Spa	GBCC27
19733547-5	Alfredo Nicolas Hidalgo Aravena	78101306-4	Tmp Transportes Spa	FYGS35
18364099-2	Juan Lopez  Reyes	77416162-7	Tranportes  Por Carretara  JL SPA	DBFS59
19022717-0	Yerko Alberto Meza Vidal	76878075-7	Translainer SPA	FXJD71
13465548-8	Carlos Miranda Diaz	76848886-K	Transporte Brenet SPA	FJTC46
14126191-6	Eduardo Enrique Brito Leiva	78350942-3	Transporte Brimarc Spa	GDXV98
10529089-6	Danilo Enrique Gaete Fuenzalida	77441798-2	TRANSPORTE CARGA POR CARRETERA DG SPA	YR5399
16747931-6	Emilio Wladimir Martinez Simoncelli	76819041-0	Transporte Daniela Fernandez Buosi EIRL	HKCH51
18662721-0	Enzo Francescolli Villalobos Simoncelli	76819041-0	Transporte Daniela Fernandez Buosi EIRL	CHTS89
16669891-K	Elvis Antonio Bravo Gonzalez	77143848-2	Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.	BSCD59
14154431-4	Hector Fernando Gonzalez Leyton	77143848-2	Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.	DHZR51
13049990-2	Sergio Albino Jerez Duran	77143848-2	Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.	DHZR14
17590791-2	Daniel  Esteban Orellana  Muñoz	77772051-1	Transportes H & B Spa	FRRS49
15401975-8	Hernan Osvaldo Gutierrez Munoz	77085832-1	Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez MuÑoz E.i.r	ZH8723
14285398-1	Luis Rodrigo Cabrera Jofre	77085832-1	Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez MuÑoz E.i.r	FJFL86
13465290-K	Orlando Alfonso Reveco Calabriano	77085832-1	Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez MuÑoz E.i.r	FCLV12
9271706-2	Juan Carlos Araya Rodriguez	76303728-2	Transporte De Carga Por Carretera Juan Carlos Araya Rodriguez Eirl	RP6816
10866252-2	Antonio Renan Wolpi Saldias	76902431-k	Transporte De Carga Por Carretera Rudy David Mora Morales Eirl	DSBV42
14445738-2	Borys Johan Luna Hurtado	76902431-k	Transporte De Carga Por Carretera Rudy David Mora Morales Eirl	DSBV42
11947260-1	Juan Andres Astorga  Aros	76902431-k	Transporte De Carga Por Carretera Rudy David Mora Morales Eirl	RW8765
13152123-5	Rodolfo Rodrigo Huenchullán Mardones	76902431-k	Transporte De Carga Por Carretera Rudy David Mora Morales Eirl	YY3995
13269446-K	Raul Erasmo Chandia Zuñiga	77856341-K	Transporte De Carga Raul Erasmo Chandia  ZuÑiga E.i.r.l.	DGPT60
11966473-K	Juan Felix Saez Paredes	78150214-6	Transportes Jsp Spa	JHBZ17
19723478-4	Diego Dilan Galdame Gutierrez	78099101-1	Transporte Diego Galdame Spa	GTGJ66
11618935-6	Francisco Javier Oyanadel Ramos	77502623-5	TRANSPORTE FRANCISCO OYANADEL RAMOS SPA	CCHL14
18617130-6	Hector Hernan Parra Jara	77941769-7	Transporte H&p Spa	HYHL42
17610706-5	DIEGO MAURICIO VERDEJO ROBLES	78001651-5	TRANSPORTE J Y D VERDEJO SPA	CYCG79
11665170-K	Juan Rodolfo Soto Zuñiga	78099333-2	Transporte Js Spa	RT7864
26599183-1	Rodolfo Jose Nunez Blanco	77709716-4	Transporte Mapirito Spa	CHFS21
19851132-3	Matias Jose Rubio Galaz	77505286-4	Transporte Matisaurio Spa	FWGS15
11567390-4	Sepulveda Nelson	77496396-0	Transporte Nelson Rodomir Sepulveda E.i.r.l.	GZKY52
12083320-0	Roberto Alonso Lopez Hernandez	78208706-1	Transporte Roberto Lopez H. E.i.r.l.	GBVX58
17853819-5	Juan Luis Amaya Albornoz	77642747-0	Transporte Santa Elena Spa	BBJZ97
16515307-3	Cristian Felipe Medina Albornoz	77920451-0	TRANSPORTES Y LOGISTICA SERPA SPA	CPGF97
15169825-5	Pablo Cesar Silva San Martin	76851961-7	Transporte Y Arriendo De Camion Pablo Cesar Silva San Martin Spa	WC9671
22518660-K	Jose David Nakasone Deza	78156059-6	Transporte Yanina Ysabel Garcia Mora De Nakasone E.i.r.l.	ZS7636
7445306-6	Daniel  Alejandro Sepulveda  Pastene	77863057-5	TRANSPORTES   DANIEL ALEJANDRO SEPULVEDA NEGRON E.I.R.L	BHHV10
27704167-7	Anderson Alberto Aguas Acosta	77844986-2	TRANSPORTES  HAKUNA MATATA  SPA	DKRK21
10511943-7	Jose  Mariano Benitiz Vega	77742801-2	transportes  y logistica  jose mariano  benitez  vega spa	RR1154
18348389-7	Eric Ivan Mendoza Cid	77941272-5	TRANSPORTES ALFER SPA	HYHL53
8769209-4	Hugolino Oscar D'apremont Fuentes	78365117-3	Transportes Almendra Y Roco Spa	JJHV94
23642784-6	Ariel Martin Ameijeira	77204205-1	Transportes Amal Spa	GXDZ83
7954905-3	Andres Lisandro Ramirez Tapia	76390125-4	Transportes Andres Lisandro Ramirez Tapia Eirl	XG5296
18388473-5	Angelo Carrasco Sanhueza	77624057-5	Transportes Angelo Nicolas Carrasco Sanhueza EIRL	JRZH20
17381973-0	Jaime Ismael Astroza Rodríguez	77974457-4	Transportes Arlette Spa	HKFT88
26942243-2	Alexander Jefrey Espiritu Santana	78043729-4	Transportes Arma Spa	FXRL20
17352242-8	Santiago Ignacio Palma Avila	77560099-3	Transportes Arnoldo Carrasco Spa	DRXX75
15713508-2	Sergio HernÁn Vera Duarte	77560099-3	Transportes Arnoldo Carrasco Spa	FWKY56
11971405-2	Carlos Alberto Baeza Infante	77420673-6	Transportes Baeza SPA	BXYG58
17109499-2	Sebastian Patricio Hernandez Beweis	78310166-1	Transportes Beeweis Spa	DDRV92
16585579-5	Hugo Demecio Tilleria Hueche	78151772-0	Transportes Belen Spa	DLVX50
20016670-1	Antonio Nicolas Bosmann Soto	78032375-2	Transportes Bosmann Spa	HYHL45
16114446-0	Felipe Eduardo Martinez Solar	78350787-0	Transportes Br Spa	DPJJ83
18345406-4	Raul Abraham Peña Calabrano	78099193-3	Transportes Yuyo Spa	TW7055
19347747-K	Bryan Willian Dinamarca Castillo	77647991-8	Transportes Bryan Dinamarca Castillo E.i.r.l.	CKZS86
16443919-4	Ramon Antonio Perez Michea	77647991-8	Transportes Bryan Dinamarca Castillo E.i.r.l.	HJGL55
17794905-1	Hugo Nuñez Toro	77625968-3	Transportes Cale SPA	HSTH26
15701835-3	Cristopher Fernando Loyola  Pinto	77664223-1	Transportes Cardenas  Limitada	HKFT89
24334657-6	Oscar Cardenas Rojas	77664223-1	Transportes Cardenas  Limitada	HKFT89
9348715-K	Carlos Alberto Gonzalez Loyola	77374557-9	Transportes Carlos  GonzÁlez Loyola E.i.r.l.	CYKZ36
14682246-0	Carlos Alberto Castillo Miñano	77890332-6	Transportes Carlos Castillo MiÑano E.i.r.l.	DFJT35
15790079-K	Juan Leandro Riveros Godoy	77890332-6	Transportes Carlos Castillo MiÑano E.i.r.l.	DFJT35
25477804-4	Luis Angel Rodriguez Chacon	77492287-3	Lar Spa	WD9161
7479565-K	Carlos Rene Cornejo Molina	76826483-K	Transportes Carlos Rene Cornejo Molina E.i.r.l.	DRCX93
15201366-3	Jose Rodrigo Burgos Muñoz	77435776-9	Transporte De Carga Jose Rodrigo Burgos MuÑoz E.i.r.l.	CVTR68
13131472-8	Fernando Antonio Venegas Sandoval	78129079-3	Transporte De Carga Venegas Y Otro Limitada	BZYV18
13498752-9	Claudio Alejandro Painequeo Concha	78132030-7	Transportes Claudio Painequeo E.i.r.l.	CHRY19
11412638-1	Claudio Antonio Dionisio Vilogron Paredes	77373865-3	Transportes Claudio Vilogron Paredes E.i.r.l.	BYRX33
18497643-9	Jonathan Reinaldo Cordini Beltran	77724297-0	TRANSPORTES CORDINI SPA	BWPV36
13665163-3	Pablo Danilo Briones Briones	77656577-6	Transportes Cristina Aguirre Spa	FXRL19
9380195-4	Claudio Robinson Urzua Cifuentes	77225235-8	TRANSPORTES CRUC SPA	FHKB95
16125137-2	Eduardo Felipe Cruz Molina	77489241-9	Transportes Cruz Spa	BWPL15
16568610-1	Fernando Jesus Celis Gutierrez	77943651-9	Transportes Cs Spa	BWPL19
10583929-4	Cristian Emilio Hidalgo Yanten	78180641-2	Transportes Dancris Spa	WG9414
14343223-8	Victor Hugo Barahona Gomez	77927983-9	TRANSPORTES DE CARGA   MARCELA PATRICIA CAMACHO CAMACHO E.I.R.L	BBHS91
20125037-4	Eric Alesander Carrera MuÑoz	77569357-6	Transportes De Carga  Cya  Spa	VE9154
19533779-9	Kevin Alexander Roldan Alegria	77569357-6	Transportes De Carga  Cya  Spa	CFGY35
12369186-5	Hernan Segundo Cabrera Avila	77965304-8	Transportes De Carga Hernan Segundo Cabrera Avila E.i.r.l	MZ9773
22504079-6	Joaquin Marcos Quispe Maguina	76518447-9	Transportes De Carga Jocelyn Carolina Silva Rojas Eirl	JKHC71
18537453-K	Ricardo Antonio Sepulveda Briones	76518447-9	Transportes De Carga Jocelyn Carolina Silva Rojas Eirl	DRJD68
22451330-5	Oscar Horacio Uchasara Choque	76987117-9	Transportes De Carga Magaly Rocio AÑorga Huerta E.i.r.l.	JLHZ67
16274214-0	Carlos Alejandro Gonzalez Martinez	77827992-4	Transporte Y  Comercializadora G Y R Spa	DRCX89
9957590-5	Domingo Cerda Lagos	77401369-5	Transportes Domingo Alberto Cerda Lagos E.i.r.l.	FFVW32
18653683-5	Italo Ramiro Suazo Torres	78364854-7	Transportes Don Augusto Spa	FYTP44
16572863-7	Juan Segundo MuÑoz Bustos	77443906-4	Transportes Donatelo Spa	CGHG46
16973068-7	Roberto Rebolledo  Labrana	77490988-5	Transportes Doña Luciana SPA	HHWD72
18000462-9	Eduardo Ignacio Olguin Lopez	77411735-0	Transportes Edol Spa	JKZB50
8596994-3	Eduardo Benjamin Alarcon Espinoza	76977185-9	Transportes Eduardo Alarcon Empresa Individual De Responsabilidad Li	BHJD81
17925492-1	Abraham Ismael Zapata Contreras	77808136-9	Transportes Emimaxi Spa	JTGY77
9802602-9	Eric Henry Darat Ramirez	77377507-9	Transportes Eric Darat E.i.r.l.	HYWX14
14094120-4	Erwin Rodrigo Rubio Urra	77852371-K	Transportes Escalona Spa	KKWY46
16186315-7	Guillermo Andres Diaz Gallegos	78089406-7	Transportes Evem Spa	FPBB92
18633909-6	Pablo Ignacio Figueroa Plaza	77849029-3	Transportes Expresso Ignacio Spa	CPBT91
15931343-3	Cristian  Alejandro Vergara Tapia	77401233-8	Transportes Felipe Andres Rex Villalobos E.i.r.l.	CYHZ64
16667244-9	Felipe Andres Rex Villalobos	77401233-8	Transportes Felipe Andres Rex Villalobos E.i.r.l.	CKXS65
15633374-3	Felipe Sarria Jimenez	77822803-3	TRANSPORTES FELIPE ANDRÉS SARRIA JIMÉNEZ E.I.R.L.	DWPB38
12785037-2	Fernando Edinson Darat Candia	77375352-0	Transportes Fernando Darat Candia E.i.r.l.	FPFV57
14159332-3	Cristian Vega Barahona	76994334-K	Transportes Fernando Patricio Valdes Silva Eirl	CSDS59
11271462-6	AndrÉs Marcelo Santos Fuentes	77032978-7	TRANSPORTES FLOR VALLADARES SPA	FWXD34
18877641-8	Alejandro Javier Soto Morales	77919212-1	Transportes Franco Spa	CWSV58
16670983-0	German Eduardo Pardo Antihual	78027318-6	TRANSPORTES GERMAN EDUARDO PARDO ANTIHUAL E.I.R.L	DHCX19
18537552-8	Nicolas Andres MuÑoz Diaz	78273793-7	Transportes Gianlucca Vitto Limitada	DBXF20
8515118-5	Claudio Hernan Acevedo Seguel	76904819-7	Transportes Gonzalo Eduardo Araya Aguilar Eirl	CGWC82
12627398-3	Gabriel Andres Araya Aguilar	76904819-7	Transportes Gonzalo Eduardo Araya Aguilar Eirl	FDHD92
17143468-8	Juan  Andres Herrera  Lagos	76904819-7	Transportes Gonzalo Eduardo Araya Aguilar Eirl	DPFR32
10516965-5	Miguel Angel Sepulveda  Verdugo	77400529-3	Transportes Miguel Angel Sepulveda Verdugo Spa	DXSP22
16492697-4	Fernando Horacio Galaz Contreras	76748766-5	Transportes Hector Galaz E.i.r.l.	ZR6786
13568803-7	Hector Antonio Galaz Contreras	76748766-5	Transportes Hector Galaz E.i.r.l.	CTFS88
18525551-4	Matias Alexi Ortiz Castillo	78261292-1	Transportes Igm Spa	WT7721
12967316-8	Cesar Augusto Romero Baez	78100599-1	Transportes Milady Spa	GKZD53
15148994-K	Miguel Luis Infante Zambrano	77349385-5	Transportes Inma Spa	GXST33
17231344-2	Isaac Rafael Iturrieta AÑo	78179126-1	Transportes Isacon Spa	GWWR87
12920772-8	Ivan Diaz Rivas	77624569-0	TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL	LCXJ73
17393582-K	Luis Alfonso Guerrero DÍaz	77624569-0	TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL	JRZH17
19371373-4	Jose Ignacio Mendoza Cid	77941312-8	TRANSPORTES J&F SPA	JCHR80
12022695-9	Marco Antonio Sanhueza Espino	77499811-K	Transportes Jahdiel Spa	ZN3943
11801151-1	Jhon Chavarria Muñoz	77495891-6	TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L	YW3574
18316251-9	Jamyr Ajmed Karim Vargas	78283626-9	Transportes Jkarimv Spa	FDKC88
18011702-4	John Francisco Jofre Gomez	78244173-6	Transportes Jme Spa	HSYC65
9778154-0	Juan Carlos Escobar Monsalve	76304483-1	Transportes Jose Luis Ubilla Mendoza Eirl	CDGL97
11534975-9	Jose Miguel Alarcon Aguilera	77377829-9	TRANSPORTES JOSE MIGUEL ALARCON SpA	DSBV53
18342814-4	Jose Luis Vasquez Solar	76842089-0	Transportes Jose Rodolfo Vasquez Balboa Empresa Individual De Responsa	GXVX73
10254247-9	Jose Rodolfo Vasquez Balboa	76842089-0	Transportes Jose Rodolfo Vasquez Balboa Empresa Individual De Responsa	JLRS27
12794947-6	Jose Felix Castillo Oyarzo	78057959-5	Transportes Jota Castillo Spa	FXRL18
24118167-7	Jhon Sebastian Quiroga Esparza	78165268-7	Transportes Jq Spa	DRPW37
17041135-8	Jonathan David Rodriguez Vargas	77503624-9	Transportes Jrm E Hijos Limitada	CGHG65
18144334-0	Marcelo Antonio Sandoval Balboa	77503624-9	Transportes Jrm E Hijos Limitada	GXVX72
11836287-K	Waldo Agustin SaldaÑo Baez	77848908-2	TRANSPORTES WALDO SALDAÑO E.I.R.L.	PG2638
12393328-1	Juan  German Aguilar Valenzuela	77992492-0	TRANSPORTES JUAN AGUILAR VALENZUELA EIRL	GPGR89
15838826-K	Alfredo Andres Berna Gajardo	76808332-0	Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons	HYHL54
8163261-8	Gabriel Guillermo Vargas Plaza	76808332-0	Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons	HYHL54
10631473-K	Juan Manuel Sarralde Aravena	76808332-0	Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons	HYHL54
8662822-8	Luis Hernan Jara Gonzalez	76903711-K	Transportes Jyr Spa	HYDC96
6947243-5	Hector Rodrigo Garcia Quintana	77949497-7	TRANSPORTES KAISER SPA	TS1483
9921513-5	Juan Carlos Lopez Diaz	78351383-8	Transportes L.y. R Spa	HLFT78
19422493-1	Alan Gabriel Lara Ubilla	78295206-4	Transportes Lara Spa	CZXS44
16262510-1	Cristobal Glem Vidal Neira	76507104-6	TRANSPORTES LOS ALAMOS LIMITADA	GGTL83
12141459-7	Rafael Eduardo Vidal Chavarria	77381623-9	Transportes Luchito Spa	ZN6814
17979506-K	Luis Enrique Araya Lazo	77488785-7	Transportes Luis Araya Lazo E.i.r.l.	DBZT91
18960151-4	JOSÉ EDUARDO CRUZ GONZÁLEZ	77113814-4	Transportes Luis Eduardo Cruz Perez EIRL	YK5758
19241866-6	Luis Ignacio Cabrera Vera	77913183-1	TRANSPORTES LUIS IGNACIO CABRERA VERA E.I.R.L.	BFXY76
10190528-4	Luis Ignacio Urrutia Tiznado	77382964-0	Transportes Luis Ignacio Urrutia Tiznado E.i.r.l.	CGJJ57
12097721-0	Luis Walter Jimenez Sepulveda	78255926-5	Transportes Luis Walter Jimenez Sepulveda E.i.r.l.	TU6238
11963927-1	Oscar Antonio Landero Vera	78301223-5	Transportes Lvs Spa	GZJT18
14145864-7	Rodrigo Alexander MuÑoz Echeverria	76812672-0	Transportes M/r Limitada	HJGJ48
16285933-1	Hector Rene Ortiz Gonzalez	77889348-7	Transportes Mad Spa	HLFZ77
21935683-8	Bastian Elias Urrutia GavilÁn	78178719-1	Transportes Magnate Spa	CGJF83
16536523-2	Camilo Eduardo Urrutia Retamal	78178719-1	Transportes Magnate Spa	DVGV42
9770990-4	Manuel Natalio Pérez Vilches	77389829-4	Transportes Manuel  Perez Vilches E.i.r.l.	JKZB48
17168357-2	Bruno  Ernesto Alcantara  Henriquez	77222214-9	Transportes Marco Antonio Gatica Moreno Spa	VJ8407
13839392-5	Fernando  Andres Huenchul  Zambrano	77222214-9	Transportes Marco Antonio Gatica Moreno Spa	UK8738
26148843-4	Jhorney Alejandro Quintero Prado	77222214-9	Transportes Marco Antonio Gatica Moreno Spa	YT2050
10356240-6	Miguel Angel Macias Macias	77222214-9	Transportes Marco Antonio Gatica Moreno Spa	CFPD67
11363580-0	Mario Enrique Corona Madrid	78165845-6	Transportes Matus Salen Spa	JTGY87
16121156-7	Jose Matias Pino Cornejo	78069053-4	Transportes Mauricio Arroyo E.i.r.l.	GXVX70
12271447-0	Mauricio Alberto Opazo Galloso	78069053-4	Transportes Mauricio Arroyo E.i.r.l.	GXVX70
8468759-6	Antonio Borquez Varas	77732652-K	Transportes Bricebor SPA	DLVK20
17331983-5	Mauricio Eduardo Lastra Azocar	77672752-0	Transportes Mauricio Lastra Azocar E.i.r.l	GHSX48
10697923-5	Roberto Eugenio Suarez Lopez	78113086-9	Transportes Maxsu Limitada	GXYH38
17937608-3	Jacky Lee Lopez Neculman	77566202-6	Transportes Mc Spa	BYRX60
15398705-K	Luis Antonio Valdenegro Navarro	77566202-6	Transportes Mc Spa	JKHC67
15868246-K	Marco Antonio Rios Mejias	77408422-3	Transportes Mejias Spa	DPFR34
19562294-9	Cristopher Matias MuÑoz Soto	77531127-4	TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L	ZV7883
19026207-3	Giovanny Andres Chandia  Caceres	77531127-4	TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L	YG1171
20532359-7	Josue Manuel Diaz Espinoza	77531127-4	TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L	ZR6709
18530382-9	Michell Alexander Bravo Araya	77531127-4	TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L	CKXL49"""

lines = drivers_raw.strip().split('\n')
print(f"[v0] Parsed {len(lines)} drivers from text")
print(f"[v0] Drivers ready to sync")

# You can use this data in an API call
# POST /api/admin/sync-drivers with this data
print("[v0] Run: curl -X POST http://localhost:3000/api/admin/sync-drivers")
