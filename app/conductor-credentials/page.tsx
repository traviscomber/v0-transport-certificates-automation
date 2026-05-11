'use client'

import { useState, useMemo } from 'react'
import { Search, Download, Copy, CheckCircle } from 'lucide-react'

// Datos de conductores - obtenidos de la base de datos
const conductoresData = [
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
  { rut: '13548573-5', nombres: 'Lara García', apellidos: 'Fuentes', password: 'labbe8573' },
  { rut: '13665163-3', nombres: 'Pablo Danilo', apellidos: 'Briones Briones', password: 'labbe5163' },
  { rut: '14564017-2', nombres: 'Giovanne Isaac', apellidos: 'Martinez Mella', password: 'labbe4017' },
  { rut: '15283662-4', nombres: 'Juan Carlos', apellidos: 'Araya Rodriguez', password: 'labbe3662' },
  { rut: '16669891-K', nombres: 'Elvis Antonio', apellidos: 'Bravo Gonzalez', password: 'labbe9891' },
  { rut: '17690903-K', nombres: 'Rodrigo Elias', apellidos: 'Peña Castillo', password: 'labbe0903' },
  { rut: '17853819-5', nombres: 'Juan Luis', apellidos: 'Amaya Albornoz', password: 'labbe3819' },
  { rut: '18011702-4', nombres: 'John Francisco', apellidos: 'Jofre Gomez', password: 'labbe1702' },
  { rut: '18866252-8', nombres: 'Felipe Antonio', apellidos: 'Castro Muñoz', password: 'labbe6252' },
  { rut: '25477804-4', nombres: 'Luis Angel', apellidos: 'Rodriguez Chacon', password: 'labbe7804' },
]

export default function ConductorCredentialsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const filteredConductores = useMemo(() => {
    return conductoresData.filter(c =>
      c.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleCopyPassword = (password: string, index: number) => {
    navigator.clipboard.writeText(password)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDownloadCSV = () => {
    const headers = ['RUT', 'Nombres', 'Apellidos', 'Contraseña']
    const rows = filteredConductores.map(c => [c.rut, c.nombres, c.apellidos, c.password])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conductores-credenciales.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#0f172a] p-4 md:p-8">
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 107, 53, 0.6); }
        }

        .animate-slide-in-down {
          animation: slideInDown 0.6s ease-out forwards;
        }

        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .row-animate {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .stagger-row-1 { animation-delay: 0.1s; }
        .stagger-row-2 { animation-delay: 0.2s; }
        .stagger-row-3 { animation-delay: 0.3s; }

        .glass-effect {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 107, 53, 0.2);
        }

        .glass-effect-hover:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(255, 107, 53, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 107, 53, 0.15);
        }
      `}</style>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="animate-slide-in-down">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
            Credenciales de Acceso
          </h1>
          <p className="text-cyan-400 text-lg mb-8">313 Conductores Transportes Labbe</p>
        </div>

        {/* Search Bar */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative mb-8">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-orange-400" />
            <input
              type="text"
              placeholder="Buscar por RUT, nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1e293b] text-white placeholder-gray-400 rounded-lg border border-orange-400/30 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
            />
          </div>
        </div>

        {/* Download Button */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
          >
            <Download className="w-5 h-5" />
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Results Counter */}
      <div className="max-w-6xl mx-auto mb-6 animate-fade-in">
        <p className="text-cyan-400 text-sm font-semibold">
          Mostrando {filteredConductores.length} de {conductoresData.length} conductores
        </p>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="glass-effect rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500/20 to-cyan-400/20 border-b border-orange-400/30">
                  <th className="px-6 py-4 text-left text-orange-400 font-bold">#</th>
                  <th className="px-6 py-4 text-left text-orange-400 font-bold">RUT</th>
                  <th className="px-6 py-4 text-left text-orange-400 font-bold">Nombres</th>
                  <th className="px-6 py-4 text-left text-orange-400 font-bold">Apellidos</th>
                  <th className="px-6 py-4 text-left text-orange-400 font-bold">Contraseña</th>
                  <th className="px-6 py-4 text-center text-orange-400 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-400/10">
                {filteredConductores.map((conductor, index) => (
                  <tr
                    key={conductor.rut}
                    className="row-animate glass-effect-hover transition-all hover:bg-orange-500/5 group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-semibold">{conductor.rut}</td>
                    <td className="px-6 py-4 text-white font-medium">{conductor.nombres}</td>
                    <td className="px-6 py-4 text-gray-300">{conductor.apellidos}</td>
                    <td className="px-6 py-4">
                      <code className="bg-[#0f172a] px-3 py-2 rounded text-orange-400 font-mono text-sm">
                        {conductor.password}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCopyPassword(conductor.password, index)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all text-sm"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto mt-12 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-gray-400 text-sm mb-4">
          Fórmula de contraseña: <code className="bg-[#1e293b] px-2 py-1 rounded text-orange-400">labbe + últimos 4 dígitos del RUT</code>
        </p>
        <p className="text-gray-500 text-xs">
          Portal de Conducttores • Transportes Labbe © 2026
        </p>
      </div>
    </div>
  )
}
