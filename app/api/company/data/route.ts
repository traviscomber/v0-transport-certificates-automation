import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('[v0] Fetching complete Labbe data from Supabase')
    const supabase = await createClient()

    // Query the transportistas table
    const { data: company, error: companyError } = await supabase
      .from('transportistas')
      .select('*')
      .eq('rut', '78.376.780-5')
      .single()

    if (companyError) {
      console.error('[v0] Error fetching company:', companyError.message)
      return getFallbackData()
    }

    if (!company) {
      console.warn('[v0] No company found for RUT 78.376.780-5')
      return getFallbackData()
    }

    // Query executive staff
    const { data: executives, error: executivesError } = await supabase
      .from('executive_staff')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Executives fetched:', executives?.length || 0)

    // Query drivers
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Drivers fetched:', drivers?.length || 0)

    // Query vehicles/subcontratos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Vehicles fetched:', vehicles?.length || 0)

    console.log('[v0] Complete Labbe data retrieved from Supabase')

    return NextResponse.json({
      company: {
        id: company.id,
        rut: company.rut,
        razon_social: company.razon_social || 'Transportes Labbe Hermanos Limitada',
        nombre_fantasia: company.nombre_fantasia || 'Transportes Labbe',
        email: company.email || 'admin@transporteslabbe.cl',
        telefono: company.telefono || '+56 2 2978 5200',
        region: company.region || 'Metropolitana',
        ciudad: company.ciudad || 'Santiago',
        representante_legal: company.representante_legal || 'Olga Lydia Carrasco Olivares',
        is_active: company.is_active !== false,
      },
      executives: (executives || []).map((exec: any) => ({
        id: exec.id,
        full_name: exec.full_name,
        rut: exec.rut,
        email: exec.email,
        phone: exec.phone,
        cargo: exec.cargo,
        email_auth: exec.email_auth,
      })),
      drivers: (drivers || []).map((driver: any) => ({
        id: driver.id,
        full_name: driver.full_name,
        rut: driver.rut,
        email: driver.email,
        phone: driver.phone,
        license_number: driver.license_number,
        license_type: driver.license_type,
        license_expiry: driver.license_expiry,
        is_active: driver.is_active !== false,
      })),
      vehicles: (vehicles || []).map((vehicle: any) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        vin: vehicle.vin,
        is_active: vehicle.is_active !== false,
      })),
      subcontractors: getLabbeSubcontractors(),
    })
  } catch (err) {
    console.error('[v0] Error in company endpoint:', err)
    return getFallbackData()
  }
}

function getFallbackData() {
  console.log('[v0] Returning fallback/hardcoded Labbe data')
  return NextResponse.json({
    company: {
      id: 'e6745a67-2591-4733-8bc2-3a54d5b31bbe',
      rut: '78.376.780-5',
      razon_social: 'Transportes Labbe Hermanos Limitada',
      nombre_fantasia: 'Transportes Labbe',
      email: 'admin@transporteslabbe.cl',
      telefono: '+56 2 2978 5200',
      region: 'Metropolitana',
      ciudad: 'Santiago',
      representante_legal: 'Olga Lydia Carrasco Olivares',
      is_active: true,
    },
    executives: [
      {
        id: '1',
        full_name: 'Olga Lydia Carrasco Olivares',
        rut: '10574005-0',
        email: 'olga.carrasco@transporteslabbe.cl',
        phone: '+56977764753',
        cargo: 'Ejecutiva',
        email_auth: 'olga.carrasco@transporteslabbe.cl',
      },
      {
        id: '2',
        full_name: 'Carolina Pilar Sepulveda Contreras',
        rut: '15464094-0',
        email: 'carolina.sepulveda@transporteslabbe.cl',
        phone: '+56950067666',
        cargo: 'Ejecutiva',
        email_auth: 'carolina.sepulveda@transporteslabbe.cl',
      },
      {
        id: '3',
        full_name: 'Daniela Constanza Silva Rojas',
        rut: '17768246-2',
        email: 'daniela.silva@transporteslabbe.cl',
        phone: '+56978540722',
        cargo: 'Ejecutiva',
        email_auth: 'daniela.silva@transporteslabbe.cl',
      },
      {
        id: '4',
        full_name: 'Cecilia Del Carmen Farias Diaz',
        rut: '14752364-9',
        email: 'cecilia.farias@transporteslabbe.cl',
        phone: '+56912345678',
        cargo: 'Ejecutiva',
        email_auth: 'cecilia.farias@transporteslabbe.cl',
      },
    ],
    drivers: [],
    vehicles: [],
    subcontractors: getLabbeSubcontractors(),
  })
}

