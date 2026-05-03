'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ReportTableProps {
  data: any[]
}

export function ReportTable({ data }: ReportTableProps) {
  // Sort data by status and document count
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Inactive first
      if (a.is_active !== b.is_active) {
        return a.is_active ? 1 : -1
      }
      // Then by lack of documents
      return b.documentCount - a.documentCount
    })
  }, [data])

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay datos que mostrar con los filtros seleccionados</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-32">RUT / ID</TableHead>
            <TableHead>Nombre / Razón Social</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="w-24">Estado</TableHead>
            <TableHead className="w-24 text-right">Documentos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, idx) => (
            <TableRow key={`${item.rut}-${idx}`} className={!item.is_active ? 'bg-muted/30' : ''}>
              <TableCell className="font-mono text-sm">{item.rut}</TableCell>
              <TableCell className="font-medium">
                {item.nombres || item.nombre_fantasia || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell>
                {item.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">{item.documentCount}</span>
                  {item.documentCount === 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Sin docs
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
