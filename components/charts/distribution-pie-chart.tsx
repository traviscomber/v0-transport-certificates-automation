'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DistributionData {
  name: string
  value: number
  color: string
}

interface DistributionPieChartProps {
  title: string
  description?: string
  data: DistributionData[]
  height?: number
  showLabels?: boolean
  onClick?: (data: any) => void
}

export function DistributionPieChart({
  title,
  description,
  data,
  height = 300,
  showLabels = true,
  onClick,
}: DistributionPieChartProps) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => onClick?.(data)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                'Count',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
