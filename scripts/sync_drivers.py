import requests
import json
import time

# Drivers data - all 291 conductores
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
19022717-0	Yerko Alberto Meza Vidal	76878075-7	Translainer SPA	FXJD71"""

# Parse drivers
drivers = []
for line in drivers_raw.strip().split('\n'):
    parts = line.split('\t')
    if len(parts) >= 5:
        drivers.append({
            'rut': parts[0],
            'nombre': parts[1],
            'rut_proveedor': parts[2],
            'proveedor': parts[3],
            'patente_tracto': parts[4]
        })

print(f"[v0] Parsed {len(drivers)} drivers from data")

# Call the sync API
base_url = "http://localhost:3000"
max_retries = 5
retry_count = 0

while retry_count < max_retries:
    try:
        print(f"[v0] Attempt {retry_count + 1}: Calling {base_url}/api/admin/sync-drivers")
        response = requests.post(
            f"{base_url}/api/admin/sync-drivers",
            json={"drivers": drivers},
            timeout=120
        )
        
        print(f"[v0] Status Code: {response.status_code}")
        result = response.json()
        print(f"[v0] Response:")
        print(json.dumps(result, indent=2))
        break
    except requests.exceptions.ConnectionError as e:
        retry_count += 1
        print(f"[v0] Connection error: {str(e)}")
        if retry_count < max_retries:
            print(f"[v0] Retrying in 5 seconds...")
            time.sleep(5)
        else:
            print(f"[v0] Failed after {max_retries} attempts")
    except Exception as e:
        print(f"[v0] Error: {str(e)}")
        break
