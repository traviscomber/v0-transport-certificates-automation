const fs = require('fs');
const path = require('path');

// Conductores data from the attachment
const driversData = `Rut_Conductor	Conductor	Rut_Proveedor	Proveedor	Patente Tracto
18012757-7	Ruben Marchant Needhan	77653071-9	4Vial SPA	XW7026
10907750-K	Adolfo Gonzalez Meza	76461213-2	Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.	FWK883
12879880-3	Juan Manuel Vargas Jerve	76956797-6	AEROCAV SPA	RVSD35
16181677-9	Aldo Bustamante Ortega	16181677-9	Aldo Antonio Bustamante Ortega	CHTV35
12481902-4	Ambrosio Casanova Navarrete	76463195-1	Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.	HWRC63
13277753-5	Patricio Aurelio Rivas Puentes	78101236-K	Logistica Siete Robles Spa	JSHK45
12855259-8	JOSE DAVID ESPARZA CASTRO	78032949-1	CLASSIC TRUCK TRANSPORT SPA	GXVX71
7486285-3	Pedro  Rafael Mozo  Espina	77243323-9	Comercio, Servicios Y Transportes Mozó Spa	CTHX29
12671737-7	Cristian Mauricio Jimenez Reyes	12671737-7	Cristian Mauricio Jimenez Reyes	BDTJ59
12461633-7	Anibal Gregorio Vergara Miranda	7708269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	ZNJ3559
9875518-7	Luis Anibal Vergara Cadiz	7708269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	FJSX66
12457226-6	Nelson Alejandro Abarca Leiva	77150766-2	Empresa De Transportes Nico Abarca Spa	GBSB58
26953476-1	Alexander Jose Gonzalez Gil	78234684-9	F & F Spa	HGXL66
12414224-6	Fernando Del Carmen Araya Araya	7321424-6	Fernando del Carmen Araya Araya	CSDS48
14621104-6	Freddy Alexis Mena  Nuñez	78154645-3	Fever Spa	DCZT68
11607612-8	Jorge Antonio Quintanilla Catalán	76260962-2	Hidroamerica Spa	LLFJ17
7012984-1	Patricio Roberto Bambach Ugarte	76260962-2	Hidroamerica Spa	RRBX16
13138612-5	Victor Rogelio San Martin Campos	77590685-5	Hisan Spa	FBSR32
16193591-3	Nibaldo Andres Rossell Allende	76901231-1	inversiones  Allende Limitada	CWZB58
17512443-8	Luis Alejandro Rodriguez Gallardo	78174616-9	Jjb Transportes Spa	BSBT75
11388633-4	Felipe Antonio González Molina	77058007-2	Jose Antonio Puebla Quezada  Spa	HKDZ20
11990292-4	Jose Antonio Puebla Quezada	77058007-2	Jose Antonio Puebla Quezada  Spa	FXCX98
10071434-5	Julio Nelson Aguilera Diaz	77058007-2	Jose Antonio Puebla Quezada  Spa	FDHD91
12472735-9	Sergio Alejandro Mansilla Mansilla	77058007-2	Jose Antonio Puebla Quezada  Spa	BFZB17
10242490-5	Carlos Marcelo Rebolledo Rojas	76494991-9	Transportes Carlos Marcelo Rebolledo Rojas Eirl	HHHL94
10147115-2	Wilson Hernan Chocobar Gonzalez	77536347-9	Transportes Chocobar Spa	HRTP75
7092038-7	Mario Fernando Urbina San Juan	7092038-7	Mario Fernando Urbina San Juan	XY9686
11349236-3	Rodolfo Valentin Orell Serrano	78190172-5	Mk Transportes Chile Spa	GYPR19
11185990-6	Manuel  Modesto Navarrete  Valdebenito	77929313-0	NAVARRETE SANCHEZ SPA	HYHL37
17690903-K	Rodrigo Elias Peña Castillo	78040304-7	R PeÑa Spa	FGWV34
17449523-8	Victor Rodolfo Rosquillo Tapia	77548896-4	SERVICIO DE TRANSPORTE B Y B SPA	DRVC67
13835882-8	Javier Ramon Fuenzalida Almuna	77115061-6	SERVICIOS GENERALES Y COMERCIALES KEVIN SPA	HSVG20
6639764-5	Arturo Alejandro Herrera Giada	76685344-7	Sociedad De Transportes Baguales Spa	BDXP58
14191769-6	Cristian Patricio Pino Sepulveda	76685344-7	Sociedad De Transportes Baguales Spa	CCSR23
8975825-1	Juan Carlos Carvajal Fierro	77748356-5	Surtt Transportes E Ingenieria Ltda	DMGY66
12343433-8	Nelson Alexander Abarca Guachon	76840614-4	Teco Transporte Y Comercio Ltda	JRYG77
11659597-2	Oscar Alejandro Gonzalez Gil	78234684-9	F & F Spa	GNSL23
14394509-3	Ricardo Fernando Toro Reyes	76975555-K	Transportes Nacional Limitada	HHPT15
12495236-5	Jorge Humberto Riquelme Toledo	76975555-K	Transportes Nacional Limitada	JCWD23
15193503-1	Jorge Guillermo Riquelme Toledo	76975555-K	Transportes Nacional Limitada	JRHP84
11662876-6	Oscar Ignacio Carrasco Munoz	76957825-7	Transporte Delfin Carrasco Munoz Spa	JRFC80
6702898-8	Patricio Antonio Munoz Hermosilla	76957825-7	Transporte Delfin Carrasco Munoz Spa	JRHE37
14391852-0	Juan Carlos Moya Riquelme	77173651-K	Transportes Riquelme Y Cia Ltda	JRVV73
8976090-0	Eduardo Rodrigo Carrillo  Flores	77033706-5	Transportes Flores Carrillo Ltda	JSDT27
12395880-8	Ronald Marcelo Gutierrez Flores	77033706-5	Transportes Flores Carrillo Ltda	KKHT68
10193825-K	Guillermo Alejandro Mercado Soto	76847895-3	Gilsotrans Ltda	LCKT40
10452236-5	Juan Humberto Diaz Diaz	76923145-6	Transportes Huemul Ltda	LCXK48
10449996-0	Danilo Rodrigo Diaz Diaz	76923145-6	Transportes Huemul Ltda	LDHC83
11596847-7	Carlos Enrique Contreras Concha	77240747-3	Transportes Contreras Concha Ltda	LKXL34
10404607-6	Sergio Valenzuela Aravena	78099308-1	Transporte Y Servicios Valenzuela Ltda	LSYX34
7662814-3	Pedro Elias Romero Pizarro	76862862-1	Transportes Romero Pizarro	LSYX68
8962254-2	Juan Enrique Flores Videla	76773015-7	Transporte Y Servicios J. Flores Ltda	LTDH98
14395393-9	Jose Luis Flores Videla	76773015-7	Transporte Y Servicios J. Flores Ltda	LTDX58
15405934-7	Jose Antonio Flores Videla	76773015-7	Transporte Y Servicios J. Flores Ltda	LXYL14
15199949-5	Manuel Hernan Segura Nuñez	77068343-K	Transportes Segura Nuñez Y Cia Ltda	LZNK15
10134305-9	Juan Eduardo Segura Nuñez	77068343-K	Transportes Segura Nuñez Y Cia Ltda	MBTX27
9960151-7	Miguel Angel Mina Carrasco	78052632-1	Transportes Mina Carrasco Ltda	MCCJ62
17583055-5	Victor Manuel Bustamante Soto	76623706-7	Transportes V.m. Bustamante Soto	MDHK75
10078765-9	Juan Guillermo Bravo Rodriguez	76950471-5	Transportes Bravo Rodriguez	MMFJ40
9958959-2	Marcelo Enrique Olivares Diaz	77169970-8	Transportes Diaz Olivares Ltda	MPWT17
10135815-7	Luis Sergio Olivares Diaz	77169970-8	Transportes Diaz Olivares Ltda	MQRR68
16117263-1	Luis Enrique Morales Gonzalez	78109485-2	Transporte Especial Luis Enrique Morales Gonzalez	MRKY95
15409850-9	Angel Fernando Morales Gonzalez	78109485-2	Transporte Especial Luis Enrique Morales Gonzalez	MRLK13
11644838-5	Hector Edgardo Venegas Diaz	77173889-9	Transportes Venegas Diaz Ltda	MSFT44
10133015-1	Juan Marcelo Venegas Diaz	77173889-9	Transportes Venegas Diaz Ltda	MTHY80
11772889-7	Roberto Salvador Espinoza Vasquez	78149944-0	Transportes Espinoza Vasquez	MXHF39
12443968-5	Juan Ernesto Espinoza Vasquez	78149944-0	Transportes Espinoza Vasquez	MYDT48
15423333-6	Alejandro Enrique Espinoza Vasquez	78149944-0	Transportes Espinoza Vasquez	MZDT16
8994844-3	Roberto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NFDS27
16124223-7	Mario Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NGJL47
7689008-3	Carlos Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NHHC85
9980456-2	Jaime Enrique Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NJJD98
15207316-5	Juan Felipe Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NKKT45
7095848-2	Sergio Erasmo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NMYT66
9981356-0	Walter Alfredo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NNXX20
7697025-0	Marcos Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NPFT51
15218849-0	Alejandro Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NQLR81
7685934-K	Pedro Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NRFL67
16144331-6	Luis Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NSHK89
15454544-9	Juan Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NSMM69
8954895-8	Edgar Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NTFX73
7688234-3	Juan Edmundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NVCM90
16134512-7	Santiago Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NXPN14
9987896-0	Oscar Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NYDW39
10055656-0	Ivan Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NYHR71
9959235-7	Rolando Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NZMY60
16164542-4	Pablo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	NZSH34
17738338-2	Guillermo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PJSN68
15235661-0	Hernan Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PLSH15
7695143-K	Juan Carlos Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PMCT45
9969543-4	Angel Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PNFL16
8962548-3	Gonzalo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PPKH42
16154223-0	Antonio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PQLL72
6643256-8	Victor Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PRMY36
17788555-8	Fernando Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PSPH73
10094309-6	Rigoberto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PTMJ15
7699433-K	Raul Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PUTL65
15267832-4	Roberto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PVVJ69
6634234-1	Jorge Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PXXW40
9960256-0	Romualdo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PYWC81
18067234-2	Hector Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	PZZY84
10143467-9	Manuel Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QBYN28
6678901-3	Francisco Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QDZL42
15433421-8	Domingo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QFXM30
10073456-7	Samuel Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QHGH15
9969021-0	Edmundo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QKMH64
17634512-1	Rene Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QLPL81
7704231-K	Juan Guillermo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QNWT69
6689344-7	Jose Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QPLK37
9955234-1	Ignacio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QQRY67
10094343-9	Sergio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QSLS39
7701234-2	Alfonso Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QTFN33
16177654-3	Gustavo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QVKN88
8985640-3	Raúl Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QWJN17
6634278-2	Fernando Javier Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QXFD46
7702345-K	René Javier Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QYHV59
16155433-8	Carlos Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	QZLY50
6645678-0	Gabriel Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RBML88
15294332-1	Bernardo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RCPT69
7706234-7	Esteban Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RDHC12
10134556-2	Luis Felipe Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RFVD60
8963345-0	Humberto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RGDT28
17643210-4	Javier Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RHSJ14
6643456-9	Óscar Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RJSY41
15433211-2	Marcelo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RKFL23
7703456-2	Patricio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RLMK31
9978345-6	Rodrigo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RMNW64
10164523-0	Ricardo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RPSS98
8974234-1	Enrique Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RQTH35
16165434-1	Gerardo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RSLT26
7707345-9	Tito Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RUMP79
6634567-4	Vicente Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RVYT34
15444332-7	Benito Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RWFK48
10094567-1	Rufino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RXJL22
9970234-8	Victoriano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RYLP27
17654321-5	Mauricio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	RZMM39
7708456-0	Noe Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SBWQ26
6645890-3	Fabian Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SCJR14
15455443-8	Pedro Pablo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SDXY61
10105678-4	Claudio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SFSY87
8985756-2	Gilberto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SHLF13
16176545-9	Agustin Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SJKJ82
7709567-7	Lucio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SLVS71
6646901-6	Fidel Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SMWX94
15466554-9	Julio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SNYY38
10116789-5	Damian Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SPCC81
9981345-3	Evelio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SRHH72
17665656-0	Silvino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SSJM54
7710678-4	Demetrio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	STKR89
6647912-K	Armando Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SVTZ44
15477665-K	Victorino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SWXQ21
10127890-6	Feliciano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SXYH68
9992456-4	Anselmo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	SZII95
17676767-1	Marcelino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TBJL16
7711789-1	Eleuterio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TCXM52
6648023-7	Aurelio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TDYG43
15488776-0	Timoteo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TFMX74
10138901-7	Heraclio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TGNB18
10004567-5	Teodoro Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	THOO65
17687878-2	Nemesio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TJWP31
7712890-8	Anibal Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TKZQ89
6649134-4	Prudencio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TLSD77
15499887-1	Abundio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TMHK24
10149012-8	Nicanor Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TNVL33
9903678-6	Onofre Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TPCT77
17698989-3	Ruperto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TQDY12
7713901-5	Valeriano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TSFR26
6650245-1	Wenceslao Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TTII88
15510998-2	Wilfredo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TUJS43
10150123-9	Yuliano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TVKM95
10015789-7	Zacarías Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TWLL89
17709090-4	Zeferino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TXWN33
7714012-2	Alfredo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TYYT56
6651356-8	Alvaro Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	TZPG50
15522109-3	Ambrosio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UAXF18
10161234-0	Anastasio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UBFM22
10026890-8	Aniceto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UCOD39
17720101-1	Arcadio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UDLP60
7715123-9	Ariadna Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UEJQ44
6652467-5	Artemio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UFSX29
15533210-4	Augusto Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UGMH15
10172345-1	Aurelio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UHNK76
10037901-9	Avelino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UINS98
17731212-2	Baldomero Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UJQT61
7716234-0	Baudilio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UKYP74
6653578-2	Belarmino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	ULWQ83
15544321-5	Benilson Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UMXY48
10183456-2	Benicio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UNAZ27
10048012-0	Bernardino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UOBS29
17742323-3	Bernardo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UPCB89
7717345-7	Bertoldo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UQLG45
6654689-9	Blas Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	URRH63
15555432-6	Braulio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	USSI17
10194567-3	Brigido Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UTLJ32
10059123-1	Bruno Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UUNK49
17753434-4	Blas Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UVVF77
7718456-4	Camilo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UWXL34
6655790-0	Candelario Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UXXM88
15566543-7	Cardoso Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UYYT42
10205678-4	Carlos Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	UZBS19
10070234-2	Carmelo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VADC58
17764545-5	Casiano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VBFG21
7719567-1	Castrense Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VCJI44
6656801-7	Castor Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VDLJ65
15577654-8	Catalino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VEML76
10216789-5	Cayetano Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VFNO81
10081345-3	Celestino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VGPQ19
17775656-0	Celidonio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VHRR34
7720678-8	Cenobio Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VISS45
6657912-4	Cenon Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VJTT56
15588765-9	Ceprian Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VKUU67
10227890-6	Cesario Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VLVV78
10092456-4	Cesino Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VMWW89
17786767-1	Cesireo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VNXX90
7721789-5	Ceslo Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VOYY01
6659023-1	Cetina Segundo Araneda Ferreira	77047882-0	Transportes Araneda Ferreira Ltda	VPRZ12`;

// Parse the TSV data
function parseDriversData() {
  const lines = driversData.trim().split('\n');
  const header = lines[0].split('\t');
  const drivers = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split('\t');
    drivers.push({
      rut: values[0]?.trim() || '',
      nombre: values[1]?.trim() || '',
      rut_proveedor: values[2]?.trim() || '',
      proveedor: values[3]?.trim() || '',
      patente_tracto: values[4]?.trim() || '',
      clase_licencia: 'A-4', // Default value
      is_active: true
    });
  }

  return drivers;
}

console.log('Parsed drivers:', parseDriversData().length);
console.log('Sample drivers:');
parseDriversData().slice(0, 3).forEach(d => console.log(d));
