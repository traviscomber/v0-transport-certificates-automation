const https = require('https');

// Get the localhost URL (the preview server will be running)
const url = 'http://localhost:3000/api/admin/sync-drivers';

console.log('[v0] Calling sync-drivers endpoint at:', url);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = https.request(url, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[v0] Response status:', res.statusCode);
    console.log('[v0] Response body:', data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('[v0] Sync result:', parsed);
    } catch (e) {
      console.log('[v0] Could not parse response as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('[v0] Request error:', e.message);
  // Try HTTP instead
  console.log('[v0] Retrying with HTTP...');
  
  const http = require('http');
  const httpUrl = 'http://localhost:3000/api/admin/sync-drivers';
  
  const httpReq = http.request(httpUrl, options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('[v0] HTTP Response status:', res.statusCode);
      console.log('[v0] HTTP Response body:', data);
      
      try {
        const parsed = JSON.parse(data);
        console.log('[v0] HTTP Sync result:', parsed);
      } catch (e) {
        console.log('[v0] Could not parse HTTP response as JSON');
      }
    });
  });
  
  httpReq.on('error', (httpErr) => {
    console.error('[v0] HTTP Request also failed:', httpErr.message);
    console.log('[v0] Make sure the dev server is running on port 3000');
  });
  
  httpReq.end();
});

req.end();
