import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Real data from TSV files
const subcontractorsData = [
  { rut: '77653071-9', nombre: '4Vial SPA', representante: 'Ruben Marchant Needhan', ejecutiva: 'Carolina', direccion: 'Ahumada 312 of 715', comuna: 'Santiago', telefono: '9 7255 5016', email: 'g4vial@gmail.com', proveedor: 'Ariztia' },
  { rut: '76461213-2', nombre: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', representante: 'Adolfo Gonzalez Meza', ejecutiva: 'Carolina', direccion: 'Esmeralda 1561 Lote 2', comuna: 'Colina', telefono: '9 9291 0830', email: 'adolfo.gonzalez.meza@hotmail.com', proveedor: 'Ariztia' },
  { rut: '76956797-6', nombre: 'AEROCAV SPA', representante: 'JOSE MIGUEL ROJAS URBINA', ejecutiva: 'Carolina', direccion: 'Argomedo 321', comuna: 'Santiago', telefono: '9 5533 9046', email: 'JROJAS.SL@GMAIL.COM', proveedor: 'LTS' },
  { rut: '16181677-9', nombre: 'Aldo Antonio Bustamante Ortega', representante: 'Aldo Antonio Bustamante Ortega', ejecutiva: 'Carolina', direccion: 'Gacitua 564', comuna: 'Isla de Maipo', telefono: '9 6431 9423', email: 'z71aldo@hotmail.com', proveedor: '' },
  { rut: '76463195-1', nombre: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', representante: 'Ambrosio Casanova Naavarrete', ejecutiva: 'Carolina', direccion: 'Pje los Pinos 1498', comuna: 'Rengo', telefono: '9 7147 6688', email: 'juliancasanova1973@gmail.com', proveedor: 'LTS' },
  { rut: '77243323-9', nombre: 'Comercio, Servicios Y Transportes Mozó Spa', representante: 'Falcon Nicolas Mozo Farfan', ejecutiva: 'Carolina', direccion: 'Morande 835 of 518', comuna: 'Santiago', telefono: '9 5630 6291', email: 'contacto@cerpaconsultores.cl', proveedor: '' },
  { rut: '78234684-9', nombre: 'F & F Spa', representante: 'Francisco Andres Villagran Ramirez', ejecutiva: 'Carolina', direccion: 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', comuna: 'Talca', telefono: '932652497', email: 'fyftranspspa@gmail.com', proveedor: 'Ariztia' },
  { rut: '78154645-3', nombre: 'Fever Spa', representante: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', ejecutiva: 'Carolina', direccion: 'SANTIAGO ALDEA 906', comuna: 'Padre Hurtado', telefono: '', email: '', proveedor: 'Ariztia' },
  { rut: '76260962-2', nombre: 'Hidroamerica Spa', representante: 'Patricio Roberto Bambach Ugarte', ejecutiva: 'Carolina', direccion: 'Avenida las Condes 9792', comuna: 'Las Condes', telefono: '9 4287 4454', email: 'PBAMBACH@hidroamerica.cl', proveedor: 'Ariztia' },
  { rut: '78101236-K', nombre: 'LogÍstica Siete Robles Spa', representante: 'PATRICIO AURELIO RIVAS PUENTES', ejecutiva: 'Carolina', direccion: 'DIEZ NORTE 2314', comuna: 'TALCA', telefono: '964452706', email: 'logisticasieterobles@gmail.com', proveedor: 'Ariztia' },
]

const driversData = [
  { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026' },
  { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83' },
  { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35' },
  { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35' },
  { rut: '12481902-4', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63' },
  { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'LogÍstica Siete Robles Spa', patente_tracto: 'JSHK45' },
  { rut: '8825579-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71' },
  { rut: '7486285-3', nombre: 'Pedro  Rafael Mozo  Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29' },
  { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59' },
  { rut: '17461633-7', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559' },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      subcontractors: subcontractorsData,
      drivers: driversData,
      company: {
        rut: '78376780-5',
        nombre: 'LABBE TRANSPORTES Y CIAS LTDA.',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.'
      }
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
}
