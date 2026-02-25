'use client'

import { useTranslations } from 'next-intl'
import { Calendar, FileText, CreditCard } from './DashboardIcons'

interface QuickActionsProps {
  onServiceClick: (path: string) => void
}

export default function QuickActions({ onServiceClick }: QuickActionsProps) {
  const t = useTranslations('GuestDashboard')

  const services = [
    {
      id: 'bookings',
      name: t('myBookings'),
      icon: Calendar,
      iconColorClass: 'text-blue-600 dark:text-blue-400',
      path: '/rentals/dashboard/bookings',
    },
    {
      id: 'claim',
      name: t('fileAClaim'),
      icon: FileText,
      iconColorClass: 'text-orange-600 dark:text-orange-400',
      path: '/claims/new',
    },
    {
      id: 'payments',
      name: t('updatePayment'),
      icon: CreditCard,
      iconColorClass: 'text-purple-600 dark:text-purple-400',
      path: '/payments/methods',
    },
  ]

  return (
    <div className="-mx-2 sm:mx-0 flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onServiceClick(service.path)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 active:scale-95"
        >
          <service.icon className={`w-4 h-4 ${service.iconColorClass}`} aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {service.name}
          </span>
        </button>
      ))}
    </div>
  )
}
