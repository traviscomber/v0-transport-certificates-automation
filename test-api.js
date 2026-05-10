// Test the conductors API endpoint
const subId = "07d87a66-99f8-40e8-9fe8-fafbedfc1f5d"; // 4Vial SPA ID

fetch(`https://cleaner2.vercel.app/api/subcontractors/${subId}/conductors`)
  .then(r => r.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Count:', Array.isArray(data) ? data.length : 'not array');
  })
  .catch(err => console.error('Error:', err));
