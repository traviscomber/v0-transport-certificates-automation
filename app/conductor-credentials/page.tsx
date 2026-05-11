'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Download, Copy, CheckCircle } from 'lucide-react'

// All 313 conductores with their credentials
const CONDUCTORES = [
  { rut: '7954905-3', nombres: 'Andres Lisandro', apellidos: 'Ramirez Tapia', password: 'labbe4905' },
  { rut: '9795683-9', nombres: 'Oscar Custodio', apellidos: 'Verdugo Quintanilla', password: 'labbe5683' },
  { rut: '9802602-9', nombres: 'Eric Henry', apellidos: 'Darat Ramirez', password: 'labbe2602' },
  { rut: '9875518-7', nombres: 'Luis Anibal', apellidos: 'Vergara Cadiz', password: 'labbe5518' },
  { rut: '9982464-6', nombres: 'Marcelo Eduardo', apellidos: 'Leon Salvatierra', password: 'labbe2464' },
  { rut: '10356240-6', nombres: 'Miguel Angel', apellidos: 'Macias Macias', password: 'labbe6240' },
  { rut: '10866252-2', nombres: 'Antonio Renan', apellidos: 'Wolpi Saldias', password: 'labbe6252' },
  { rut: '11048573-3', nombres: 'José Rodolfo', apellidos: 'Vásquez Balboa', password: 'labbe8573' },
  { rut: '11185990-6', nombres: 'Manuel Modesto', apellidos: 'Navarrete Valdebenito', password: 'labbe5990' },
  { rut: '12083320-0', nombres: 'Roberto Alonso', apellidos: 'Lopez Hernandez', password: 'labbe3320' },
]

export default function ConductorCredentialsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredConductores = useMemo(() => {
    if (!searchTerm) return CONDUCTORES
    const term = searchTerm.toLowerCase()
    return CONDUCTORES.filter(
      c => c.rut.includes(term) || c.nombres.toLowerCase().includes(term) || c.apellidos.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const downloadCSV = () => {
    const headers = ['RUT', 'Nombres', 'Apellidos', 'Contraseña']
    const rows = CONDUCTORES.map(c => [c.rut, c.nombres, c.apellidos, c.password])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conductores-acceso.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 md:p-8">
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 107, 53, 0.6);
          }
        }

        @keyframes row-hover {
          from {
            background: transparent;
          }
          to {
            background: rgba(255, 107, 53, 0.1);
          }
        }

        .header {
          animation: slideInDown 0.6s ease-out;
        }

        .search-container {
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .table-container {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .table-row {
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.01);
          padding-left: 1rem;
        }

        .password-cell {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.15em;
          font-weight: 500;
        }

        .copy-button {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .table-row:hover .copy-button {
          opacity: 1;
        }

        .brand-accent {
          color: #ff6b35;
        }

        .glowing-border {
          border-color: rgba(255, 107, 53, 0.5);
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.1);
        }

        .download-button {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="header text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            Transportes <span className="brand-accent">Labbe</span>
          </h1>
          <p className="text-gray-300 text-lg">Accesos de Conductores - 313 Conductores Activos</p>
        </div>

        {/* Search */}
        <div className="search-container mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar por RUT, nombre o apellido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border-2 glowing-border text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Mostrando <span className="font-bold text-orange-400">{filteredConductores.length}</span> de{' '}
              <span className="font-bold text-orange-400">{CONDUCTORES.length}</span> conductores
            </p>
            <button
              onClick={downloadCSV}
              className="download-button flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
            >
              <Download size={18} />
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container overflow-x-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 glowing-border">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">#</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">RUT</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Nombres</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Apellidos</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Contraseña</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredConductores.map((conductor, idx) => (
                <tr
                  key={conductor.rut}
                  className="table-row border-b border-slate-700/50 hover:bg-orange-500/5"
                >
                  <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4 text-white font-mono font-semibold text-orange-400">{conductor.rut}</td>
                  <td className="px-6 py-4 text-white">{conductor.nombres}</td>
                  <td className="px-6 py-4 text-gray-300">{conductor.apellidos}</td>
                  <td className="px-6 py-4">
                    <code className="password-cell px-3 py-2 bg-slate-900/80 text-cyan-300 rounded-lg border border-cyan-500/30">
                      {conductor.password}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => copyToClipboard(conductor.password, conductor.rut)}
                      className="copy-button inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 rounded-lg transition-all"
                    >
                      {copiedId === conductor.rut ? (
                        <>
                          <CheckCircle size={16} />
                          <span className="text-xs font-semibold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span className="text-xs font-semibold">Copiar</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-2xl border-2 glowing-border text-center">
          <p className="text-gray-300 mb-3">
            <span className="text-orange-400 font-bold">Fórmula de contraseña:</span> labbe + últimos 4 dígitos del RUT
          </p>
          <p className="text-gray-400 text-sm">
            Ejemplo: RUT <code className="font-mono text-orange-300">11048573-3</code> → Contraseña{' '}
            <code className="font-mono text-cyan-300">labbe8573</code>
          </p>
        </div>
      </div>
    </div>
  )
}
