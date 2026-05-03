#!/usr/bin/env node

/**
 * Script para crear los ejecutivos de Transportes Labbe
 * Llama al endpoint POST /api/admin/seed-executives
 */

const VERCEL_URL = process.env.VERCEL_URL || 'http://localhost:3000'
const endpoint = `${VERCEL_URL}/api/admin/seed-executives`

async function seedExecutives() {
  console.log('[v0] Starting seed executives...')
  console.log('[v0] Endpoint:', endpoint)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'seed' }),
    })

    console.log('[v0] Response status:', response.status)
    const data = await response.json()
    console.log('[v0] Response data:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('[v0] ✅ Successfully created executives!')
      process.exit(0)
    } else {
      console.error('[v0] ❌ Error creating executives:', data.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('[v0] ❌ Error calling endpoint:', error.message)
    process.exit(1)
  }
}

seedExecutives()
