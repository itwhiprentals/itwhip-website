// app/(guest)/payments/components/PaymentsNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  IoCardOutline,
  IoWalletOutline,
  IoGiftOutline,
  IoChevronBackOutline
} from 'react-icons/io5'

const navItems = [
  { href: '/payments/methods', label: 'Payment Methods', icon: IoCardOutline },
  { href: '/payments/deposit', label: 'Deposit Wallet', icon: IoWalletOutline },
  { href: '/payments/credits', label: 'Credits & Bonus', icon: IoGiftOutline },
]

export default function PaymentsNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IoChevronBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Payments</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
