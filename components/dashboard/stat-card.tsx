"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  status: "active" | "warning"
  href: string
  color?: "blue" | "green" | "orange" | "red"
}

// Memoized stat card component to prevent unnecessary re-renders
const StatCard = React.memo<StatCardProps>(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  status, 
  href,
  color = "blue"
}) => {
  const router = useRouter()

  // Color mappings for each stat type
  const colorClasses = {
    blue: {
      bg: "bg-blue-950/40",
      border: "border-blue-500/30 hover:border-blue-500/60",
      icon: "text-blue-400",
      accent: "hover:shadow-blue-500/20",
      value: "text-blue-300",
    },
    green: {
      bg: "bg-green-950/40",
      border: "border-green-500/30 hover:border-green-500/60",
      icon: "text-green-400",
      accent: "hover:shadow-green-500/20",
      value: "text-green-300",
    },
    orange: {
      bg: "bg-orange-950/40",
      border: "border-orange-500/30 hover:border-orange-500/60",
      icon: "text-orange-400",
      accent: "hover:shadow-orange-500/20",
      value: "text-orange-300",
    },
    red: {
      bg: "bg-red-950/40",
      border: "border-red-500/30 hover:border-red-500/60",
      icon: "text-red-400",
      accent: "hover:shadow-red-500/20",
      value: "text-red-300",
    },
  }

  const currentColor = colorClasses[color]
  
  return (
    <Card 
      onClick={() => router.push(href)}
      className={`group relative overflow-hidden cursor-pointer border transition-all duration-300 hover:shadow-xl ${currentColor.bg} ${currentColor.border} ${currentColor.accent} hover:-translate-y-1`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color === 'green' ? 'from-emerald-400 to-emerald-200' : color === 'orange' ? 'from-orange-400 to-amber-200' : color === 'red' ? 'from-red-400 to-rose-200' : 'from-blue-400 to-cyan-200'}`} />
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 ${currentColor.icon}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <Badge
                variant="secondary"
                className={`ml-auto text-[10px] uppercase tracking-[0.2em] ${
                  status === "warning"
                    ? "bg-red-500/15 text-red-300 border-red-500/20"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                }`}
              >
                {status === "warning" ? "Atención" : "Activo"}
              </Badge>
            </div>
            <p className={`text-4xl font-bold tracking-tight ${currentColor.value}`}>{value}</p>
            <p className="text-xs text-muted-foreground max-w-[16rem]">{description}</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 group-hover:text-slate-300 transition-colors">
              Abrir módulo
            </p>
          </div>
          <div className="ml-2 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <Icon className={`h-8 w-8 ${currentColor.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = "StatCard"

export { StatCard }