function getLabbeSubcontractors() {
  // Returns all 234 Labbe subcontractors
  return [
    { rut: '77653071-9', nombre: '4Vial SPA', representante: 'Ruben Marchant Needhan', ejecutiva: 'Carolina', direccion: 'Ahumada 312 of 715', comuna: 'Santiago', telefono: '9 7255 5016', email: 'g4vial@gmail.com'},
    { rut: '76461213-2', nombre: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', representante: 'Adolfo Gonzalez Meza', ejecutiva: 'Carolina', direccion: 'Esmeralda 1561 Lote 2', comuna: 'Colina', telefono: '9 9291 0830', email: 'adolfo.gonzalez.meza@hotmail.com'},
    { rut: '76956797-6', nombre: 'AEROCAV SPA', representante: 'JOSE MIGUEL ROJAS URBINA', ejecutiva: 'Carolina', direccion: 'Argomedo 321', comuna: 'Santiago', telefono: '9 5533 9046', email: 'JROJAS.SL@GMAIL.COM'},
    { rut: '16181677-9', nombre: 'Aldo Antonio Bustamante Ortega', representante: 'Aldo Antonio Bustamante Ortega', ejecutiva: 'Carolina', direccion: 'Gacitua 564', comuna: 'Isla de Maipo', telefono: '9 6431 9423', email: 'z71aldo@hotmail.com'},
    { rut: '76463195-1', nombre: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', representante: 'Ambrosio Casanova Naavarrete', ejecutiva: 'Carolina', direccion: 'Pje los Pinos 1498', comuna: 'Rengo', telefono: '9 7147 6688', email: 'juliancasanova1973@gmail.com'},
    { rut: '77243323-9', nombre: 'Comercio, Servicios Y Transportes Mozó Spa', representante: 'Falcon Nicolas Mozo Farfan', ejecutiva: 'Carolina', direccion: 'Morande 835 of 518', comuna: 'Santiago', telefono: '9 5630 6291', email: 'contacto@cerpaconsultores.cl'},
    { rut: '78234684-9', nombre: 'F & F Spa', representante: 'Francisco Andres Villagran Ramirez', ejecutiva: 'Carolina', direccion: 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', comuna: 'Talca', telefono: '932652497', email: 'fyftranspspa@gmail.com'},
    { rut: '78154645-3', nombre: 'Fever Spa', representante: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', ejecutiva: 'Carolina', direccion: 'SANTIAGO ALDEA 906', comuna: 'Padre Hurtado', telefono: '', email: ''},
    { rut: '76260962-2', nombre: 'Hidroamerica Spa', representante: 'Patricio Roberto Bambach Ugarte', ejecutiva: 'Carolina', direccion: 'Avenida las Condes 9792', comuna: 'Las Condes', telefono: '9 4287 4454', email: 'PBAMBACH@hidroamerica.cl'},
    { rut: '78101236-K', nombre: 'LogÍstica Siete Robles Spa', representante: 'PATRICIO AURELIO RIVAS PUENTES', ejecutiva: 'Carolina', direccion: 'DIEZ NORTE 2314', comuna: 'TALCA', telefono: '964452706', email: 'logisticasieterobles@gmail.com'},
    { rut: '77490988-5', nombre: 'Transportes Doña Luciana SPA', representante: 'ROBERTO REBOLLEDO LABRAÑA', ejecutiva: 'Carolina', direccion: 'ALCIDES ROLDAN 1418', comuna: 'San Fernando', telefono: '9 6125 4302', email: 'roberto2730@hotmail.com'},
    { rut: '78190172-5', nombre: 'Mr Transportes Chile Spa', representante: 'MARIA DE LOS ANGELES SOLAR VARGAS', ejecutiva: 'Carolina', direccion: 'MIGUEL CLARO 119 DP 3 NULL', comuna: 'Providencia', telefono: '932492564', email: 'mr.transportes.chile@gmail.com'},
    { rut: '78040304-7', nombre: 'R PeÑa Spa', representante: 'Rodrigo Elias Peña Castillo', ejecutiva: 'Carolina', direccion: 'Concejala Berta Carvajal 8089', comuna: 'Cerrillos', telefono: '9 3873 7365', email: 'rpena3646@gmail.com'},
    { rut: '77390218-6', nombre: 'Sociedad de Transportes Jole SPA', representante: 'Juan Octavio Lillo Espinoza', ejecutiva: 'Carolina', direccion: 'Carlos Palacios 228', comuna: 'Bulnes', telefono: '9 4049 2462', email: 'flillo@lfconsulting.cl'},
    { rut: '76447559-3', nombre: 'Tello Y Tello Transportes Spa', representante: 'Mauricio Esteban Tello Reyes', ejecutiva: 'Carolina', direccion: 'Avda. Calera de Tango 0', comuna: 'Calera de Tango', telefono: '228172612', email: 'tello.mauricio@gmail.com'},
    { rut: '77416162-7', nombre: 'Tranportes  Por Carretara  JL SPA', representante: 'Juan Lopez Reyes', ejecutiva: 'Carolina', direccion: 'Julio Valenzuela 836', comuna: 'Buin', telefono: '9 6631 4314', email: 'ignacio_mania2@live.ccl'},
    { rut: '76848886-K', nombre: 'Transporte Brenet SPA', representante: 'Luz Betsabet Alfaro Brenet', ejecutiva: 'Carolina', direccion: 'Francisco Hidalgo 224', comuna: 'Peñaflor', telefono: '9 6829 4217', email: 'transportes.brenet@gmail.com'},
    { rut: '77772051-1', nombre: 'Transportes H & B Spa', representante: 'Daniel Esteban Orellana Muñoz', ejecutiva: 'Carolina', direccion: '24 ABRIL ST 72 LTB', comuna: 'Paine', telefono: '9 6407 7995', email: 'transporteshborellana@gmail.com'},
    { rut: '77441798-2', nombre: 'TRANSPORTE CARGA POR CARRETERA DG SPA', representante: 'DANILO ENRIQUE GAETE FUENZALIDA', ejecutiva: 'Carolina', direccion: 'FERNANDO TORTEROLO 1771 SENDERO 12 FASE 1', comuna: 'QUILLOTA', telefono: '963725085', email: 'gaetedanilo1967@gmail.com'},
    { rut: '78150214-6', nombre: 'Transportes Jsp Spa', representante: 'Juan Felix Saez Paredes', ejecutiva: 'Carolina', direccion: 'CALLE 3 DE ABRIL 461', comuna: 'Renaico', telefono: '9 4189 8175', email: 'juanfelix.sp@gmail.com'},
    { rut: '78165845-6', nombre: 'Transportes Matus Salen Spa', representante: 'Fabian Corona Figueroa', ejecutiva: 'Carolina', direccion: 'ALTOS DE MACHICURA PARCEL 50', comuna: 'Parral', telefono: '930966845', email: 'transportesmatussalen@gmail.com'},
    { rut: '77827992-4', nombre: 'Transporte Y  Comercializadora G Y R Spa', representante: 'Yosselin Elizabeth Reyes Garrido', ejecutiva: 'Carolina', direccion: 'Eulogio Robles 781', comuna: 'Linares', telefono: '9 6519 0198', email: 'jgonzalemartinez86@gmail.com'},
    { rut: '78156059-6', nombre: 'Transporte Yanina Ysabel Garcia Mora De Nakasone E.i.r.l.', representante: 'Yanina Ysabel Garcia de Nakasone', ejecutiva: 'Carolina', direccion: 'ABRANQUIL 1168 NULL QUINTA NORMAL', comuna: 'QUINTA NORMAL', telefono: '987887693', email: 'yaninatransportes@gmail.com'},
    { rut: '78087308-6', nombre: 'Transportes Roberto Estrada E.i.r.l', representante: 'Roberto Andrés Estrada Riquelme', ejecutiva: 'Carolina', direccion: 'LOS LIBERTADORES PP STA ANA PC 53 SN NULL', comuna: 'Til Til', telefono: '949194583', email: 'restrada.prevencion@gmail.com'},
    { rut: '77624057-5', nombre: 'Transportes Angelo Nicolas Carrasco Sanhueza EIRL', representante: 'Angelo Carrasco Sanhueza', ejecutiva: 'Carolina', direccion: 'Lautaro 740', comuna: 'Concepcion', telefono: '9 7907 0145', email: 'angelo.nicolas93@hotmail.com'},
    { rut: '77420673-6', nombre: 'Transportes Baeza SPA', representante: 'Carlos Alberto Baeza Infante', ejecutiva: 'Carolina', direccion: 'San Luis 841 Pueblo Antiguo', comuna: 'Pudahuel', telefono: '9 6668 5424', email: 'transportescarlosbaezai@gmail.com'},
    { rut: '78151772-0', nombre: 'Transportes Belen Spa', representante: 'HUGO DEMECIO TILLERIA HUECHE', ejecutiva: 'Carolina', direccion: 'AV LAS TORRES 250 CASA 97 NULL', comuna: 'Quilicura', telefono: '944786241', email: 'tilleria2121@gmail.com'},
    { rut: '78032375-2', nombre: 'Transportes Bosmann Spa', representante: 'Antonio Bosmann Soto', ejecutiva: 'Carolina', direccion: 'Malaquias concha 309', comuna: 'Paillaco', telefono: '9 3870 1739', email: 'trbosmann@gmail.com'},
    { rut: '77732652-K', nombre: 'Transportes Bricebor SPA', representante: 'Patricia Briceño Paez', ejecutiva: 'Carolina', direccion: 'Colombia 985', comuna: 'Vallenar', telefono: '9 8548 7796', email: 'paty_briceno@hotmail.com'},
    { rut: '77647991-8', nombre: 'Transportes Bryan Dinamarca Castillo E.i.r.l.', representante: 'Bryan Willian Dinamarca Castillo', ejecutiva: 'Carolina', direccion: 'Parcela n 30 Lote A Gabriela Mistral', comuna: 'La Serena', telefono: '9 4499 3574', email: 'transportebryandinamarca@gmail.com'},
    { rut: '77625968-3', nombre: 'Transportes Cale SPA', representante: 'Hugo Nuñez Toro', ejecutiva: 'Carolina', direccion: 'Villa los Castaños sitio 12', comuna: 'Curico', telefono: '9 3769 6652', email: 'transportescale.22@gmail.com'},
    { rut: '77664223-1', nombre: 'Transportes Cardenas  Limitada', representante: 'Oscar Alberto Cardenas Rojas', ejecutiva: 'Carolina', direccion: 'M Larrain 1154 BL 7 A DP Rolando Alarcon 0', comuna: 'Talagante', telefono: '965132690', email: 'transcar2025ltda@gmail.com'},
    { rut: '76494991-9', nombre: 'Transportes Carlos Marcelo Rebolledo Rojas Eirl', representante: 'Carlos Marcelo Rebolledo Rojas', ejecutiva: 'Carolina', direccion: 'Olegario Lazo 371', comuna: 'San Fernando', telefono: '9 7498 0078', email: 'p_pereirah@hotmail.com'},
    { rut: '77536347-9', nombre: 'Transportes Chocobar Spa', representante: 'WILSON HERNAN CHOCOBAR VASQUEZ', ejecutiva: 'Carolina', direccion: 'OSORNO 850 MZ 101 LT 19 TIERRAS BLANCAS', comuna: 'Coquimbo', telefono: '966644778', email: 'yakko.j7@gmail.com'},
    { rut: '76518447-9', nombre: 'Transportes De Carga Jocelyn Carolina Silva Rojas Eirl', representante: 'Jocelyn Carolina Silva Rojas', ejecutiva: 'Carolina', direccion: 'Barrales 234', comuna: 'Melipilla', telefono: '9 3243 4254', email: 'transportesacr@yahoo.com'},
    { rut: '78029819-7', nombre: 'Transportes Doble Jj Spa', representante: 'Israel Ariel Pradenas PiÑeiro', ejecutiva: 'Carolina', direccion: 'Jose Leyan 1228', comuna: 'Talagante', telefono: '933638547', email: 'transportesdoblejj@gmail.com'},
    { rut: '77401369-5', nombre: 'Transportes Domingo Alberto Cerda Lagos E.i.r.l.', representante: 'Domingo Cerda Lagos', ejecutiva: 'Carolina', direccion: 'Dr. Adan Henriquez S 03991', comuna: 'San Fernando', telefono: '9 6607 6722', email: 'msoledadpavezf@gmail.com'},
    { rut: '77822803-3', nombre: 'TRANSPORTES FELIPE ANDRÉS SARRIA JIMÉNEZ E.I.R.L.', representante: 'FELIPE ANDRES SARRIA JIMENEZ', ejecutiva: 'Carolina', direccion: 'AV. SAN LUIS 15 -- 76 CS 76 BARRIO EL ALBA 4', comuna: 'Lampa', telefono: '930679958', email: 'felipe2925@gmail.com'},
    { rut: '76994334-K', nombre: 'Transportes Fernando Patricio Valdes Silva Eirl', representante: 'Fernando Patricio Valdes Silva', ejecutiva: 'Carolina', direccion: 'Las Azucenas 1994', comuna: 'Santiago', telefono: '9 4401 9637', email: 'transportesfernandovaldeseirl@gmail.com'},
    { rut: '77624569-0', nombre: 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL', representante: 'Ivan Diaz Rivas', ejecutiva: 'Carolina', direccion: 'Avda Costanera 1174', comuna: 'San Pedro de la Paz', telefono: '9 5188 8374', email: 'idiaz9252@gmail.com'},
    { rut: '77941312-8', nombre: 'TRANSPORTES J&F SPA', representante: 'Daniel Esteban Orellana Muñoz', ejecutiva: 'Carolina', direccion: '24 de Abril St 72 lt b', comuna: 'Paine', telefono: '9 6407 7995', email: 'transporteshborellana@gmail.com'},
    { rut: '78244173-6', nombre: 'Transportes Jme Spa', representante: 'John Francisco Jofre Gomez', ejecutiva: 'Carolina', direccion: 'LOS FLAMENCOS 965 MEDIA HACIENDA NULL', comuna: 'Ovalle', telefono: '975522197', email: 'johnfranci0511@gmail.com'},
    { rut: '78165268-7', nombre: 'Transportes Jq Spa', representante: 'Jhon Sebastian Quiroga Esparza', ejecutiva: 'Carolina', direccion: 'PJE VALLE DEL SOL PNTE 2122 PQUE EL SOL NULL PADRE HURTADO', comuna: 'PADRE HURTADO', telefono: '986292130', email: 'sebas.sparza@gmail.com'},
    { rut: '77503624-9', nombre: 'Transportes Jrm E Hijos Limitada', representante: 'Jimena Andrea Herminia Molinet Lillo', ejecutiva: 'Carolina', direccion: 'Pje santa cruz 721, villa larqui', comuna: 'Bulnes', telefono: '9 4068 4436', email: 'ximenamolinet.35@gmail.com'},
    { rut: '78351383-8', nombre: 'Transportes L.y. R Spa', representante: 'JUAN CARLOS LOPEZ DIAZ', ejecutiva: 'Carolina', direccion: 'HERMANO DOMINGO 01485 HNOS DE LA SALLE NULL 01485', comuna: 'Puente alto', telefono: '992788524', email: 'ignacio_mania2@live.cl'},
    { rut: '77889348-7', nombre: 'Transportes Mad Spa', representante: 'Hector Rene Ortiz Gonzalez', ejecutiva: 'Carolina', direccion: 'PSJ LOS MANIOS 2022', comuna: 'TALCA', telefono: '9 4967 1430', email: 'michel_jm@hotmail.cl'},
    { rut: '78113086-9', nombre: 'Transportes Maxsu Limitada', representante: 'ROBERTO EUGENIO SUAREZ LOPEZ', ejecutiva: 'Carolina', direccion: 'LA ATAJADA 645 EL RODEO', comuna: 'HUECHURABA', telefono: '941798421', email: 'Transportesmaxsu@gmail.com'},
    { rut: '77531127-4', nombre: 'TRANSPORTES MICHELL ALEXANDER BRAVO ARAYA E.I.R.L', representante: 'Michell Alexander Bravo Araya', ejecutiva: 'Carolina', direccion: 'Casma 634', comuna: 'San Miguel', telefono: '963739068', email: 'transportes.michell.bravo@gmail.com'},
    { rut: '77896328-0', nombre: 'Transportes Ms Spa', representante: 'Felipe Francisco Miranda Amaya', ejecutiva: 'Carolina', direccion: 'VOLCAN EL MIRADOR 189 SAN ENRIQUE', comuna: 'Quilicura', telefono: '987301778', email: 'transportesms.1928@gmail.com'},
    { rut: '76891488-5', nombre: 'Transportes Myz Spa', representante: 'Oscar Martinez Arriagada', ejecutiva: 'Carolina', direccion: 'San Antonio 385', comuna: 'Santiago', telefono: '9 3122 9434', email: 'oscarmartinez.a@gmail.com'},
    { rut: '78310280-3', nombre: 'Transportes Olmo Vega Spa', representante: 'HUGO CAMILO OLMOS VEGA', ejecutiva: 'Carolina', direccion: 'RIO COPIAPÓ 9558', comuna: 'Pudahuel', telefono: '932248782', email: 'camiloolmos946@gmail.com'},
    { rut: '78232853-0', nombre: 'Transportes Punolaf Lopez Spa', representante: 'Segundo German Punolaf Queupumil', ejecutiva: 'Carolina', direccion: 'AGUSTINAS 1442 DP 402 NULL', comuna: 'Santiago', telefono: '947542370', email: 'Punolafgerman55@gmail.com'},
    { rut: '77287076-0', nombre: 'Transportes Rene Ernesto Quiroz Rosales E.i.r.l.', representante: 'Rene Ernesto Quiroz Rosales', ejecutiva: 'Carolina', direccion: 'Lucero del Alba St48 V', comuna: 'Calera de Tango', telefono: '9 4221 3307', email: 'renequirozcamionero@gmail.com'},
    { rut: '77016329-3', nombre: 'Transportes Ruben Hernan Silva Vasquez E.i.r.l', representante: 'Ruben Hernan Silva Vasquez', ejecutiva: 'Carolina', direccion: 'Monjitas 550', comuna: 'Santiago', telefono: '936170659', email: 'silvarubem600@gmail.com'},
    { rut: '77893331-4', nombre: 'TRANSPORTES SERGIO SIMONCELLI E.I.R.L', representante: 'Sergio Manuel Simoncelii Rey', ejecutiva: 'Carolina', direccion: 'Gran Avenida 4697 depto 1614', comuna: 'San Miguel', telefono: '9 5402 9356', email: 'transportescvalencia@gmail.com'},
    { rut: '77325414-1', nombre: 'Transportes Suyai Spa', representante: 'NICOLE CAROLINA CASTRO MUNOZ', ejecutiva: 'Carolina', direccion: 'SOFIA CARMONA 051 DP 401 G SOFIA TRES G 401', comuna: 'La Granja', telefono: '963936326', email: 'transportes.suyai.chile@gmail.com'},
    { rut: '76970026-9', nombre: 'TRANSPORTES TRANS-LYON SPA', representante: 'Marcelo Eduardo LeÓn Salvatierra', ejecutiva: 'Carolina', direccion: 'Caleta Buena 9413, Campo Verde', comuna: 'La Florida', telefono: '9 5715 8438', email: 'edubeo@gmail.com'},
    { rut: '78259175-4', nombre: 'Transportes Verpo Spa', representante: 'Manuel Humberto Poza Torres', ejecutiva: 'Carolina', direccion: '4 NORTE 265 C 195', comuna: 'San Pedro de la paz', telefono: '979366530', email: 'poza2102@gmail.com'},
    { rut: '77926368-1', nombre: 'TRANSPORTES WEREK SPA', representante: 'Rene Ignacio Henriquez Rivas', ejecutiva: 'Carolina', direccion: 'Psje los Manios 2022, Barrio la Foresta', comuna: 'Talca', telefono: '9 4967 1430', email: 'michel_jm@hotmail.cl'},
    { rut: '77920451-0', nombre: 'TRANSPORTES Y LOGISTICA SERPA SPA', representante: 'Sergio Antonio Figueroa Pinochet', ejecutiva: 'Carolina', direccion: 'Mario Bahamonde 7865', comuna: 'San Pedro de la Paz', telefono: '9 4612 2105', email: 'paula.bucarey.o@gmail.com'},
    { rut: '78099193-3', nombre: 'Transportes Yuyo Spa', representante: 'Raul Abraham Pena Calabrano', ejecutiva: 'Carolina', direccion: 'Pje Pasadena 1000 MZ 2 LT 3', comuna: 'Los Angeles', telefono: '9 2746 8487', email: 'raul.ap.c1993@gmail.com'},
    { rut: '77806154-6', nombre: 'ZF TRANSPORTES SPA', representante: 'Eduardo Andres Zuñiga Luengo', ejecutiva: 'Carolina', direccion: 'San Antonio Lt2 a', comuna: 'Linares', telefono: '9 8475 8779', email: 'edu223andres@gmail.com'},
    { rut: '78032949-1', nombre: 'CLASSIC TRUCK TRANSPORT SPA', representante: 'JOSE DAVID ESPINOZA CASTRO', ejecutiva: 'Cecilia', direccion: 'CAMINO PAINE LONQUEN 4837 ST 1 -B LT D BUIN', comuna: 'Santiago', telefono: '938937758', email: 'jose4837@gmailcom'},
    { rut: '7321424-6', nombre: 'Fernando del Carmen Araya Araya', representante: 'Fernando Del Carmen Araya Araya', ejecutiva: 'Cecilia', direccion: 'Lago Ranco N°734 Villa Los Lagos', comuna: 'Panguipulli', telefono: '947458117', email: 'macasf06@hotmailcom'},
    { rut: '77492287-3', nombre: 'Lar Spa', representante: 'Luis Angel Rodriguez Chacon', ejecutiva: 'Cecilia', direccion: 'Pasaje Chonos 1376', comuna: 'Conchalí', telefono: '959411152', email: 'luaro58@outlookcom'},
    { rut: '77007552-1', nombre: 'Sociedad De Transportes Km Limitada', representante: 'Luis Hernan Iturriaga Barahona', ejecutiva: 'Cecilia', direccion: 'Corregidor de Calca 1116 Pedro de Oña', comuna: 'Isla De Maipo', telefono: '959411152', email: 'claxel1970@hotmailcom'},
    { rut: '76491308-6', nombre: 'Sociedad De Transportes Y Servicios Moreno Y Lopez Limitada', representante: 'Leonardo Antonio Moreno Medina', ejecutiva: 'Cecilia', direccion: 'Pasaje Parque Los Ciprece 2841, Nueva Vida', comuna: 'Alto Hospicio', telefono: '993316895', email: 'leonardo_antonio24@hotmailcom'},
    { rut: '77435776-9', nombre: 'Transporte De Carga Jose Rodrigo Burgos MuÑoz E.i.r.l.', representante: 'Jose Rodrigo Burgos Muñoz', ejecutiva: 'Cecilia', direccion: 'La Estrella 1070', comuna: 'Pudahuel', telefono: '977100258', email: 'joroburgos@hotmailcom'},
    { rut: '76303728-2', nombre: 'Transporte De Carga Por Carretera Juan Carlos Araya Rodriguez Eirl', representante: 'Juan Carlos Araya Rodriguez', ejecutiva: 'Cecilia', direccion: 'Avda Jorge Giacaman N°122, Villa San Ramon Palomares', comuna: 'Lampa', telefono: '962186221', email: 'transportesdyh@gmail.com'},
    { rut: '76902431-k', nombre: 'Transporte De Carga Por Carretera Rudy David Mora Morales Eirl', representante: 'Rudy David Mora Morales', ejecutiva: 'Cecilia', direccion: 'Las Carabelas # 2002 Villa 5° Centenario', comuna: 'Mariquina', telefono: '950754064', email: 'rudymoram@gmailcom'},
    { rut: '77856341-K', nombre: 'Transporte De Carga Raul Erasmo Chandia  ZuÑiga E.i.r.l.', representante: 'Raul Erasmo Chandia Zuñiga', ejecutiva: 'Cecilia', direccion: 'Roto Chileno Sitio N 19 Dpto 2 Villa 3', comuna: 'Talagante', telefono: '930165437', email: 'chandicar@gmailcom'},
    { rut: '78129079-3', nombre: 'Transporte De Carga Venegas Y Otro Limitada', representante: 'Fernando Antonio Venegas Sandoval', ejecutiva: 'Cecilia', direccion: 'CALLEJÓN BUSTAMANTE 000 SECTOR LAS CHILCAS', comuna: 'Chillan', telefono: '959167179', email: 'fernando.venegas13@gmail.com'},
    { rut: '77502623-5', nombre: 'TRANSPORTE FRANCISCO OYANADEL RAMOS SPA', representante: 'Francisco Javier Oyanadel Ramos', ejecutiva: 'Cecilia', direccion: 'PJE FLOR DEL COBRE 5344 LA FLORIDA ETAPA IV', comuna: 'La Serena', telefono: '973957367', email: 'oyanadeljavier54@gmail.com'},
    { rut: '78001651-5', nombre: 'TRANSPORTE J Y D VERDEJO SPA', representante: 'DIEGO MAURICIO VERDEJO ROBLES', ejecutiva: 'Cecilia', direccion: 'RIGOLEMO 00 MALLOA', comuna: 'Malloa', telefono: '940231167', email: 'diegoverdejorobles@gmailcom'},
    { rut: '78099333-2', nombre: 'Transporte Js Spa', representante: 'Juan Rodolfo Soto Zuñiga', ejecutiva: 'Cecilia', direccion: 'Davila Rodriiguez Lote 2 Los Marcos San Francisco De Mostazal', comuna: 'San FcoMostazal', telefono: '964898367', email: 'juan_soto5050@hotmailcom'},
    { rut: '77505286-4', nombre: 'Transporte Matisaurio Spa', representante: 'Matias Jose Rubio Galaz', ejecutiva: 'Cecilia', direccion: 'Lt 4 De St Pp San Juan La Hacienda Olivar', comuna: 'Olivar', telefono: '989397322', email: 'transportesmatisaurio@gmailcom'},
    { rut: '77496396-0', nombre: 'Transporte Nelson Rodomir Sepulveda E.i.r.l.', representante: 'Sepulveda Nelson', ejecutiva: 'Cecilia', direccion: 'Nuevos Campos 8850 Lta 2 Silos De Tunca Graneros', comuna: 'Graneros', telefono: '944064878', email: 'nelson.rodomir.sepulveda@gmail.com'},
    { rut: '77642747-0', nombre: 'Transporte Santa Elena Spa', representante: 'Juan Bautista Amaya Figueroa', ejecutiva: 'Cecilia', direccion: 'Mz E Lt 6 Lora Lora', comuna: 'Licanten', telefono: '943523282', email: 'jlamayaalbornoz1991@gmailcom'},
    { rut: '76851961-7', nombre: 'Transporte Y Arriendo De Camion Pablo Cesar Silva San Martin Spa', representante: 'Pablo Cesar Silva San Martin', ejecutiva: 'Cecilia', direccion: 'Independencia 646', comuna: 'Tucapel', telefono: '934197744', email: 'transportes.pablosilvasm@gmail.com'},
    { rut: '78365117-3', nombre: 'Transportes Almendra Y Roco Spa', representante: 'HUGOLINO OSCAR D\'APREMONT FUENTES', ejecutiva: 'Cecilia', direccion: 'VICTOR CUCCUINI 139', comuna: 'Recoleta', telefono: '9 4415 1118', email: 'anaolate6@gmail.com'},
    { rut: '77656577-6', nombre: 'Transportes Cristina Aguirre Spa', representante: 'Cristina Adriana Aguirre Sobrecuevas', ejecutiva: 'Cecilia', direccion: 'Sgto. Aldea 906', comuna: 'Padre Hurtado', telefono: '56992593093', email: 'Pablo_briones@live.cl'},
    { rut: '77974457-4', nombre: 'Transportes Arlette Spa', representante: 'Jaime Ismael Astroza Rodríguez', ejecutiva: 'Cecilia', direccion: 'Carmen Covarrubias 32 Of 512 Nunoa', comuna: 'Santiago', telefono: '923926847', email: 'astrozajaime@gmailcom'},
    { rut: '77965304-8', nombre: 'Transportes De Carga Hernan Segundo Cabrera Avila E.i.r.l', representante: 'Hernan Segundo Cabrera Avila', ejecutiva: 'Cecilia', direccion: 'Luis Mayol 001 Poblacion Padre Hurtado', comuna: 'Chimbarongo', telefono: '56987439336', email: 'cabrerahernan5668@gmail.com'},
    { rut: '77949497-7', nombre: 'TRANSPORTES KAISER SPA', representante: 'Hector Rodrigo Garcia Quintana', ejecutiva: 'Cecilia', direccion: 'Paseo Huerfanos 1055 503', comuna: 'Santiago', telefono: '56942722979', email: 'contabilidad@cynasesorias.com'},
    { rut: '77374557-9', nombre: 'Transportes Carlos  GonzÁlez Loyola E.i.r.l.', representante: 'Carlos Alberto Gonzalez Loyola', ejecutiva: 'Cecilia', direccion: 'Salvador Allende 32 Pedro Aguirre Cerda', comuna: 'Puente Alto', telefono: '935603611', email: 'carlos.gloyola@gmail.com'},
    { rut: '77890332-6', nombre: 'Transportes Carlos Castillo MiÑano E.i.r.l.', representante: 'Carlos Alberto Castillo Miñano', ejecutiva: 'Cecilia', direccion: 'Pje Volc Marmolejo 840 D- 2 Valle Norte Iv Lampa', comuna: 'Lampa', telefono: '993217064', email: 'carlos19castillo70@gmailcom'},
    { rut: '76826483-K', nombre: 'Transportes Carlos Rene Cornejo Molina E.i.r.l.', representante: 'Carlos Rene Cornejo Molina', ejecutiva: 'Cecilia', direccion: 'Pasaje Creta, Villa Parque Industrial 662', comuna: 'Talagante', telefono: '998411537', email: 'Carloscornejomo@gmailcom'},
    { rut: '78132030-7', nombre: 'Transportes Claudio Painequeo E.i.r.l.', representante: 'Claudio Alejandro Painequeo Concha', ejecutiva: 'Cecilia', direccion: 'Jose Tomas Ovalle 143 Talagante', comuna: 'Talagante', telefono: '963425496', email: 'claudiopaineq@gmailcom'},
    { rut: '77373865-3', nombre: 'Transportes Claudio Vilogron Paredes E.i.r.l.', representante: 'Claudio Antonio Dionisio Vilogron Paredes', ejecutiva: 'Cecilia', direccion: 'P Valdivia 182 America I', comuna: 'Paine', telefono: '998493641', email: 'claudiovilogron@gmail.com'},
    { rut: '77489241-9', nombre: 'Transportes Cruz Spa', representante: 'Eduardo Felipe Cruz Molina', ejecutiva: 'Cecilia', direccion: 'EL OLIMPO 1528 V EL OLIMPO NULL', comuna: 'Maipu', telefono: '963510774', email: 'efcruzmolina@gmail.com'},
    { rut: '77569357-6', nombre: 'Transportes De Carga  Cya  Spa', representante: 'Jorge Humberto Castillo Perez', ejecutiva: 'Cecilia', direccion: 'Panamericana sur km 41 parcela 114', comuna: 'Paine', telefono: '935042369', email: 'jorgecastillo23816@gmailcom'},
    { rut: '76987117-9', nombre: 'Transportes De Carga Magaly Rocio AÑorga Huerta E.i.r.l.', representante: 'Magaly Rocio Añorga Huerta', ejecutiva: 'Cecilia', direccion: 'QUEMCHI 5836 ROBERT KENNEDY', comuna: 'ESTACION CENTRAL', telefono: '959312065', email: 'nachito.2115@gmail.com'},
    { rut: '76977185-9', nombre: 'Transportes Eduardo Alarcon Empresa Individual De Responsabilidad Li', representante: 'Eduardo Benjamin Alarcon Espinoza', ejecutiva: 'Cecilia', direccion: 'Los Claveles 1451 Villa El Bosque', comuna: 'Quinchao', telefono: '986081662', email: 'eduardobenja2007@gmailcom'},
    { rut: '77377507-9', nombre: 'Transportes Eric Darat E.i.r.l.', representante: 'Eric Henry Darat Ramirez', ejecutiva: 'Cecilia', direccion: 'Pasaje Tarragona 1486 V Galilea F 1', comuna: 'Curico', telefono: '983843935', email: 'fmezacanales@gmailcom'},
    { rut: '78089406-7', nombre: 'Transportes Evem Spa', representante: 'Veronica Del Pilar Panes Lopez', ejecutiva: 'Cecilia', direccion: 'Lalo Parra 16 Lt 10 -m 10 Bicentenario Cabrero', comuna: 'Cabrero', telefono: '998260911', email: 'pilarveronicapanes@gmailcom'},
    { rut: '77849029-3', nombre: 'Transportes Expresso Ignacio Spa', representante: 'JESSICA IDA PLAZA PLAZA', ejecutiva: 'Cecilia', direccion: 'Hij La Chunga Lote 92 Null', comuna: 'La Serena', telefono: '951787205', email: 'Tr.ignaciospa28@gmail.com'},
    { rut: '77401233-8', nombre: 'Transportes Felipe Andres Rex Villalobos E.i.r.l.', representante: 'Felipe Andres Rex Villalobos', ejecutiva: 'Cecilia', direccion: 'General Jose Villagra 8086 33 Lo Prado', comuna: 'Lo Prado', telefono: '974405765', email: 'feliperexvillalobos@gmail.com'},
    { rut: '77375352-0', nombre: 'Transportes Fernando Darat Candia E.i.r.l.', representante: 'Fernando Edinson Darat Candia', ejecutiva: 'Cecilia', direccion: 'V Cordillera Pj 6 516 LT 1 B', comuna: 'San Clemente', telefono: '997407947', email: 'fdarat@hotmail.com'},
    { rut: '77032978-7', nombre: 'TRANSPORTES FLOR VALLADARES SPA', representante: 'Flor Del Carmen Valladares Lopez', ejecutiva: 'Cecilia', direccion: 'PINTOR JUAN FRANCISCO GON 343 ILUSIONES COMPARTIDA MELIPILLA', comuna: 'Santiago', telefono: '966794362', email: 'transflova@gmailcom'},
    { rut: '78027318-6', nombre: 'TRANSPORTES GERMAN EDUARDO PARDO ANTIHUAL E.I.R.L', representante: 'German Eduardo Pardo Antihual', ejecutiva: 'Cecilia', direccion: 'GUARDIA VIEJA 202 OF 403 4P PROVIDENCIA', comuna: 'Santiago', telefono: '935833823', email: 'gpardotransportes@gmailcom'},
    { rut: '77499811-K', nombre: 'Transportes Jahdiel Spa', representante: 'Marco Antonio Sanhueza Espino', ejecutiva: 'Cecilia', direccion: 'Avda Chile 14', comuna: 'San Bernardo', telefono: '972909188', email: 'marcosanhuezaespino@gmailcom'},
    { rut: '77495891-6', nombre: 'TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L', representante: 'Jhon Chavarria Muñoz', ejecutiva: 'Cecilia', direccion: 'Los Maitenes s/n volcan', comuna: 'Vilcun', telefono: '979939809', email: 'jhonyteperman@gmailcom'},
    { rut: '78283626-9', nombre: 'Transportes Jkarimv Spa', representante: 'JAMYR AJMED KARIM VARGAS', ejecutiva: 'Cecilia', direccion: 'REGIMIENTO COQUIMBO 060 PARTE ALTA NULL', comuna: 'Coquimbo', telefono: '986545451', email: 'j.karim.v@icloud.com'},
    { rut: '77377829-9', nombre: 'TRANSPORTES JOSE MIGUEL ALARCON SpA', representante: 'Jose Miguel Alarcon Aguilera', ejecutiva: 'Cecilia', direccion: 'Panamericana sur km 41 parcela 114', comuna: 'Paine', telefono: '963959732', email: 'vogelyalarcon@gmailcom'},
    { rut: '78057959-5', nombre: 'Transportes Jota Castillo Spa', representante: 'Jose Felix Castillo Oyarzo', ejecutiva: 'Cecilia', direccion: 'Pje Gilberto Rojas 2258 B Del Boldo 4 Curico', comuna: 'Curico', telefono: '987547915', email: 'trasportesjotacastillo@gmail.com'},
    { rut: '77992492-0', nombre: 'TRANSPORTES JUAN AGUILAR VALENZUELA EIRL', representante: 'Juan German Aguilar Valenzuela', ejecutiva: 'Cecilia', direccion: 'PJE IRMA OYARZO 77 JOSE M CARRERA 2', comuna: 'Santiago', telefono: '944926813', email: 'germanaguilarv@gmailcom'},
    { rut: '76903711-K', nombre: 'Transportes Jyr Spa', representante: 'Luis Hernan Jara Gonzalez', ejecutiva: 'Cecilia', direccion: 'Pasaje Rio Yelcho 188 Villa Los Ríos', comuna: 'Panguipulli', telefono: '977570705', email: 'ljg1509@hotmail.cl'},
    { rut: '76507104-6', nombre: 'TRANSPORTES LOS ALAMOS LIMITADA', representante: 'Andres Fernando Cardenas Neira', ejecutiva: 'Cecilia', direccion: 'CALLE LA VENDIMIA 1322 VILLA LOS ALAMOS', comuna: 'Padre Hurtado', telefono: '989205300', email: 'andrucane@gmailcom'},
    { rut: '77389829-4', nombre: 'Transportes Manuel  Perez Vilches E.i.r.l.', representante: 'Manuel Natalio Pérez Vilches', ejecutiva: 'Cecilia', direccion: 'Pj a blest gana 0379 ST 202 belgica', comuna: 'La Granja', telefono: '991351497', email: 'manuelnperezvilches@gmailcom'},
    { rut: '77672752-0', nombre: 'Transportes Mauricio Lastra Azocar E.i.r.l', representante: 'Mauricio Eduardo Lastra Azocar', ejecutiva: 'Cecilia', direccion: 'LA GRANJA PC 16 LOTE 2-B RETIRO', comuna: 'Retiro', telefono: '949880408', email: 'mauriciolastraazocar@gmailcom'},
    { rut: '77400529-3', nombre: 'Transportes Miguel Angel Sepulveda Verdugo Spa', representante: 'Miguel Angel Sepulveda Verdugo', ejecutiva: 'Cecilia', direccion: '17 Med pte 0923 Jardin del Valle', comuna: 'Talca', telefono: '994516466', email: 'denisesepulvedas@gmailcom'},
    { rut: '78100599-1', nombre: 'Transportes Milady Spa', representante: 'Milady Alejandra Ibañez Carvajal', ejecutiva: 'Cecilia', direccion: 'Pas Pilmaiquen 1121 Renca', comuna: 'Renca', telefono: '978416671', email: 'milyalejandraibanezc@gmailcom'},
    { rut: '78125401-0', nombre: 'Transportes Miranda Y Bravo Limitada', representante: 'Marta Carolina Miranda Ovalle', ejecutiva: 'Cecilia', direccion: 'Las Nevadas 417', comuna: 'El Bosque', telefono: '998004133', email: 'carolinamirandaovalle@gmailcom'},
    { rut: '78157982-3', nombre: 'Transportes Navarro Spa', representante: 'PEDRO ENRIQUE NAVARRO DELGADO', ejecutiva: 'Cecilia', direccion: 'BERNARDO O\'HIGGINS 2797', comuna: 'TALAGANTE', telefono: '952876425', email: 'pnavarrod32@gmail.com'},
    { rut: '78295014-2', nombre: 'Transportes Nino Spa', representante: 'NINO ALVARO PINZAS JULCA', ejecutiva: 'Cecilia', direccion: 'AMERICA INDIGENA 2248', comuna: 'Cerrillos', telefono: '981207845', email: 'pinzasnino1@gmail.com'},
    { rut: '77986483-9', nombre: 'TRANSPORTES OPTIMUM SPA', representante: 'Álvaro EfraÍn Madrid Reyes', ejecutiva: 'Cecilia', direccion: 'MEXICO 01892 LO ESPEJO', comuna: 'Santiago', telefono: '972955712', email: 'madridalvaro112@gmail.com'},
    { rut: '78000781-8', nombre: 'TRANSPORTES PABLO PEREZ SPA', representante: 'PABLO ANDRES PEREZ URRUTIA', ejecutiva: 'Cecilia', direccion: 'FUNDO SAN JUAN LOTE DOS 2', comuna: 'Mulchen', telefono: '959300289', email: 'transportesperezu@gmailcom'},
    { rut: '77425212-6', nombre: 'Transportes Patricio Romo Moreno E.i.r.l.', representante: 'Patricio Enrique Romo Moreno', ejecutiva: 'Cecilia', direccion: 'Panamericana sur km 41 parcela 114', comuna: 'Paine', telefono: '953132168', email: 'pato370c1@gmail.com'},
    { rut: '77703639-4', nombre: 'Transportes Pecort Spa', representante: 'Marisel Haydee Gonzalez Varas', ejecutiva: 'Cecilia', direccion: 'Pasaje Estero De Hunta 385', comuna: 'Coquimbo', telefono: '968413432', email: 'pedro.cortes.rojas79@gmail.com'},
    { rut: '77509381-1', nombre: 'Transportes Reyes Quintero SPA', representante: 'Alvaro Sebastian Reyes Alfaro', ejecutiva: 'Cecilia', direccion: 'Panamericana sur km 41 parcela 114', comuna: 'Paine', telefono: '935431034', email: 'transportesreyesquintero@gmailcom'},
    { rut: '77843013-4', nombre: 'TRANSPORTES RICHARD AGUILERA CONTRERAS E.R.I.L', representante: 'Richard Antonio Aguilera Contreras', ejecutiva: 'Cecilia', direccion: 'HORNITOS 0859 PUENTE ALTO', comuna: 'Santiago', telefono: '953337063', email: 'RICHARDAGUILERA0859@GMAILCOM'},
    { rut: '77413603-7', nombre: 'Transportes Rodmac Spa', representante: 'Rodrigo Araya Riquelme', ejecutiva: 'Cecilia', direccion: 'Jorge Giacaman 122 palomares', comuna: 'Concepción', telefono: '993279277', email: 'transportesrodmacspa@gmailcom'},
    { rut: '78302429-2', nombre: 'Transportes San Lorenzo Spa', representante: 'LORENZO EDUARDO CHANDIA SALAZAR', ejecutiva: 'Cecilia', direccion: 'JUAN PABLO II 317 MAULE', comuna: 'Maule', telefono: '964829208', email: 'trans.chandia@gmail.com'},
    { rut: '77848908-2', nombre: 'TRANSPORTES WALDO SALDAÑO E.I.R.L.', representante: 'Waldo Agustin SaldaÑo Baez', ejecutiva: 'Cecilia', direccion: 'BOMBERO SALAS 1445 DP 402 SANTIAGO', comuna: 'Maipú', telefono: '961502033', email: 'waldosaldano360@gmailcom'},
    { rut: '77931594-0', nombre: 'Transportes Y Servicios Fs Spa', representante: 'Fernando Gonzalo Sabando Manriquez', ejecutiva: 'Cecilia', direccion: 'Pje 6 162 Valle Del Sol Chgte', comuna: 'Chiguayante', telefono: '957053373', email: 'transportesabando@gmailcom'},
    { rut: '78115034-7', nombre: 'Transportes Y Servicios Jenavama Spa', representante: 'Malco Agabo Cespedes Manquez', ejecutiva: 'Cecilia', direccion: 'Pasaje El Álamo 14 Santa MÓnica', comuna: 'Padre Hurtado', telefono: '996822315', email: 'cespedesmalco@gmaillcom'},
    { rut: '77369887-2', nombre: 'TRANSSAMY SPA', representante: 'Raul Miguel Panes Lopez', ejecutiva: 'Cecilia', direccion: 'PABLO NERUDA 140 LT 01 M 9 BICENTENARIO CABRERO', comuna: 'Los Angeles', telefono: '966558687', email: 'TRANSSAMY06@GMAILCOM'},
    { rut: '78293071-0', nombre: 'Transportes Zura Spa', representante: 'Genaro Francisco Zurita Hernandez', ejecutiva: 'Cecilia', direccion: 'AV AMÉRICA 1084 NULL', comuna: 'San Bernardo', telefono: '56961695562', email: 'zuritagenaro267@gmail.com'},
    { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', representante: 'Cristian Mauricio Jimenez Reyes', ejecutiva: 'Daniela', direccion: 'Quinchamali 14141', comuna: 'Lo Barnechea', telefono: '972741479', email: 'camionerojimenez55@gmail.com'},
    { rut: '77590685-5', nombre: 'Hisan Spa', representante: 'Victor Rogelio San Martin Campos', ejecutiva: 'Daniela', direccion: 'Las Tijeras Lote 17', comuna: 'Coihueco', telefono: '997362809', email: 'consultoranyt@gmail.com'},
    { rut: '76901231-1', nombre: 'inversiones  Allende Limitada', representante: 'Nibaldo Andres Rossel Allende', ejecutiva: 'Daniela', direccion: 'Llaveria El Durazno S/N', comuna: 'Las Cabras', telefono: '985030321', email: 'andyjak_182@gmail.com'},
    { rut: '77058007-2', nombre: 'Jose Antonio Puebla  Quezada  Spa', representante: 'Jose Antonio Puebla Quezada', ejecutiva: 'Daniela', direccion: 'Calle Estacion Sitio 4 N° 1175 Monte Negro', comuna: 'Til-Til', telefono: '926006921', email: 'josepuebla0@gmail.com'},
    { rut: '76685344-7', nombre: 'Sociedad De Transportes Baguales Spa', representante: 'Arturo Alejandro Herrera Giadala', ejecutiva: 'Daniela', direccion: 'Avenida Los Urbanistas 961, Altos de Mirasur', comuna: 'Temuco', telefono: '994432449', email: 'arturoherreragiadala@yahoo.es'},
    { rut: '78101306-4', nombre: 'Tmp Transportes Spa', representante: 'Alfredo Nicolas Hidalgo Aravena', ejecutiva: 'Daniela', direccion: 'Pasaje El Higueral 6460', comuna: 'La Florida', telefono: '946814861', email: 'alfredoaero@gmail.com'},
    { rut: '76878075-7', nombre: 'Translainer SPA', representante: 'Carlos Felipe Fuentealba Ordenes', ejecutiva: 'Daniela', direccion: 'Essbio 111, Villa España', comuna: 'Cabrero', telefono: '953082987', email: 'translainerspa@gmail.com'},
    { rut: '76819041-0', nombre: 'Transporte Daniela Fernandez Buosi EIRL', representante: 'Daniela Andrea Fernandez Buosi', ejecutiva: 'Daniela', direccion: 'Pasaje 8 N° 5379 4A', comuna: 'San Miguel', telefono: '964468447', email: 'transvyf@gmail.com'},
    { rut: '77143848-2', nombre: 'Transporte De Carga Johanna Del Pilar Alvarez Caneo E.i.r.l.', representante: 'Johanna del Pilar Alvarez Caneo', ejecutiva: 'Daniela', direccion: 'Pasaje Las Carretas 908', comuna: 'Talagante ', telefono: '942810314', email: 'ja296872@gmail.com'},
    { rut: '77709716-4', nombre: 'Transporte Mapirito Spa', representante: 'Crismara Peña de Nuñez', ejecutiva: 'Daniela', direccion: 'Morande 835 piso 5 Oficina 518', comuna: 'Santiago', telefono: '976854861', email: 'transportemapirito@gmail.com'},
    { rut: '78208706-1', nombre: 'Transporte Roberto Lopez H. E.i.r.l.', representante: 'Roberto Alonso Lopez Hernandez', ejecutiva: 'Daniela', direccion: 'MORANDE 835 P 5 OF518 NULL SANTIAGO', comuna: 'Santiago', telefono: '985362683', email: 'Kiwi1_71@hotmail.com'},
    { rut: '77844986-2', nombre: 'TRANSPORTES  HAKUNA MATATA  SPA', representante: 'Shakira Barker', ejecutiva: 'Daniela', direccion: 'Pasaje Parque Nacional Queulat 4046', comuna: 'Puerto Montt', telefono: '957796432', email: 'sconta1977@gmail.com'},
    { rut: '77742801-2', nombre: 'transportes  y logistica  jose mariano  benitez  vega spa', representante: 'Jose Mariano Benitez Vega', ejecutiva: 'Daniela', direccion: 'Calle Delfin Muñoz 45, Monte Aguila', comuna: 'Cabrero', telefono: '969151932', email: 'jose.m.benitezvega@gmail.com'},
    { rut: '77941272-5', nombre: 'TRANSPORTES ALFER SPA', representante: 'Eric Ivan Mendoza Cid', ejecutiva: 'Daniela', direccion: 'Calle 5 Lote 4, 29', comuna: 'Cabrero', telefono: '998863537', email: 'trans.alferspa@gmail.com'},
    { rut: '77204205-1', nombre: 'Transportes Amal Spa', representante: 'Ariel Martin Ameijeira', ejecutiva: 'Daniela', direccion: 'Ahumada 254 OF 806', comuna: 'Santiago', telefono: '961469130', email: 'transportesamalspa@gmail.com'},
    { rut: '78043729-4', nombre: 'Transportes Arma Spa', representante: 'Angela Andrea Pedreros Cerna', ejecutiva: 'Daniela', direccion: 'SAN PIO X 2445 OF 510 5P', comuna: 'Providencia', telefono: '962646273', email: 'Transportesarmaspa@gmail.com'},
    { rut: '78310166-1', nombre: 'Transportes Beeweis Spa', representante: 'PATRICIO HERNANDEZ BEWEIS', ejecutiva: 'Daniela', direccion: 'ZAPADORES 441', comuna: 'Recoleta', telefono: '987300549', email: 'Sebastian.beweis@gmail.com'},
    { rut: '77724297-0', nombre: 'TRANSPORTES CORDINI SPA', representante: 'Jonathan Reinaldo Cordini Beltran', ejecutiva: 'Daniela', direccion: 'Huerfanos 1055 depto 503', comuna: 'Santiago', telefono: '981433557', email: 'jcordinibeltran@gmail.com'},
    { rut: '78350942-3', nombre: 'Transporte Brimarc Spa', representante: 'Eduardo Enrique Brito Leiva', ejecutiva: 'Daniela', direccion: 'Lago Chungara 334 ', comuna: 'Quilicura', telefono: '992115703', email: 'ebritoleivaabril2@gmail.com'},
    { rut: '77225235-8', nombre: 'TRANSPORTES CRUC SPA', representante: 'Claudio Robinson Urzua Cifuentes', ejecutiva: 'Daniela', direccion: 'Pasaje Ramayana 661', comuna: 'Maipu', telefono: '975556759', email: 'claudiorobinson1963@gmail.com'},
    { rut: '77943651-9', nombre: 'Transportes Cs Spa', representante: 'Fernando Jesus Celis Gutierrez', ejecutiva: 'Daniela', direccion: 'Pasaje Progreso y Bienest 0105', comuna: 'Buin', telefono: '977603049', email: 'ferna-908@yahoo.es'},
    { rut: '77927983-9', nombre: 'TRANSPORTES DE CARGA   MARCELA PATRICIA CAMACHO CAMACHO E.I.R.L', representante: 'Marcela Patricia Camacho Camacho', ejecutiva: 'Daniela', direccion: 'Villa La Palma pasaje 6 casa 173', comuna: 'Talagante', telefono: '933906939', email: 'marcelitapatricia31@gmail.com'},
    { rut: '78350787-0', nombre: 'Transportes Br Spa', representante: 'Felipe Eduardo Martínez Solar', ejecutiva: 'Daniela', direccion: 'Santiago Aldea 906', comuna: 'Padre Hurtado', telefono: '973580530', email: 'pipemartinezsolar@gmail.com'},
    { rut: '78364854-7', nombre: 'Transportes Don Augusto Spa', representante: 'Italo Ramiro Suazo Torres', ejecutiva: 'Daniela', direccion: 'Yerbas Buenas 490 A', comuna: 'Linares', telefono: '988936845', email: 'italosuazot1993r@gmail.com'},
    { rut: '77443906-4', nombre: 'Transportes Donatelo Spa', representante: 'JUAN SEGUNDO MUÑOZ BUSTOS', ejecutiva: 'Daniela', direccion: 'PSJE TRES PONIENTE CASA 105 VILLA JESUS NULL', comuna: 'Calera de Tango', telefono: '932972689', email: 'juanpyalonso2020@gmail.com'},
    { rut: '77919212-1', nombre: 'Transportes Franco Spa', representante: 'Alejandro Javier Soto Morales', ejecutiva: 'Daniela', direccion: 'PASAJE A 17 SITIO 68 INES ARAGAY III NULL', comuna: 'Parral', telefono: '940078959', email: 'Transportesfrancospa@gmail.com'},
    { rut: '78273793-7', nombre: 'Transportes Gianlucca Vitto Limitada', representante: 'NICOLAS ANDRES MUNOZ DIAZ', ejecutiva: 'Daniela', direccion: 'CONSTANTINOPLA 16269 EL ABRAZO NULL', comuna: 'Maipu', telefono: '968953561', email: 'nicolasmunozdiaz@gmail.com'},
    { rut: '76904819-7', nombre: 'Transportes Gonzalo Eduardo Araya Aguilar Eirl', representante: 'Gonzalo Araya Aguilar', ejecutiva: 'Daniela', direccion: 'Villa America pasaje 3 N° 595', comuna: 'Casablanca', telefono: '961580795', email: 'asesorias.sofiaaraya@gmail.com'},
    { rut: '77547318-5', nombre: 'Transportes Ignacio Burgos E.i.r.l.', representante: 'Ignacio Santiago Burgos Alamos', ejecutiva: 'Daniela', direccion: 'Gaspar de Orense 982', comuna: 'Quinta Normal', telefono: '991837272', email: 'nagiraburgos2017@gmail.com'},
    { rut: '77349385-5', nombre: 'Transportes Inma Spa', representante: 'Miguel Luis Infante Zambrano', ejecutiva: 'Daniela', direccion: 'Pasaje Empedrado 1746', comuna: 'Maule', telefono: '982510793', email: 'miguel.infante.zambrano@gmail.com'},
    { rut: '78179126-1', nombre: 'Transportes Isacon Spa', representante: 'CONSTANZA DEL PILAR RECABAL AVILA', ejecutiva: 'Daniela', direccion: 'ANTONIO BELLET 193 OF 1210 12P NULL BLOCK 1210', comuna: 'Providencia', telefono: '959220329', email: 'Isacon.transportes@gmail.com'},
    { rut: '76808332-0', nombre: 'Transportes Juan Manuel Sarralde Aravena Empresa Individual De Respons', representante: 'Juan Manuel Sarralde Aravena', ejecutiva: 'Daniela', direccion: 'Julio Valenzuela 836', comuna: 'Buin', telefono: '937401993', email: 'juansarralde49@gmail.com'},
    { rut: '77381623-9', nombre: 'Transportes Luchito Spa', representante: 'RAFAEL EDUARDO VIDAL CHAVARRIA', ejecutiva: 'Daniela', direccion: 'LOS OLMOS 27 MONTE AGUILA', comuna: 'Cabrero', telefono: '996241608', email: 'rafaelvidalch01@gmail.com'},
    { rut: '77488785-7', nombre: 'Transportes Luis Araya Lazo E.i.r.l.', representante: 'Luis Enrique Araya Lazo', ejecutiva: 'Daniela', direccion: 'Calle principal 14', comuna: 'Coquimbo', telefono: '976139547', email: 'kcortes.contabilidad@gmail.com'},
    { rut: '77113814-4', nombre: 'Transportes Luis Eduardo Cruz Perez EIRL', representante: 'Luis Eduardo Cruz Perez', ejecutiva: 'Daniela', direccion: 'Pasaje El Ocaso La Islita parcela 3', comuna: 'Isla de Maipo', telefono: '983345898', email: 'luis.cruz.perez44@gmail.com'},
    { rut: '77382964-0', nombre: 'Transportes Luis Ignacio Urrutia Tiznado E.i.r.l.', representante: 'Luis Ignacio Urrutia Tiznado', ejecutiva: 'Daniela', direccion: 'Avenida Luis Cabrera 1475 A', comuna: 'Linares', telefono: '974024936', email: 'anaolate6@hotmail.com'},
    { rut: '78301223-5', nombre: 'Transportes Lvs Spa', representante: 'OSCAR ANTONIO LANDERO VERA', ejecutiva: 'Daniela', direccion: 'AVENIDA FENIX 8555 3 24 LO ESPEJO', comuna: 'Lo Espeko', telefono: '954643465', email: 'Landero24v@gmail.com'},
    { rut: '76812672-0', nombre: 'Transportes M/r Limitada', representante: 'RODRIGO ALEXANDER MUNOZ ECHEVERRIA', ejecutiva: 'Daniela', direccion: 'PASAJE ERNEST UTHOFF 03021', comuna: 'SAN BERNARDO', telefono: '991849530', email: 'Transportes.mrlogistica@gmail.com'},
    { rut: '78178719-1', nombre: 'Transportes Magnate Spa', representante: 'BASTIAN ELIAS URRUTIA GAVILAN', ejecutiva: 'Daniela', direccion: 'SAN JUAN LOTE B', comuna: 'LINARES', telefono: '934236726', email: 'bastianurrutia2015@gmail.com'},
    { rut: '78069053-4', nombre: 'Transportes Mauricio Arroyo E.i.r.l.', representante: 'Mauricio Antonio Arroyo Esfronceda', ejecutiva: 'Daniela', direccion: 'Pasaje Eusebio Lillo 2', comuna: 'Mostazal', telefono: '948517274', email: 'mauricioarroyo35@gmail.com'},
    { rut: '77998655-1', nombre: 'TRANSPORTES MIGUEL JESUS URIBE COCA E.I.R.L', representante: 'Miguel Jesus Uribe Coca', ejecutiva: 'Daniela', direccion: 'Apoquindo 6410 Oficina 605 Piso 6', comuna: 'Las Condes', telefono: '926338295', email: 'jesus.volvo.21@gmail.com'},
    { rut: '78003531-5', nombre: 'Transportes Morales Castillo Spa', representante: 'CAROLINA ANDREA CASTILLO CASTILLO', ejecutiva: 'Daniela', direccion: 'PASAJE EL PEUMO 7 VILLA ESPERANZA', comuna: 'Cabrero', telefono: '978506451', email: 'kaarito83@gmail.com'},
    { rut: '77417801-5', nombre: 'Transportes Naranjo´s Spa', representante: 'Glassbeidey Naranjo Sanchez', ejecutiva: 'Daniela', direccion: 'J SOLIS-ALGARROB OTE 520 DP 42 PARQUE LIBERTAD NULL', comuna: 'LA SERENA', telefono: '958683547', email: 'contacto.gns20@gmail.com'},
    { rut: '76843705-K', nombre: 'Transportes Pablo Cesar Soto Cruz E.i.r.l.', representante: 'Pablo cesar Soto Cruz', ejecutiva: 'Daniela', direccion: 'Rosendo Jaramillo N° 329', comuna: 'Chimbarongo', telefono: '996426218', email: 'pablo.columbia1@gmail.com'},
    { rut: '77993482-9', nombre: 'TRANSPORTES PAISOL SPA', representante: 'ALVARO LORENZO PAILLAN PALMA', ejecutiva: 'Daniela', direccion: 'PSJE CUATRO ORIENTE CASA 27', comuna: 'Calera de Tango', telefono: '976643992', email: 'transporte.paisol@gmail.com'},
    { rut: '77852474-0', nombre: 'TRANSPORTES PEDRO VILLAGRAN E.I.R.L.', representante: 'PEDRO SEBASTIAN VILLAGRAN SALDIAS', ejecutiva: 'Daniela', direccion: 'PJE 10 74 ST 19 MZ C', comuna: 'Concepción', telefono: '954391870', email: 'PEDRO.SVS.94@GMAIL.COM'},
    { rut: '78242685-0', nombre: 'Transportes Rc Spa', representante: 'RICHARD ANDRES CONTRERAS FORTON', ejecutiva: 'Daniela', direccion: 'CALLE NUEVA 3860 8 14 JOSÉ GARDINJ', comuna: 'RENCA', telefono: '999525901', email: 'richard.contrer85@gmail.com'},
    { rut: '77692211-0', nombre: 'Transportes Renee Bastias P E Hijos Spa', representante: 'Renee Nicole Bastias Pereira', ejecutiva: 'Daniela', direccion: 'Morande 835', comuna: 'Santiago', telefono: '942445867', email: 'reneebastiasp@gmail.com'},
    { rut: '77119982-8', nombre: 'Transportes Rodrigo Esteban Rojas Araya EIRL', representante: 'Rodrigo Esteban Rojas Araya', ejecutiva: 'Daniela', direccion: 'Pasaje Altue 3764 V Las Hortensias', comuna: 'Padre Hurtado', telefono: '997078031', email: 'fegrande10@gmail.com'},
    { rut: '77357401-4', nombre: 'Transportes Sebastian Exequiel Garcia Martini Empresa Individual De Re', representante: 'Sebastian Exequiel Garcia Martini', ejecutiva: 'Daniela', direccion: 'Pasaje San Simon 2607 San Ignacio 2', comuna: 'Padre Hurtado', telefono: '992252150', email: 'kekita74@yahoo.es'},
    { rut: '77640206-0', nombre: 'Transportes Sin Fronteras SPA', representante: 'Antony Jesus Cosme Ircañaupa', ejecutiva: 'Daniela', direccion: 'Apoquindo 7935', comuna: 'Las Condes', telefono: '978508641', email: 'transportesinfronteras@gmail.com'},
    { rut: '77982752-6', nombre: 'Transportes Villegas Y Villegas Spa', representante: 'Robinson Nicolas Villegas Hernandez', ejecutiva: 'Daniela', direccion: 'Simpson 997', comuna: 'Valdivia', telefono: '941555921', email: 'transp.vyvspa@gmail.com'},
    { rut: '78207782-1', nombre: 'Transportes   M&f Spa', representante: 'Rodrigo Andres Sarralde Diaz', ejecutiva: 'Daniela', direccion: 'HUERFANOS 1055 OF 313 NULL', comuna: 'Santiago', telefono: '987127769', email: 'Transportesmarfel5@gmail.com'},
    { rut: '76937652-6', nombre: 'Trasportes Claudio Ortega Spa', representante: 'Claudio Ivan Eduardo Ortega Escobar', ejecutiva: 'Daniela', direccion: 'Pasaje Colonial 272', comuna: 'Isla De Maipo', telefono: '940076378', email: 'claudiomaipo@gmail.com'},
    { rut: '77808136-9', nombre: 'Transportes Emimaxi Spa', representante: 'Úrsula Fabiola Contreras Cerda', ejecutiva: 'Daniela', direccion: 'Milloqueo 0982', comuna: 'Puente Alto', telefono: '947435714', email: 'ismaelmorning@gmail.com'},
    { rut: '77848888-4', nombre: 'Celin Spa', representante: 'Hector Mario Ceballos Gallegos', ejecutiva: 'Olga', direccion: 'Campos 120', comuna: 'Rancagua', telefono: '974046956', email: 'trancelinspa@gmail.com'},
    { rut: '77083269-1', nombre: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', representante: 'Luis Anibal Vergara Cadiz', ejecutiva: 'Olga', direccion: 'El Acacio Sitio 47 A P.14', comuna: 'Calera de tango', telefono: '', email: ''},
    { rut: '77150766-2', nombre: 'Empresa De Transportes Nico Abarca Spa', representante: 'Nelson Alejandro Abarca Leiva', ejecutiva: 'Olga', direccion: '5 de abril 413', comuna: 'Marchigue', telefono: '', email: ''},
    { rut: '78174616-9', nombre: 'Jjb Transportes Spa', representante: 'LUIS ALEJANDRO RODRIGUEZ GALLARDO', ejecutiva: 'Olga', direccion: 'PASAJE EL BLANCO 1868 CONDOMINIO ESMERALDA', comuna: 'RIO BUENO', telefono: '981261921', email: 'Rodriguez.jano.luis@gmail.com'},
    { rut: '77929313-0', nombre: 'NAVARRETE SANCHEZ SPA', representante: 'Manuel Modesto Navarrete Valdebenito', ejecutiva: 'Olga', direccion: 'Av Las Tejas 1555', comuna: 'Maipu', telefono: '', email: 'manuel.nav99@gmail.com'},
    { rut: '77548896-4', nombre: 'SERVICIO DE TRANSPORTE B Y B SPA', representante: 'VÍctor Rodolfo Basoalto Tapia', ejecutiva: 'Olga', direccion: 'El Cascajo, San Raul s/n', comuna: 'Longavi', telefono: '', email: 'victorbasoalto1990@gmail.com'},
    { rut: '77115061-6', nombre: 'SERVICIOS GENERALES Y COMERCIALES KEVIN SPA', representante: 'Javier Ramon Fuenzalida Almuna', ejecutiva: 'Olga', direccion: 'D DE ALMAGRO 10978', comuna: 'La Pintana', telefono: '984380842', email: 'Transp.kevin21@gmail.com'},
    { rut: '76285729-4', nombre: 'Sociedad De Transportes Quintanilla Ltda.', representante: 'Juan Pablo Quintanilla Gajardo', ejecutiva: 'Olga', direccion: 'PANAMERICA SUR KM 145', comuna: 'SAN FERNANDO', telefono: '944894012', email: 'jpabloquintanilla@hotmail.com'},
    { rut: '78099101-1', nombre: 'Transporte Diego Galdame Spa', representante: 'DIEGO DILAN GALDAME GUTIERREZ', ejecutiva: 'Olga', direccion: 'CALLE 1 349', comuna: 'PARRAL', telefono: '945794915', email: 'diegogaldame97@gmail.com'},
    { rut: '78303894-3', nombre: 'Transportes Chachy Spa', representante: 'NANCY EDITH ALMONTE VASQUEZ', ejecutiva: 'Olga', direccion: 'CAMINO OCHAGAVIA 02096 LA 02096', comuna: 'El Bosque', telefono: '942812796', email: 'dorianjamett50@gmail.com'},
    { rut: '78180641-2', nombre: 'Transportes Dancris Spa', representante: 'CRISTIAN EMILIO HIDALGO YANTEN', ejecutiva: 'Olga', direccion: 'PJ R MATTE 921 VILLA GABRIELA NULL', comuna: 'BUIN', telefono: '940942053', email: 'Transportes.dancris@gmail.com'},
    { rut: '7092038-7', nombre: 'Mario Fernando Urbina San Juan', representante: 'Mario Fernando Urbina San Juan', ejecutiva: 'Olga', direccion: 'PARAISO # 10, VILLA EL EDEN', comuna: 'REQUINOA', telefono: '', email: ''},
    { rut: '77085832-1', nombre: 'Transporte De Carga Por Carretera Hernan Osvaldo Gutierrez MuÑoz E.i.r', representante: 'Hernan Osvaldo Gutierrez Munoz', ejecutiva: 'Olga', direccion: 'JOSE BRANCOLI CINQUINI 1363', comuna: 'TALAGANTE', telefono: '56 9 9303 8834', email: 'h.gutierrez.munoz@gmail.com'},
    { rut: '77941769-7', nombre: 'Transporte H&p Spa', representante: 'HÉCTOR HERNÁN PARRA JARA', ejecutiva: 'Olga', direccion: 'R. WARNER 03 MZA ST 2 VILLA LOS BOLDOS 0', comuna: 'CABRERO', telefono: '56 9 3408 5419', email: 'hectorparra.jara@gmail.com'},
    { rut: '77852371-K', nombre: 'Transportes Escalona Spa', representante: 'ANGELA POLET ESCALONA VEJAR', ejecutiva: 'Olga', direccion: 'MARIA LUISA SEP 959 NULL', comuna: 'Quilicura', telefono: '934888027', email: 'angelapoletesca1981@gmail.com'},
    { rut: '77863057-5', nombre: 'TRANSPORTES   DANIEL ALEJANDRO SEPULVEDA NEGRON E.I.R.L', representante: 'DANIEL ALEJANDRO SEPÚLVEDA NEGRÓN', ejecutiva: 'Olga', direccion: 'DELICIAS 400 0', comuna: 'TEMUCO', telefono: '56 9 7527 0648', email: '0'},
    { rut: '76390125-4', nombre: 'Transportes Andres Lisandro Ramirez Tapia Eirl', representante: 'Andres Lisandro Ramirez Tapia', ejecutiva: 'Olga', direccion: 'PASAJE BOLIVIA 256', comuna: 'PAINE', telefono: '56 9 9744 6927', email: 'andreacrm25@gmail.com'},
    { rut: '78261292-1', nombre: 'Transportes Igm Spa', representante: 'LUIS RAUL ARROYO ARRIAGADA', ejecutiva: 'Olga', direccion: 'VILLAGRAN 1217', comuna: 'Los Angeles', telefono: '956487351', email: 'transportesigmcontacto@gmail.com'},
    { rut: '77560099-3', nombre: 'Transportes Arnoldo Carrasco Spa', representante: 'ARNOLDO ALEJANDRO CARRASCO RAMIREZ', ejecutiva: 'Olga', direccion: 'BARRALES 0234 SAN PEDRO 0', comuna: 'MELIPILLA', telefono: '56 9 3243 4254', email: 'transportesacr@yahoo.com'},
    { rut: '77411735-0', nombre: 'Transportes Edol Spa', representante: 'Eduardo Ignacio Olguin Lopez', ejecutiva: 'Olga', direccion: 'MIGUEL DE CERVANTES 266 NICOLAS PALACIOS 0', comuna: 'SANTA CRUZ', telefono: '56 9 4428 9400', email: 'eduardo.olguin1991@hotmail.es'},
    { rut: '76748766-5', nombre: 'Transportes Hector Galaz E.i.r.l.', representante: 'Hector Antonio Galaz Contreras', ejecutiva: 'Olga', direccion: 'CAMINO PUBLICO LOTE 0', comuna: 'OLIVAR', telefono: '56 9 3390 2798', email: 'hgalazbeltran@gmail.com'},
    { rut: '76304483-1', nombre: 'Transportes Jose Luis Ubilla Mendoza Eirl', representante: 'JOSÉ LUIS UBILLA MENDOZA', ejecutiva: 'Olga', direccion: 'CAUPOLICAN 3295', comuna: 'PEÑAFLOR', telefono: '56 9 4247 0013', email: '0'},
    { rut: '78295206-4', nombre: 'Transportes Lara Spa', representante: 'ALAN GABRIEL LARA UBILLA', ejecutiva: 'Olga', direccion: 'CONSEJAL TERESA HERRERA 6350', comuna: 'Cerrillos', telefono: '959496368', email: 'Laraalan374@gmail.com'},
    { rut: '76842089-0', nombre: 'Transportes Jose Rodolfo Vasquez Balboa Empresa Individual De Responsa', representante: 'Jose Rodolfo Vasquez Balboa', ejecutiva: 'Olga', direccion: 'CAMINO A CERRILLO CASA 20', comuna: 'LONGAVÍ', telefono: '56 9 6225 7927', email: 'jose010293vasquez@gmail.com'},
    { rut: '78255926-5', nombre: 'Transportes Luis Walter Jimenez Sepulveda E.i.r.l.', representante: 'Luis Walter Jimenez Sepulveda', ejecutiva: 'Olga', direccion: 'PC 20 LT 17 EL PAIQUITO NULL', comuna: 'El Monte', telefono: '992560268', email: 'transportesluisjimenez@gmail.com'},
    { rut: '77222214-9', nombre: 'Transportes Marco Antonio Gatica Moreno Spa', representante: 'Marco Antonio Gatica Moreno', ejecutiva: 'Olga', direccion: 'PJ COELEMU 02673 STA ROSA DE LIMA', comuna: 'SAN BERNANDO', telefono: '983567470', email: 'marcogatica14@gmail.com'},
    { rut: '77913183-1', nombre: 'TRANSPORTES LUIS IGNACIO CABRERA VERA E.I.R.L.', representante: 'Luis Ignacio Cabrera Vera', ejecutiva: 'Olga', direccion: 'BOMBERO LUIS MORONI 2601 DP 408 -A CIUDAD PARQUE BICENT 0', comuna: 'CERRILLOS', telefono: '56 9 7852 8806', email: '0'},
    { rut: '77566202-6', nombre: 'Transportes Mc Spa', representante: 'Jacky Lee Lopez Neculman', ejecutiva: 'Olga', direccion: 'LOS CANTAROS 14563 LAS HORTENSIAS III 0', comuna: 'SAN BERNARDO', telefono: '56 9 9181 1192', email: 'transportesmcspa1@gmail.com'},
    { rut: '77408422-3', nombre: 'Transportes Mejias Spa', representante: 'Marco Antonio Rios Mejias', ejecutiva: 'Olga', direccion: 'PARROCO A. ALVARADO 2918 EL PORVENIR 0', comuna: 'MAIPÚ', telefono: '56 9 8397 6991', email: '0'},
    { rut: '77436503-6', nombre: 'Transportes Mj E Hijos Spa', representante: 'Pablo Ignacio Escobedo Quintanilla', ejecutiva: 'Olga', direccion: 'Av. Apoquindo 6410, 605', comuna: 'Las Condes', telefono: '989055980', email: 'Pablo.mec1995@gmail.com'},
    { rut: '77480102-2', nombre: 'Transportes Myt Spa', representante: 'YESSENIA ANDREA PÉREZ ROMERO', ejecutiva: 'Olga', direccion: 'PINTOR ALFREDO VALENZUELA 1015', comuna: 'LINARES', telefono: '56 9 4466 7593', email: '0'},
    { rut: '77392988-2', nombre: 'Transportes Nibaldo Araya Eirl', representante: 'Nibaldo Patricio Araya Astorga', ejecutiva: 'Olga', direccion: 'JM BALMACEDA 4878 0', comuna: 'RENCA', telefono: '56 9 7495 0939', email: 'nibaldo1962@gmail.com'},
    { rut: '77377291-6', nombre: 'Transportes Nicolas Spa', representante: 'Pedro Benjasmin Soto Jara', ejecutiva: 'Olga', direccion: 'LOS MONTONEROS 639 EL ESFUERZO 0', comuna: 'CHILLÁN', telefono: '56 9 8582 9392', email: '0'},
    { rut: '77387969-9', nombre: 'Transportes Orlando Del Carmen Mendez Gutierrez Eirl', representante: 'Orlando Del Carmen Mendez Gutierrez', ejecutiva: 'Olga', direccion: 'LLANCANAO 915 BELLO HORIZONTE 0', comuna: 'LINARES', telefono: '56 9 6806 7441', email: '0'},
    { rut: '77805935-5', nombre: 'Transportes Paola Garcia  Fredes E.i.r.l', representante: 'PAOLA DEL CARMEN GARCÍA FREDES', ejecutiva: 'Olga', direccion: 'AV OHIGGINS 490 DP 28 A EDIF EL LIBERTADOR 0', comuna: 'MAIPÚ', telefono: '56 9 3553 4723', email: 'paolagarciafre07@gmail.com'},
    { rut: '77394975-1', nombre: 'Transportes Raul Marcelo Soto Bobadilla E.i.r.l.', representante: 'RAÚL MARCELO SOTO BOBADILLA', ejecutiva: 'Olga', direccion: 'HUECHUN BAJO PC 32 LT 6 0', comuna: 'MELIPILLA', telefono: '56 9 9987 8369', email: '0'},
    { rut: '77117558-9', nombre: 'Transportes Ro Spa', representante: 'RODRIGO IGNACIO UBILLA MUÑOZ', ejecutiva: 'Olga', direccion: 'CAUPOLICAN 3295 0', comuna: 'PEÑAFLOR', telefono: '56 9 4247 0013', email: '0'},
    { rut: '77110277-8', nombre: 'Transportes Santa Rafaela Spa', representante: 'Luis Eduardo Perez Vargas', ejecutiva: 'Olga', direccion: 'RAMON SUBERCASEAUX 1268 1204', comuna: 'SAN MIGUEL', telefono: '56 9 7376 1474', email: 'tsr2020spa@gmail.com'},
    { rut: '77713918-5', nombre: 'Transportes Victoria Spa', representante: 'Francisco Adolfo Chamorro Sobarzo', ejecutiva: 'Olga', direccion: 'SANTA VICTORIA LT.A Y B 0', comuna: 'TUCAPEL', telefono: '56 9 5652 2508', email: '0'},
    { rut: '77888835-1', nombre: 'TRANSPORTES SANCHEZ SPA', representante: 'DAVID SALOMON SANCHEZ OTAROLA', ejecutiva: 'Olga', direccion: 'CALLE LOS AVELLANOS 1667 VILLA EL BOSQUE', comuna: 'SAN JAVIER', telefono: '953006937', email: 'Davidsanchezotarola@gmail.com'},
    { rut: '77383694-9', nombre: 'Transportes Wilson Antonio Cabello Reyes Eirl', representante: 'Wilson Antonio Cabello Reyes', ejecutiva: 'Olga', direccion: 'PJ CONSC ROJAS 0111 0', comuna: 'LINARES', telefono: '56 9 8829 4958', email: '0'},
    { rut: '77273263-5', nombre: 'Transportes Taurus Spa', representante: 'Jonathan Alfredo Vergara Osorio', ejecutiva: 'Olga', direccion: 'ALMIRANTE LATORRE 255 PARTE ALTA', comuna: 'Coquimbo', telefono: '935652585', email: 'Jonathan.osoriotr94@gmail.com'},
    { rut: '77698453-1', nombre: 'Transportes Trans Adroc Spa', representante: 'ANDREA DEL PILAR DIAZ GARRIDO', ejecutiva: 'Olga', direccion: 'AV. PAPA JUAN XXIII 368 C. DE P. H. PTE VI NULL 0 0', comuna: 'Padre hurtado', telefono: '966036468', email: 'tran.adroc@gmail.com'},
    { rut: '78296208-6', nombre: 'Transportes Venaur  Spa', representante: 'DARIO HERNAN CALDERON RODRIGUEZ', ejecutiva: 'Olga', direccion: 'CORONEL GODOY 128', comuna: 'Estación Central', telefono: '990227147', email: 'Rodriguezdario387@gmail.com'},
    { rut: '78019868-0', nombre: 'Ubilla Transportes Spa', representante: 'JOSÉ LUIS UBILLA MUÑOZ', ejecutiva: 'Olga', direccion: 'CAUPOLICAN 3295 0', comuna: 'PEÑAFLOR', telefono: '56 9 9442 3272', email: '0'},
    { rut: '77892137-5', nombre: 'TRANSPORTES WHITE EXPRESS SPA', representante: 'OMAR CHRISTIAN PEREZ ENCINAS', ejecutiva: 'Olga', direccion: 'BIO BIO 592', comuna: 'SANTIAGO', telefono: '998015067', email: 'HOD_F17@HOTMAIL.COM'},
    { rut: '10534518-6', nombre: 'Veronica Yolanda Silva Atenas', representante: 'Veronica Yolanda Silva Atenas', ejecutiva: 'Olga', direccion: 'HOLANDA 3640 201', comuna: 'ÑUÑOA', telefono: '56 9 7958 6970', email: 'veronicasilvaatenas@gmail.com'},
    { rut: '12044190-6', nombre: 'Victor Marcel Jimenez Reyes', representante: 'Victor Marcel Jimenez Reyes', ejecutiva: 'Olga', direccion: 'ROBLES 13540', comuna: 'LO BARNECHEA', telefono: '56 9 8574 1599', email: '0'},
    { rut: '78365485-7', nombre: 'Transportes Ql Spa', representante: 'JOAQUÍN MARCOS QUISPE MAGUINA', ejecutiva: 'Olga', direccion: 'LOS VECINOS 8854', comuna: 'PUDAHUEL', telefono: '56968602383', email: 'ricojuaco51@gmail.com'},
  ]
}
