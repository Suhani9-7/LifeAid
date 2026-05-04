import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Bell, Mail, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { fetchNotifications, markNotificationRead } from '../lib/api'
import { getAuthSession, getRoleHomePath } from '../lib/auth'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const session = getAuthSession()
  const homePath = getRoleHomePath(session?.user?.role)

  useEffect(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {
        toast.error('Failed to load notifications')
        setNotifications([])
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    await Promise.all(
      notifications
        .filter((notification) => !notification.is_read)
        .map((notification) => markNotificationRead(String(notification.id)).catch(() => undefined))
    )
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
  }

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === id ? { ...notification, is_read: true } : notification
      )
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={homePath} className="mb-6 inline-flex items-center gap-2 text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-2">View all email and SMS notifications in one place.</p>
          </div>
          <Button
            variant="secondary"
            className="inline-flex items-center gap-2"
            onClick={handleMarkAllRead}
            disabled={notifications.every((notification) => notification.is_read)}
          >
            <Bell className="h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-2">
                <CardContent className="py-6 text-sm text-muted-foreground">Loading notification...</CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                No notifications yet.
              </CardContent>
            </Card>
          ) : notifications.map((notification) => (
            <Card key={notification.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {notification.notification_type === 'email' ? (
                      <Mail className="h-5 w-5 text-primary" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                    )}
                    <div>
                      <CardTitle className="text-base">{notification.message}</CardTitle>
                      <p className="text-xs text-muted-foreground">{notification.notification_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!notification.is_read && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkRead(String(notification.id))}>
                        Mark read
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
