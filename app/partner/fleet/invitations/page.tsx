// app/partner/fleet/invitations/page.tsx
// Dedicated invitations list page — full view with no limit

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IoChevronBack } from 'react-icons/io5'
import { useTranslations } from 'next-intl'
import InvitationsList from '@/app/partner/dashboard/components/InvitationsList'

export default function InvitationsPage() {
  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') as 'sent' | 'received') || 'sent'
  const t = useTranslations('Common')

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Link
        href="/partner/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <IoChevronBack className="w-4 h-4" />
        {t('back')}
      </Link>

      <InvitationsList
        initialTab={tab}
        limit={50}
        showViewAll={false}
      />
    </div>
  )
}
