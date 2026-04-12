import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('[v0] API company/data called - User:', user?.id || 'No user')

    // Real data from your TSV files with all required fields from database schema
    const subcontractorsData = [
      { id: '1', rut: '77653071-9', nombre: '4Vial SPA', razon_social: '4Vial SPA', nombre_fantasia: '4Vial', representante: 'Ruben Marchant Needhan', representante_legal: 'Ruben Marchant Needhan', ejecutiva: 'Carolina', region: 'RM', direccion: 'Ahumada 312 of 715', comuna: 'Santiago', ciudad: 'Santiago', telefono: '9 7255 5016', email: 'g4vial@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '2', rut: '76461213-2', nombre: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', razon_social: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', nombre_fantasia: 'Adolfo Gonzalez', representante: 'Adolfo Gonzalez Meza', representante_legal: 'Adolfo Gonzalez Meza', ejecutiva: 'Carolina', region: 'RM', direccion: 'Esmeralda 1561 Lote 2', comuna: 'Colina', ciudad: 'Colina', telefono: '9 9291 0830', email: 'adolfo.gonzalez.meza@hotmail.com', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '3', rut: '76956797-6', nombre: 'AEROCAV SPA', razon_social: 'AEROCAV SPA', nombre_fantasia: 'AEROCAV', representante: 'JOSE MIGUEL ROJAS URBINA', representante_legal: 'JOSE MIGUEL ROJAS URBINA', ejecutiva: 'Carolina', region: 'RM', direccion: 'Argomedo 321', comuna: 'Santiago', ciudad: 'Santiago', telefono: '9 5533 9046', email: 'JROJAS.SL@GMAIL.COM', ariztia: false, lts: true, rendic: false, interpolar: false, is_active: true },
      { id: '4', rut: '16181677-9', nombre: 'Aldo Antonio Bustamante Ortega', razon_social: 'Aldo Antonio Bustamante Ortega', nombre_fantasia: 'Aldo Bustamante', representante: 'Aldo Antonio Bustamante Ortega', representante_legal: 'Aldo Antonio Bustamante Ortega', ejecutiva: 'Carolina', region: 'RM', direccion: 'Gacitua 564', comuna: 'Isla de Maipo', ciudad: 'Isla de Maipo', telefono: '9 6431 9423', email: 'z71aldo@hotmail.com', ariztia: false, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '5', rut: '76463195-1', nombre: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', razon_social: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', nombre_fantasia: 'Ambrosio Casanova', representante: 'Ambrosio Casanova Naavarrete', representante_legal: 'Ambrosio Casanova Naavarrete', ejecutiva: 'Carolina', region: 'VI', direccion: 'Pje los Pinos 1498', comuna: 'Rengo', ciudad: 'Rengo', telefono: '9 7147 6688', email: 'juliancasanova1973@gmail.com', ariztia: false, lts: true, rendic: false, interpolar: false, is_active: true },
      { id: '6', rut: '77243323-9', nombre: 'Comercio, Servicios Y Transportes Mozó Spa', razon_social: 'Comercio, Servicios Y Transportes Mozó Spa', nombre_fantasia: 'Mozó Transportes', representante: 'Falcon Nicolas Mozo Farfan', representante_legal: 'Falcon Nicolas Mozo Farfan', ejecutiva: 'Carolina', region: 'RM', direccion: 'Morande 835 of 518', comuna: 'Santiago', ciudad: 'Santiago', telefono: '9 5630 6291', email: 'contacto@cerpaconsultores.cl', ariztia: false, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '7', rut: '78234684-9', nombre: 'F & F Spa', razon_social: 'F & F Spa', nombre_fantasia: 'F & F', representante: 'Francisco Andres Villagran Ramirez', representante_legal: 'Francisco Andres Villagran Ramirez', ejecutiva: 'Carolina', region: 'VII', direccion: 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', comuna: 'Talca', ciudad: 'Talca', telefono: '932652497', email: 'fyftranspspa@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '8', rut: '78154645-3', nombre: 'Fever Spa', razon_social: 'Fever Spa', nombre_fantasia: 'Fever', representante: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', representante_legal: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', ejecutiva: 'Carolina', region: 'RM', direccion: 'SANTIAGO ALDEA 906', comuna: 'Padre Hurtado', ciudad: 'Padre Hurtado', telefono: '', email: '', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '9', rut: '76260962-2', nombre: 'Hidroamerica Spa', razon_social: 'Hidroamerica Spa', nombre_fantasia: 'Hidroamerica', representante: 'Patricio Roberto Bambach Ugarte', representante_legal: 'Patricio Roberto Bambach Ugarte', ejecutiva: 'Carolina', region: 'RM', direccion: 'Avenida las Condes 9792', comuna: 'Las Condes', ciudad: 'Santiago', telefono: '9 4287 4454', email: 'PBAMBACH@hidroamerica.cl', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
      { id: '10', rut: '78101236-K', nombre: 'Logística Siete Robles Spa', razon_social: 'Logística Siete Robles Spa', nombre_fantasia: 'Siete Robles', representante: 'PATRICIO AURELIO RIVAS PUENTES', representante_legal: 'PATRICIO AURELIO RIVAS PUENTES', ejecutiva: 'Carolina', region: 'VII', direccion: 'DIEZ NORTE 2314', comuna: 'TALCA', ciudad: 'TALCA', telefono: '964452706', email: 'logisticasieterobles@gmail.com', ariztia: true, lts: false, rendic: false, interpolar: false, is_active: true },
    ]

    const driversData = [
      { id: '1', rut: '18012757-7', nombres: 'Ruben', apellido_paterno: 'Marchant', apellido_materno: 'Needhan', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2024-12-15', 'Certificado PSI': '2025-06-30' } },
      { id: '2', rut: '10907750-K', nombres: 'Adolfo', apellido_paterno: 'Gonzalez', apellido_materno: 'Meza', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-03-20', 'Certificado PSI': '2025-08-15' } },
      { id: '3', rut: '12879880-3', nombres: 'Juan', apellido_paterno: 'Vargas', apellido_materno: 'Jerve', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-05-10', 'Certificado PSI': '2025-04-05' } },
      { id: '4', rut: '16181677-9', nombres: 'Aldo', apellido_paterno: 'Bustamante', apellido_materno: 'Ortega', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-02-28', 'Certificado PSI': '2025-09-12' } },
      { id: '5', rut: '12481902-4', nombres: 'Ambrosio', apellido_paterno: 'Casanova', apellido_materno: 'Naavarrete', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-04-18', 'Certificado PSI': '2025-07-22' } },
      { id: '6', rut: '13277753-5', nombres: 'Patricio', apellido_paterno: 'Rivas', apellido_materno: 'Puentes', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'Logística Siete Robles Spa', patente_tracto: 'JSHK45', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-01-25', 'Certificado PSI': '2025-05-30' } },
      { id: '7', rut: '8825579-8', nombres: 'Jose', apellido_paterno: 'Espinoza', apellido_materno: 'Castro', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71', clase_licencia: 'A-4', is_active: false, expiryDates: { 'Licencia de Conducir': '2024-11-10', 'Certificado PSI': '2025-02-14' } },
      { id: '8', rut: '7486285-3', nombres: 'Pedro', apellido_paterno: 'Mozo', apellido_materno: 'Espina', nombre: 'Pedro Rafael Mozo Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-06-05', 'Certificado PSI': '2025-08-20' } },
      { id: '9', rut: '12671737-7', nombres: 'Cristian', apellido_paterno: 'Jimenez', apellido_materno: 'Reyes', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-03-15', 'Certificado PSI': '2025-10-01' } },
      { id: '10', rut: '17461633-7', nombres: 'Anibal', apellido_paterno: 'Gregorich', apellido_materno: 'Vergara', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559', clase_licencia: 'A-4', is_active: true, expiryDates: { 'Licencia de Conducir': '2025-07-12', 'Certificado PSI': '2025-09-25' } },
    ]

    const executivesData = [
      { id: '1', full_name: 'Carolina Martinez', rut: '12345678-9', email: 'carolina@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Roberto Silva', rut: '13456789-K', email: 'roberto@labbe.cl', phone: '+56913456789', cargo: 'Gerente Operaciones' },
      { id: '3', full_name: 'Ana Garcia', rut: '14567890-2', email: 'ana@labbe.cl', phone: '+56914567890', cargo: 'Coordinadora' },
    ]

    // Enrich response with basic data (status calculations will be done client-side)
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
