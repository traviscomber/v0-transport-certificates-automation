"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, AlertTriangle, XCircle, CheckCircle, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationCardProps {
  notification: Notification
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const markAsRead = async () => {
    setIsLoading(true)
    try {
      await (supabase as any).from("notifications").update({ is_read: true }).eq("id", notification.id)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`${!notification.is_read ? "border-primary/50 bg-primary/5" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getTypeIcon(notification.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <Badge variant="secondary" className={getTypeColor(notification.type)}>
                  {notification.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.created_at).toLocaleString("es-CL")}
              </p>
            </div>
          </div>
          {!notification.is_read && (
            <Button variant="ghost" size="sm" onClick={markAsRead} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
