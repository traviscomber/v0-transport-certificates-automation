// Server component — delegates entirely to a client-only dynamic import
// This prevents SSR hydration mismatches from browser extension attribute injection
import dynamic from 'next/dynamic'

const ConductorLoginForm = dynamic(
  () => import('@/components/conductor/login-form'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        Cargando...
      </div>
    ),
  }
)

export default function ConductorLoginPage() {
  return <ConductorLoginForm />
}
