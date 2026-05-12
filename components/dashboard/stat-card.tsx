"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${currentColor.bg} ${currentColor.border} ${currentColor.accent} hover:scale-105`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${currentColor.value}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Icon className={`h-8 w-8 ${currentColor.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = "StatCard"

export { StatCard }
