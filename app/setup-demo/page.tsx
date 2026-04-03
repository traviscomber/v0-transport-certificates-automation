"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, Loader2, Users } from "lucide-react"
import Link from "next/link"

export default function SetupDemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()

  const handleSetupDemo = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/create-demo-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const result = await response.json()

      console.log('[v0] Setup demo response:', { status: response.status, result })

      // 200 = all success, 207 = partial success (some already exist), others = error
      if (response.status === 200 || response.status === 207) {
        setStatus("success")
        setMessage(result.message || "Cuentas demo listas.")
        setResults(result.results || [])
        localStorage.setItem('demo_accounts_setup_completed', 'true')
      } else {
        setStatus("error")
        setMessage(result.error || "Error al crear las cuentas demo.")
        setResults(result.results || [])
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Error de conexion. Verifica la configuracion.")
      console.error('[v0] Setup demo error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const accounts = [
    { label: "Conductor Demo", email: "conductor@demo.cl", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/30" },
    { label: "Despachador Demo", email: "despachador@demo.cl", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
    { label: "Admin Demo", email: "admin@demo.cl", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/test" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a la Prueba Interactiva
        </Link>

        <div className="glass-dark rounded-2xl border border-border p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Configurar Cuentas Demo</h1>
              <p className="text-xs text-muted-foreground">Acceso rapido a los 3 roles del sistema</p>
            </div>
          </div>

          <div className="my-6 space-y-2">
            {accounts.map((acc) => (
              <div key={acc.email} className={`flex items-center justify-between p-3 rounded-lg border ${acc.bg}`}>
                <div>
                  <p className={`text-sm font-semibold ${acc.color}`}>{acc.label}</p>
                  <p className="text-xs text-muted-foreground">{acc.email}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">demo123</span>
              </div>
            ))}
          </div>

          {status === "idle" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Este proceso creara tres cuentas con datos de ejemplo para explorar el sistema sin registro.
              </p>
              <Button
                onClick={handleSetupDemo}
                disabled={isLoading}
                className="w-full btn-orange"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuentas...
                  </>
                ) : (
                  "Crear Cuentas Demo"
                )}
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Configuracion exitosa</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
                </div>
              </div>
              {results.length > 0 && (
                <ul className="space-y-1">
                  {results.map((r: any, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.success
                        ? <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        : <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      }
                      {r.email}: {r.success ? "listo" : r.error}
                    </li>
                  ))}
                </ul>
              )}
              <Button className="w-full btn-orange" onClick={() => {
                localStorage.setItem('demo_accounts_setup_completed', 'true')
                router.push('/test')
              }}>
                Ir a la Prueba Interactiva
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Error en configuracion</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleSetupDemo}>
                  Reintentar
                </Button>
                <Button className="flex-1 btn-orange" onClick={() => router.push('/auth/register')}>
                  Crear cuenta
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
