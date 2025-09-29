import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
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

  const unreadNotifications = notifications.filter((n) => !n.is_read)
  const readNotifications = notifications.filter((n) => n.is_read)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
          <CardDescription>
            {unreadNotifications.length} notificaciones sin leer de {notifications.length} totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">Las notificaciones del sistema aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unread Notifications */}
              {unreadNotifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                    Sin leer ({unreadNotifications.length})
                  </h4>
                  <div className="space-y-3">
                    {unreadNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-4 border rounded-lg bg-primary/5 border-primary/20"
                      >
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{notification.title}</h5>
                            <Badge variant="secondary" className={getTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Para: {notification.profiles.full_name}</span>
                            <span>{new Date(notification.created_at).toLocaleString("es-CL")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Notifications */}
              {readNotifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                    Leídas ({readNotifications.length})
                  </h4>
                  <div className="space-y-3">
                    {readNotifications.slice(0, 20).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{notification.title}</h5>
                            <Badge variant="secondary" className={getTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Para: {notification.profiles.full_name}</span>
                            <span>{new Date(notification.created_at).toLocaleString("es-CL")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
