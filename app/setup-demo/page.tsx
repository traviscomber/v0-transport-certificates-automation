"use client"

import { useState } from "react"

export default function SetupDemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<any[]>([])

  const handleSetupDemo = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/setup-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setStatus("success")
        setMessage("¡Cuentas demo creadas exitosamente! Ahora puedes usar los botones de demo en la página de login.")
        setResults(result.results)
      } else {
        setStatus("error")
        setMessage(result.error || "Error al crear las cuentas demo.")
      }
    } catch (error: any) {
      console.error("Error setting up demo accounts:", error)
      setStatus("error")
      setMessage(error.message || "Error al crear las cuentas demo. Verifica la configuración de la base de datos.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "32rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a
            href="/auth/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "#64748b",
              textDecoration: "none",
            }}
          >
            ← Volver al Login
          </a>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            padding: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              ▶️ Configurar Cuentas Demo
            </h1>
            <p style={{ color: "#64748b" }}>Configura las cuentas de demostración para probar el sistema</p>
          </div>

          {status === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                  Este proceso creará tres cuentas de demostración con datos de ejemplo:
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#dbeafe",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#3b82f6", borderRadius: "50%" }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "500" }}>Conductor Demo</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>conductor@demo.cl / demo123</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#dcfce7",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#22c55e", borderRadius: "50%" }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "500" }}>Despachador Demo</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>despachador@demo.cl / demo123</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#f3e8ff",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#a855f7", borderRadius: "50%" }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: "500" }}>Administrador Demo</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>admin@demo.cl / demo123</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef3c7",
                  borderRadius: "0.5rem",
                  border: "1px solid #f59e0b",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
                  ⚠️ Las cuentas demo incluyen certificados de ejemplo, notificaciones y datos de auditoría para una
                  experiencia completa.
                </p>
              </div>

              <button
                onClick={handleSetupDemo}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: "1rem",
                        height: "1rem",
                        border: "2px solid white",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    Creando cuentas demo...
                  </>
                ) : (
                  <>▶️ Crear Cuentas Demo</>
                )}
              </button>
            </div>
          )}

          {status === "success" && (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "4rem" }}>✅</div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#16a34a", marginBottom: "0.5rem" }}>
                  ¡Configuración Exitosa!
                </h3>
                <p style={{ color: "#64748b", marginBottom: "1rem" }}>{message}</p>

                {results.length > 0 && (
                  <div
                    style={{
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {results.map((result, index) => (
                      <div
                        key={index}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}
                      >
                        <span>{result.success ? "✅" : "❌"}</span>
                        <span>
                          {result.email}: {result.success ? "Creado exitosamente" : result.error}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <a
                href="/auth/login"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Ir al Login
              </a>
            </div>
          )}

          {status === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef2f2",
                  borderRadius: "0.5rem",
                  border: "1px solid #ef4444",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: "#dc2626" }}>❌ {message}</p>
              </div>
              <button
                onClick={handleSetupDemo}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Intentar Nuevamente
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
