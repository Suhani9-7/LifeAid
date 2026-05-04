import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'
import { fetchNotifications } from '../lib/api'

export default function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
      .then((notifications) => {
        setUnreadCount(notifications.filter((notification) => !notification.is_read).length)
      })
      .catch(() => setUnreadCount(0))
  }, [])

  return (
    <Link to="/notifications" aria-label="Open notifications">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  )
}
