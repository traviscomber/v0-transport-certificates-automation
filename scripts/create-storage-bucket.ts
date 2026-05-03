import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createDocumentsBucket() {
  try {
    console.log('Creating documents bucket...')

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    const documentsBucketExists = buckets?.some((b) => b.name === 'documents')

    if (documentsBucketExists) {
      console.log('✓ documents bucket already exists')
    } else {
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true,
      })

      if (error) {
        console.error('✗ Error creating bucket:', error)
        process.exit(1)
      }

      console.log('✓ documents bucket created successfully')
    }

    // Set bucket policies to allow public access for reading
    console.log('Configuring bucket policies...')

    // Note: Bucket policies are typically set through the Supabase dashboard
    // or using the Admin API. For now, we just ensure the bucket exists.

    console.log('✓ Storage bucket setup complete')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createDocumentsBucket()
