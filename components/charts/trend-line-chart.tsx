'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendData {
  name: string
  [key: string]: string | number
}

interface TrendLineChartProps {
  title: string
  description?: string
  data: TrendData[]
  lines: Array<{
    key: string
    name: string
    color: string
    type?: 'line' | 'area'
  }>
  height?: number
  onClick?: (data: any) => void
}

export function TrendLineChart({
  title,
  description,
  data,
  lines,
  height = 300,
  onClick,
}: TrendLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-slate-400">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasArea = lines.some(l => l.type === 'area')

  return (
    <Card className="border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => onClick?.(data)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {hasArea ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Legend />
              {lines.map(line => (
                <Area
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  fill="url(#colorGrad)"
                  name={line.name}
                  isAnimationActive
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Legend />
              {lines.map(line => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  dot={{ fill: line.color, r: 4 }}
                  activeDot={{ r: 6 }}
                  name={line.name}
                  strokeWidth={2}
                  isAnimationActive
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
