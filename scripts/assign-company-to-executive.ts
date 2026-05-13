import { createClient } from '@supabase/supabase-js'

async function assignCompanyToExecutive() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Find TRANSPORTES SAN LORENZO SPA by RUT
    const { data: company, error: companyError } = await supabase
      .from('transportistas')
      .select('id, razon_social, rut')
      .eq('rut', '78302429-2')
      .single()

    if (companyError || !company) {
      console.error('Company not found:', companyError)
      return
    }

    console.log('Found company:', company)

    // Find Daniela in executive_staff
    const { data: executive, error: execError } = await supabase
      .from('executive_staff')
      .select('id, nombres, apellido_paterno, email')
      .ilike('nombres', '%Daniela%')
      .single()

    if (execError || !executive) {
      console.error('Executive not found:', execError)
      return
    }

    console.log('Found executive:', executive)

    // Delete existing assignment if any
    const { error: deleteError } = await supabase
      .from('executive_staff')
      .delete()
      .eq('transportista_id', company.id)

    if (deleteError) console.log('No existing assignment to delete or error:', deleteError.message)

    // Assign company to executive
    const { data: result, error: assignError } = await supabase
      .from('executive_staff')
      .insert({
        id: executive.id,
        transportista_id: company.id,
        nombres: executive.nombres,
        apellido_paterno: executive.apellido_paterno,
        email: executive.email,
        cargo: 'EJECUTIVA',
        is_active: true
      })
      .select()

    if (assignError) {
      console.error('Error assigning:', assignError)
      return
    }

    console.log('✅ Successfully assigned', company.razon_social, 'to', executive.nombres)
    console.log('Result:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

assignCompanyToExecutive()
