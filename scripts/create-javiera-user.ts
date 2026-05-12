import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createJavieraUser() {
  try {
    console.log('Creating Javiera Ayala user in Supabase Auth...')

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'jayala@labbe.cl',
      password: 'labbe7321', // Standard format: "labbe" + last 4 digits of RUT
      email_confirm: true,
      user_metadata: {
        full_name: 'Javiera Ayala Rodríguez',
        rut: '18450987-1',
        phone: '+56987654321',
        cargo: 'Ejecutiva',
        empresa: 'Transportes Labbe',
      },
    })

    if (error) {
      console.error('Error creating user:', error.message)
      process.exit(1)
    }

    console.log('✓ User created successfully!')
    console.log('Email:', data.user?.email)
    console.log('User ID:', data.user?.id)
    console.log('Metadata:', data.user?.user_metadata)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createJavieraUser()
