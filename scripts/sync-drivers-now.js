const https = require('https');

const syncData = {
  action: 'sync'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/sync-drivers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(syncData).length
  }
};

console.log('[v0] Starting driver sync...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('[v0] Sync result:', result);
    } catch (e) {
      console.log('[v0] Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('[v0] Error:', error.message);
  // Try with http instead
  const http = require('http');
  const req2 = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/sync-drivers',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(syncData).length
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('[v0] Sync result:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('[v0] Response:', data);
      }
    });
  });

  req2.write(JSON.stringify(syncData));
  req2.end();
});

req.write(JSON.stringify(syncData));
req.end();
