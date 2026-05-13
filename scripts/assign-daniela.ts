import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    // Create Daniela user in auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'dsilva@labbe.cl',
      password: 'labbe2246',
      email_confirm: true,
    })

    if (userError) {
      console.error('Error creating user:', userError)
      return
    }

    const danielaUserId = userData.user.id
    console.log('Created Daniela with ID:', danielaUserId)

    // Now update the transportista to assign to Daniela
    const { data: updateData, error: updateError } = await supabase
      .from('transportistas')
      .update({ ejecutivo_asignado: danielaUserId })
      .eq('rut', '78302429-2')
      .select()

    if (updateError) {
      console.error('Error updating transportista:', updateError)
      return
    }

    console.log('Updated TRANSPORTES SAN LORENZO SPA:')
    console.log(updateData)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
