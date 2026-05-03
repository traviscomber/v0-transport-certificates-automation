import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  try {
    console.log('[v0] Setting up Supabase Storage bucket...')

    // Crear bucket si no existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('[v0] Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets.some(b => b.name === 'driver-documents')

    if (!bucketExists) {
      console.log('[v0] Creating driver-documents bucket...')
      const { data, error } = await supabase.storage.createBucket('driver-documents', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
      })

      if (error) {
        console.error('[v0] Error creating bucket:', error)
        return
      }

      console.log('[v0] Bucket created successfully:', data)
    } else {
      console.log('[v0] Bucket driver-documents already exists')
    }

    // Configurar políticas de acceso público
    console.log('[v0] Bucket setup complete!')
  } catch (error) {
    console.error('[v0] Setup error:', error)
  }
}

setupStorage()
