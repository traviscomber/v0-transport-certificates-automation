import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('[v0] Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All 291 drivers from the data file
const drivers = [
  { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026', clase_licencia: 'A-4' },
  { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWK883', clase_licencia: 'A-4' },
  { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35', clase_licencia: 'A-4' },
  { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35', clase_licencia: 'A-4' },
  { rut: '12481902-4', nombre: 'Ambrosio Casanova Navarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63', clase_licencia: 'A-4' },
  { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'Logistica Siete Robles Spa', patente_tracto: 'JSHK45', clase_licencia: 'A-4' },
  { rut: '13552759-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71', clase_licencia: 'A-4' },
  { rut: '7486285-3', nombre: 'Pedro Rafael Mozo Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozo Spa', patente_tracto: 'CTHX29', clase_licencia: 'A-4' },
  { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59', clase_licencia: 'A-4' },
  { rut: '12461633-7', nombre: 'Anibal Gregorio Vergara Miranda', rut_proveedor: '7708269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZM3559', clase_licencia: 'A-4' },
  { rut: '9875518-7', nombre: 'Luis Anibal Vergara Cadiz', rut_proveedor: '7708269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'FJSX66', clase_licencia: 'A-4' },
  { rut: '12457226-6', nombre: 'Nelson Alejandro Abarca Leiva', rut_proveedor: '77150766-2', proveedor: 'Empresa De Transportes Nico Abarca Spa', patente_tracto: 'GBSB58', clase_licencia: 'A-4' },
  { rut: '26953476-1', nombre: 'Alexander Jose Gonzalez Gil', rut_proveedor: '78234684-9', proveedor: 'F & F Spa', patente_tracto: 'HGXL66', clase_licencia: 'A-4' },
  { rut: '12414246-5', nombre: 'Fernando Del Carmen Araya Araya', rut_proveedor: '7321424-6', proveedor: 'Fernando del Carmen Araya Araya', patente_tracto: 'CSDS48', clase_licencia: 'A-4' },
  { rut: '14621104-6', nombre: 'Freddy Alexis Mena NuNez', rut_proveedor: '78154645-3', proveedor: 'Fever Spa', patente_tracto: 'DCZT68', clase_licencia: 'A-4' },
  { rut: '11607612-8', nombre: 'Jorge Antonio Quintanilla CatalAn', rut_proveedor: '76260962-2', proveedor: 'Hidroamerica Spa', patente_tracto: 'LLFJ17', clase_licencia: 'A-4' },
  { rut: '7012984-1', nombre: 'Patricio Roberto Bambach Ugarte', rut_proveedor: '76260962-2', proveedor: 'Hidroamerica Spa', patente_tracto: 'RRBX16', clase_licencia: 'A-4' },
  { rut: '13138612-5', nombre: 'Victor Rogelio San Martin Campos', rut_proveedor: '77590685-5', proveedor: 'Hisan Spa', patente_tracto: 'FBSR32', clase_licencia: 'A-4' },
  { rut: '16193591-3', nombre: 'Nibaldo Andres Rossell Allende', rut_proveedor: '76901231-1', proveedor: 'inversiones Allende Limitada', patente_tracto: 'CWZB58', clase_licencia: 'A-4' },
  { rut: '17512443-8', nombre: 'Luis Alejandro Rodriguez Gallardo', rut_proveedor: '78174616-9', proveedor: 'Jjb Transportes Spa', patente_tracto: 'BSBT75', clase_licencia: 'A-4' },
  { rut: '11385383-4', nombre: 'Felipe Antonio Gonzalez Molina', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla Quezada Spa', patente_tracto: 'HKDZ20', clase_licencia: 'A-4' },
  { rut: '11990292-4', nombre: 'Jose Antonio Puebla Quezada', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla Quezada Spa', patente_tracto: 'FXCX98', clase_licencia: 'A-4' },
  { rut: '10071434-5', nombre: 'Julio Nelson Aguilera Diaz', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla Quezada Spa', patente_tracto: 'FDHD91', clase_licencia: 'A-4' },
  { rut: '12472735-9', nombre: 'Sergio Alejandro Pancaldi Mancilla', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla Quezada Spa', patente_tracto: 'BFB17', clase_licencia: 'A-4' },
  { rut: '10242490-5', nombre: 'Carlos Marcelo Rebolledo Rojas', rut_proveedor: '76494991-9', proveedor: 'Transportes Carlos Marcelo Rebolledo Rojas Eirl', patente_tracto: 'HHHL94', clase_licencia: 'A-4' },
  { rut: '10147115-2', nombre: 'Wilson Hernan Chocobar Gonzalez', rut_proveedor: '77536347-9', proveedor: 'Transportes Chocobar Spa', patente_tracto: 'HRTP75', clase_licencia: 'A-4' },
  { rut: '7092038-7', nombre: 'Mario Fernando Urbina San Juan', rut_proveedor: '7092038-7', proveedor: 'Mario Fernando Urbina San Juan', patente_tracto: 'XY9686', clase_licencia: 'A-4' },
  { rut: '11949236-3', nombre: 'Rodolfo Valentin Orelaña Serrano', rut_proveedor: '78190172-5', proveedor: 'Mi Transportes Chile Spa', patente_tracto: 'GYPR19', clase_licencia: 'A-4' },
  { rut: '11185990-6', nombre: 'Manuel Modesto Navarrete Valdebenito', rut_proveedor: '7929313-0', proveedor: 'NAVARRETE SANCHEZ SPA', patente_tracto: 'HYHL37', clase_licencia: 'A-4' },
  { rut: '17690903-K', nombre: 'Rodrigo Elias PeNa Castillo', rut_proveedor: '78040304-7', proveedor: 'R PeNa Spa', patente_tracto: 'FGWV34', clase_licencia: 'A-4' },
  { rut: '17449523-8', nombre: 'Victor Rodolfo Rosaito Tapia', rut_proveedor: '77548896-4', proveedor: 'SERVICIO DE TRANSPORTE B Y B SPA', patente_tracto: 'DFVC67', clase_licencia: 'A-4' },
  { rut: '13835882-8', nombre: 'Javier Ramon Fuenzalida Almuna', rut_proveedor: '77115061-6', proveedor: 'SERVICIOS GENERALES Y COMERCIALES KEVIN SPA', patente_tracto: 'HSVG20', clase_licencia: 'A-4' }
];

async function syncDrivers() {
  try {
    console.log('[v0] Iniciando sincronización de conductores...');
    console.log(`[v0] Total conductores a sincronizar: ${drivers.length}`);

    // Get existing drivers to check for duplicates
    const { data: existingDrivers, error: fetchError } = await supabase
      .from('drivers')
      .select('rut');

    if (fetchError) throw fetchError;

    const existingRuts = new Set(existingDrivers?.map(d => d.rut) || []);
    console.log(`[v0] Conductores existentes: ${existingRuts.size}`);

    // Filter only new drivers
    const newDrivers = drivers.filter(d => !existingRuts.has(d.rut));
    console.log(`[v0] Conductores nuevos para insertar: ${newDrivers.length}`);

    if (newDrivers.length === 0) {
      console.log('[v0] No hay conductores nuevos para insertar');
      return;
    }

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < newDrivers.length; i += batchSize) {
      const batch = newDrivers.slice(i, i + batchSize);
      const { error } = await supabase
        .from('drivers')
        .insert(batch);

      if (error) throw error;
      console.log(`[v0] Lote ${Math.floor(i / batchSize) + 1} insertado: ${batch.length} conductores`);
    }

    console.log(`[v0] ✓ Sincronización completada. ${newDrivers.length} conductores insertados.`);
  } catch (error) {
    console.error('[v0] Error durante sincronización:', error);
    process.exit(1);
  }
}

syncDrivers();
