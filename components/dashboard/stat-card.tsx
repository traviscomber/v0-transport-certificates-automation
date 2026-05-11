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
}

// Memoized stat card component to prevent unnecessary re-renders
const StatCard = React.memo<StatCardProps>(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  status, 
  href 
}) => {
  const router = useRouter()
  
  return (
    <Card 
      onClick={() => router.push(href)}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-orange-500/50 hover:scale-105 ${
        status === "warning" ? "border-orange-500/30" : ""
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = "StatCard"

export { StatCard }
