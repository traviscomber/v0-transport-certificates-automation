'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react'

interface SparklineData {
  value: number
}

interface KPICardSparklineProps {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendPercent?: number
  sparklineData?: SparklineData[]
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  onClick?: () => void
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', sparkline: '#3b82f6' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', sparkline: '#10b981' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', sparkline: '#ef4444' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', sparkline: '#f59e0b' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', sparkline: '#a855f7' },
}

export function KPICardSparkline({
  title,
  value,
  unit,
  trend,
  trendPercent,
  sparklineData,
  color = 'blue',
  onClick,
}: KPICardSparklineProps) {
  const { bg, text, sparkline } = colorMap[color]
  const trendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : TrendingUp

  return (
    <Card
      className={`${bg} border-slate-700 p-4 cursor-pointer hover:border-slate-600 transition-all`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          {trendPercent !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${text}`}>
              {trendPercent > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(trendPercent)}%
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${text}`}>{value}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkline}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
