const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const demoAccounts = [
  { email: 'conductor@demo.cl', password: 'demo123', role: 'driver', name: 'Conductor Demo' },
  { email: 'despachador@demo.cl', password: 'demo123', role: 'dispatcher', name: 'Despachador Demo' },
  { email: 'admin@demo.cl', password: 'demo123', role: 'admin', name: 'Admin Demo' },
];

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupDemoAccounts() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('Setting up demo accounts...');

  for (const account of demoAccounts) {
    try {
      console.log(`\nProcessing ${account.email}...`);

      // Try to create the user
      const createRes = await makeRequest(
        'POST',
        '/auth/v1/admin/users',
        {
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.name,
            role: account.role,
          },
        }
      );

      if (createRes.status === 201) {
        console.log(`✓ Created ${account.email}`);
      } else if (createRes.status === 422) {
        console.log(`✓ ${account.email} already exists`);
      } else {
        console.error(`✗ Failed to create ${account.email}:`, createRes.status, createRes.data);
      }
    } catch (error) {
      console.error(`✗ Error processing ${account.email}:`, error.message);
    }
  }

  console.log('\n✓ Demo accounts setup complete!');
}

setupDemoAccounts().catch(console.error);
