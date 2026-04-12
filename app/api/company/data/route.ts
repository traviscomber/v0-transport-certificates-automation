import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Real data from your TSV files
    const subcontractorsData = [
      { rut: '77653071-9', nombre: '4Vial SPA', representante: 'Ruben Marchant Needhan', ejecutiva: 'Carolina', region: 'RM', direccion: 'Ahumada 312 of 715', comuna: 'Santiago', telefono: '9 7255 5016', email: 'g4vial@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false },
      { rut: '76461213-2', nombre: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', representante: 'Adolfo Gonzalez Meza', ejecutiva: 'Carolina', region: 'RM', direccion: 'Esmeralda 1561 Lote 2', comuna: 'Colina', telefono: '9 9291 0830', email: 'adolfo.gonzalez.meza@hotmail.com', ariztia: true, lts: false, rendic: false, interpolar: false },
      { rut: '76956797-6', nombre: 'AEROCAV SPA', representante: 'JOSE MIGUEL ROJAS URBINA', ejecutiva: 'Carolina', region: 'RM', direccion: 'Argomedo 321', comuna: 'Santiago', telefono: '9 5533 9046', email: 'JROJAS.SL@GMAIL.COM', ariztia: false, lts: true, rendic: false, interpolar: false },
      { rut: '16181677-9', nombre: 'Aldo Antonio Bustamante Ortega', representante: 'Aldo Antonio Bustamante Ortega', ejecutiva: 'Carolina', region: 'RM', direccion: 'Gacitua 564', comuna: 'Isla de Maipo', telefono: '9 6431 9423', email: 'z71aldo@hotmail.com', ariztia: false, lts: false, rendic: false, interpolar: false },
      { rut: '76463195-1', nombre: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', representante: 'Ambrosio Casanova Naavarrete', ejecutiva: 'Carolina', region: 'VI', direccion: 'Pje los Pinos 1498', comuna: 'Rengo', telefono: '9 7147 6688', email: 'juliancasanova1973@gmail.com', ariztia: false, lts: true, rendic: false, interpolar: false },
      { rut: '77243323-9', nombre: 'Comercio, Servicios Y Transportes Mozó Spa', representante: 'Falcon Nicolas Mozo Farfan', ejecutiva: 'Carolina', region: 'RM', direccion: 'Morande 835 of 518', comuna: 'Santiago', telefono: '9 5630 6291', email: 'contacto@cerpaconsultores.cl', ariztia: false, lts: false, rendic: false, interpolar: false },
      { rut: '78234684-9', nombre: 'F & F Spa', representante: 'Francisco Andres Villagran Ramirez', ejecutiva: 'Carolina', region: 'VII', direccion: 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', comuna: 'Talca', telefono: '932652497', email: 'fyftranspspa@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false },
      { rut: '78154645-3', nombre: 'Fever Spa', representante: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', ejecutiva: 'Carolina', region: 'RM', direccion: 'SANTIAGO ALDEA 906', comuna: 'Padre Hurtado', telefono: '', email: '', ariztia: true, lts: false, rendic: false, interpolar: false },
      { rut: '76260962-2', nombre: 'Hidroamerica Spa', representante: 'Patricio Roberto Bambach Ugarte', ejecutiva: 'Carolina', region: 'RM', direccion: 'Avenida las Condes 9792', comuna: 'Las Condes', telefono: '9 4287 4454', email: 'PBAMBACH@hidroamerica.cl', ariztia: true, lts: false, rendic: false, interpolar: false },
      { rut: '78101236-K', nombre: 'Logística Siete Robles Spa', representante: 'PATRICIO AURELIO RIVAS PUENTES', ejecutiva: 'Carolina', region: 'VII', direccion: 'DIEZ NORTE 2314', comuna: 'TALCA', telefono: '964452706', email: 'logisticasieterobles@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false },
    ]

    const driversData = [
      { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026' },
      { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83' },
      { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35' },
      { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35' },
      { rut: '12481902-4', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63' },
      { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'Logística Siete Robles Spa', patente_tracto: 'JSHK45' },
      { rut: '8825579-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71' },
      { rut: '7486285-3', nombre: 'Pedro Rafael Mozo Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29' },
      { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59' },
      { rut: '17461633-7', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559' },
    ]

    const executivesData = [
      { id: '1', full_name: 'Carolina Martinez', rut: '12345678-9', email: 'carolina@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Roberto Silva', rut: '13456789-K', email: 'roberto@labbe.cl', phone: '+56913456789', cargo: 'Gerente Operaciones' },
      { id: '3', full_name: 'Ana Garcia', rut: '14567890-2', email: 'ana@labbe.cl', phone: '+56914567890', cargo: 'Coordinadora' },
    ]

    return NextResponse.json({
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@labbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'Juan Perez',
        is_active: true
      },
      executives: executivesData,
      drivers: driversData,
      subcontractors: subcontractorsData
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
}
