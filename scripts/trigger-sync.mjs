import fetch from 'node-fetch';

async function syncDrivers() {
  try {
    console.log('Starting driver sync...');
    const response = await fetch('http://localhost:3000/api/admin/sync-drivers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

syncDrivers();
