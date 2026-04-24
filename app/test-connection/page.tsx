'use client';

import { useState, useEffect } from 'react';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Cargando...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const test = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        console.log('[v0] Testing with URL:', url);
        console.log('[v0] Testing with ANON_KEY:', anonKey?.substring(0, 50) + '...');

        if (!url || !anonKey) {
          setStatus('❌ VARIABLES NO CONFIGURADAS');
          setDetails({
            url: url ? '✅ Existe' : '❌ NO EXISTE',
            anonKey: anonKey ? '✅ Existe' : '❌ NO EXISTE'
          });
          return;
        }

        // Test direct fetch to Supabase REST API
        const response = await fetch(`${url}/rest/v1/`, {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          }
        });

        console.log('[v0] Response status:', response.status);

        if (response.status === 200) {
          setStatus('✅ CONEXIÓN OK');
          setDetails({
            url: url,
            status: response.status,
            message: 'Supabase es alcanzable'
          });
        } else if (response.status === 401) {
          setStatus('❌ ANON_KEY INVÁLIDA');
          setDetails({
            url: url,
            status: response.status,
            message: 'La ANON_KEY no es válida'
          });
        } else {
          setStatus(`❌ ERROR ${response.status}`);
          const text = await response.text();
          setDetails({
            url: url,
            status: response.status,
            message: text
          });
        }
      } catch (error) {
        console.error('[v0] Connection test error:', error);
        setStatus('❌ ERROR DE CONEXIÓN');
        setDetails({
          error: String(error)
        });
      }
    };

    test();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test de Conexión a Supabase</h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#1a1a1a', 
        color: '#00ff00',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>{status}</h2>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#222', 
        color: '#fff',
        borderRadius: '8px',
        overflow: 'auto'
      }}>
        <pre>{JSON.stringify(details, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
        <p>Si ves "❌ ANON_KEY INVÁLIDA", necesitas actualizar la key en Vercel.</p>
        <p>Si ves "❌ ERROR DE CONEXIÓN", la URL es incorrecta.</p>
      </div>
    </div>
  );
}
