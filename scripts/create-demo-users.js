#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function setupDemoUsers() {
  try {
    console.log(`[v0] Calling ${baseUrl}/api/setup/create-demo-users`)
    const response = await fetch(`${baseUrl}/api/setup/create-demo-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()
    console.log('[v0] Response:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('[v0] ✓ All demo users created successfully!')
      process.exit(0)
    } else {
      console.log('[v0] ✗ Some users failed:', data.results)
      process.exit(1)
    }
  } catch (error) {
    console.error('[v0] Error:', error)
    process.exit(1)
  }
}

setupDemoUsers()
