'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamMember {
  full_name: string
  rut: string
  email?: string
  phone?: string
}

export default function CreateUsersFromTeamPage() {
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [textInput, setTextInput] = useState('')

  const handleParseTeamData = () => {
    // Simple CSV/paste parsing
    const lines = textInput.split('\n').filter(l => l.trim())
    const parsed: TeamMember[] = []

    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim())
      if (parts.length >= 2 && parts[0] && parts[1]) {
        parsed.push({
          full_name: parts[0],
          rut: parts[1],
          email: parts[2] || undefined,
          phone: parts[3] || undefined,
        })
      }
    }

    setTeamData(parsed)
  }

  const handleCreateUsers = async () => {
    if (teamData.length === 0) {
      alert('No users to create')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users/create-from-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: teamData }),
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Crear Usuarios desde Equipo</CardTitle>
          <CardDescription>Copia y pega los datos del equipo (Nombre\tRUT\tEmail\tTeléfono)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Nombre	RUT	Email	Teléfono"
            className="w-full h-32 p-3 border border-border rounded bg-input text-foreground font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handleParseTeamData} variant="outline">
              Parsear Datos
            </Button>
          </div>

          {teamData.length > 0 && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-foreground">
                {teamData.length} usuarios listos para crear
              </p>
              <ul className="text-xs text-muted-foreground mt-2">
                {teamData.map((u, i) => (
                  <li key={i}>{u.full_name} - {u.rut}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleCreateUsers}
            disabled={isLoading || teamData.length === 0}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Creando...' : 'Crear Usuarios'}
          </Button>

          {result && (
            <div className={`p-3 rounded ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <p className="text-sm font-semibold">
                {result.message}
              </p>
              {result.errors?.length > 0 && (
                <div className="text-xs mt-2">
                  <p className="font-semibold">Errores:</p>
                  {result.errors.map((e: any, i: number) => (
                    <p key={i} className="text-red-600">{e.rut}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
