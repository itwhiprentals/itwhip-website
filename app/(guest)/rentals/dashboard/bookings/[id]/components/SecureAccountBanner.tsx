// app/(guest)/rentals/dashboard/bookings/[id]/components/SecureAccountBanner.tsx

import React from 'react'
import { IoKeyOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'

interface SecureAccountBannerProps {
  hasPassword: boolean | null
}

export const SecureAccountBanner: React.FC<SecureAccountBannerProps> = ({ hasPassword }) => {
  if (hasPassword !== false) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
          <IoKeyOutline className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-800">
            Secure Your Account
          </h4>
          <p className="text-xs text-amber-700 mt-1">
            Your account was created via booking link. Set a password to secure it and
            login from any device. This temporary account expires in 7 days if not secured
            and any reservation associated will be canceled.
          </p>
          <a
            href="/profile?tab=security"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
            Set Password
          </a>
        </div>
      </div>
    </div>
  )
}
