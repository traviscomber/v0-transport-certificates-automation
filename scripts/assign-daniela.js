const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    // Get Daniela's user ID
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error('Error listing users:', userError.message)
      return
    }

    const daniela = users.users.find(u => u.email === 'dsilva@labbe.cl')
    if (!daniela) {
      console.error('Daniela not found in auth users')
      return
    }

    const danielaUserId = daniela.id
    console.log('Found Daniela with ID:', danielaUserId)

    // Now update the transportista to assign to Daniela
    const { data: updateData, error: updateError } = await supabase
      .from('transportistas')
      .update({ ejecutivo_asignado: danielaUserId })
      .eq('rut', '78302429-2')
      .select()

    if (updateError) {
      console.error('Error updating transportista:', updateError.message)
      return
    }

    console.log('✓ Successfully assigned to Daniela!')
    console.log('Company:', updateData[0]?.razon_social)
    console.log('RUT:', updateData[0]?.rut)
    console.log('Ejecutiva ID:', updateData[0]?.ejecutivo_asignado)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
