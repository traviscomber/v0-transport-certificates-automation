async function testLogin(email) {
  const response = await fetch('http://localhost:3000/api/login-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()
  console.log(`${email}: ${response.status}`)
  if (response.status !== 200) {
    console.log('  Error:', data.error)
  } else {
    console.log('  Success! Role:', data.user.role)
  }
}

const ejecutivas = [
  'jayala@labbe.cl',
  'ocarrasco@labbe.cl',
  'dsilva@labbe.cl',
  'csepulveda@labbe.cl',
  'kcanales@labbe.cl'
]

for (const email of ejecutivas) {
  await testLogin(email)
}
