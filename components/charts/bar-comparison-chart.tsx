'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ComparisonData {
  name: string
  [key: string]: string | number
}

interface BarComparisonChartProps {
  title: string
  description?: string
  data: ComparisonData[]
  bars: Array<{
    key: string
    name: string
    color: string
  }>
  height?: number
  layout?: 'vertical' | 'horizontal'
  onClick?: (data: any) => void
}

export function BarComparisonChart({
  title,
  description,
  data,
  bars,
  height = 300,
  layout = 'vertical',
  onClick,
}: BarComparisonChartProps) {
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

  return (
    <Card className="border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => onClick?.(data)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis stroke="#94a3b8" type={layout === 'vertical' ? 'number' : 'category'} />
            <YAxis stroke="#94a3b8" type={layout === 'vertical' ? 'category' : 'number'} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend />
            {bars.map(bar => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color}
                name={bar.name}
                radius={[8, 8, 0, 0]}
                isAnimationActive
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
