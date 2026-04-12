import fetch from 'node-fetch'

const API_URL = process.env.API_URL || 'http://localhost:3000'

async function syncDrivers() {
  try {
    console.log('[v0] Llamando a API de sincronización...')
    const response = await fetch(`${API_URL}/api/admin/sync-drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('[v0] Respuesta:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('[v0] ✓ Sincronización exitosa!')
      console.log(`   - Total conductores: ${data.total}`)
      console.log(`   - Insertados: ${data.inserted}`)
      console.log(`   - Existentes: ${data.existing}`)
    } else {
      console.error('[v0] ✗ Error en sincronización:', data.error)
    }
  } catch (error) {
    console.error('[v0] Error:', error)
  }
}

syncDrivers()
