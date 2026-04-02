'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Filter, Calendar, Eye } from 'lucide-react'

export function ReportsDashboard() {
  const [selectedReport, setSelectedReport] = useState('audit')
  const [dateRange, setDateRange] = useState('30days')

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#18181B]">Reportes y Auditoría</h1>
        <p className="text-[#71717A]">Análisis de cumplimiento, auditoría y actividad del sistema</p>
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="audit">Auditoría</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="documents">Documentos</SelectItem>
              <SelectItem value="users">Usuarios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Período</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#0066FF] text-white hover:bg-[#0052CC]">
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </Button>
      </div>

      {/* Charts Section */}
      <Card className="border-[#E4E4E7]">
        <CardHeader>
          <CardTitle>Cumplimiento Documentario</CardTitle>
          <CardDescription>Evolución de documentos completos vs incompletos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Semana 1', compliant: 45, noncompliant: 5 },
              { name: 'Semana 2', compliant: 52, noncompliant: 3 },
              { name: 'Semana 3', compliant: 58, noncompliant: 2 },
              { name: 'Semana 4', compliant: 65, noncompliant: 1 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="compliant" fill="#00C853" name="Completo" />
              <Bar dataKey="noncompliant" fill="#FF6B6B" name="Incompleto" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Audit Logs Section */}
      <Card className="border-[#E4E4E7]">
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
          <CardDescription>Historial completo de actividades del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E4E4E7]">
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                    {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id} className="border-[#E4E4E7]">
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="text-sm text-[#71717A]">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#18181B]">1,247</div>
            <p className="text-xs text-[#71717A] mt-1">↑ 12% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Validados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1,150</div>
            <p className="text-xs text-[#71717A] mt-1">92.2% de cumplimiento</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">74</div>
            <p className="text-xs text-[#71717A] mt-1">En revisión</p>
          </CardContent>
        </Card>
        <Card className="border-[#E4E4E7]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#71717A]">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">23</div>
            <p className="text-xs text-[#71717A] mt-1">Por revisar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
