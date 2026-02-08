// app/components/notifications/NotificationCarousel.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useNotifications } from '../useNotifications'
import NotificationCard from '../NotificationCard'

interface NotificationCarouselProps {
  userRole?: 'GUEST' | 'HOST' | 'ADMIN'
}

export default function NotificationCarousel({ userRole = 'GUEST' }: NotificationCarouselProps) {
  const router = useRouter()
  const { notifications, dismissNotification, dismissing } = useNotifications({
    userRole,
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Don't render if no notifications
  if (notifications.length === 0) {
    return null
  }

  const handleCardClick = (actionUrl: string) => {
    router.push(actionUrl)
  }

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId)
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Horizontal Scrolling Container */}
        <div 
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {notifications.map((notification: any) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onCardClick={handleCardClick}
              onDismiss={handleDismiss}
              isDismissing={dismissing === notification.id}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}