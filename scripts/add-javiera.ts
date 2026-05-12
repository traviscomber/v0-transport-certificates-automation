import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function createJaviera() {
  try {
    console.log('[v0] Creating Javiera Ayala profile...');
    
    // Insert into profiles table
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          email: 'jayala@labbe.cl',
          full_name: 'Javiera Ayala Rodríguez',
          rut: '18450987-1',
          phone: '+56987654321',
          role: 'executive',
          company: 'Labbe',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[v0] Error creating profile:', error);
      return;
    }

    console.log('[v0] Profile created successfully:', data);
    console.log('[v0] Email: jayala@labbe.cl can now login');
  } catch (err) {
    console.error('[v0] Exception:', err);
  }
}

createJaviera();
