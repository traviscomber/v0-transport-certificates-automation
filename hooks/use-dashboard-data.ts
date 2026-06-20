'use client'

import { useMemo } from 'react'

// Generate mock trend data for documents over time
export function useTrendData() {
  return useMemo(() => [
    { name: 'Ene', aprobados: 145, pendientes: 32, rechazados: 8 },
    { name: 'Feb', aprobados: 165, pendientes: 28, rechazados: 5 },
    { name: 'Mar', aprobados: 182, pendientes: 35, rechazados: 12 },
    { name: 'Abr', aprobados: 198, pendientes: 42, rechazados: 9 },
    { name: 'May', aprobados: 215, pendientes: 28, rechazados: 6 },
    { name: 'Jun', aprobados: 234, pendientes: 38, rechazados: 11 },
  ], [])
}

// Generate document status distribution
export function useDocumentDistribution() {
  return useMemo(() => [
    { name: 'Aprobados', value: 234, color: '#10b981' },
    { name: 'Pendientes', value: 38, color: '#f59e0b' },
    { name: 'Rechazados', value: 11, color: '#ef4444' },
    { name: 'Vencidos', value: 5, color: '#8b5cf6' },
  ], [])
}

// Generate conductor activity comparison
export function useConductorComparison() {
  return useMemo(() => [
    { name: 'Activos', mes_actual: 145, mes_anterior: 132 },
    { name: 'Inactivos', mes_actual: 28, mes_anterior: 35 },
    { name: 'Pendiente', mes_actual: 12, mes_anterior: 18 },
    { name: 'Vencidos', mes_actual: 8, mes_anterior: 14 },
  ], [])
}

// Generate KPI sparkline data
export function useSparklineData(days: number = 30) {
  return useMemo(() => {
    const data = []
    for (let i = 0; i < days; i++) {
      data.push({ value: Math.floor(Math.random() * 100) + 50 })
    }
    return data
  }, [days])
}

// Generate alerts based on data
export function useAlerts() {
  return useMemo(() => [
    {
      id: 'exp-soon',
      level: 'warning' as const,
      title: 'Certificados por vencer',
      message: '12 certificados vencen en los próximos 30 días',
      action: {
        label: 'Ver detalles',
        onClick: () => console.log('Navigate to expiring certificates'),
      },
    },
    {
      id: 'rejected',
      level: 'critical' as const,
      title: 'Documentos rechazados',
      message: '3 documentos rechazados requieren acción',
      action: {
        label: 'Revisar',
        onClick: () => console.log('Navigate to rejected documents'),
      },
    },
    {
      id: 'pending',
      level: 'info' as const,
      title: 'Documentos en revisión',
      message: '38 documentos están en proceso de aprobación',
    },
  ], [])
}

// Generate comparison period data
export function usePerformanceComparison() {
  return useMemo(() => ({
    current: {
      total: 287,
      aprobados: 234,
      pendientes: 38,
      rechazados: 11,
    },
    previous: {
      total: 273,
      aprobados: 215,
      pendientes: 42,
      rechazados: 16,
    },
  }), [])
}
