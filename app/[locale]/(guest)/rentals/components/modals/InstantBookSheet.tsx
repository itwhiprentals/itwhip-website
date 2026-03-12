'use client'

import BottomSheet from '@/app/components/BottomSheet'
import { IoFlashOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoShieldCheckmarkOutline, IoCloseCircleOutline } from 'react-icons/io5'

interface InstantBookSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function InstantBookSheet({ isOpen, onClose }: InstantBookSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Book"
      subtitle="Book immediately — no wait, no approval needed"
      size="medium"
      showDragHandle
    >
      <div className="space-y-5 pb-2">

        {/* What it means */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <IoFlashOutline className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">Your booking is confirmed instantly</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              No waiting for the host to accept. Once you complete checkout, the booking is locked in and you receive confirmation right away.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">How it works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Select your dates and checkout</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pick your pickup and return times, complete payment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Confirmed automatically</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">No host approval required — your booking is active immediately.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Get pickup details</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You'll receive the exact address, access instructions, and host contact right after booking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What still applies */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">What still applies</h3>
          <div className="space-y-2">
            {[
              { icon: IoTimeOutline, text: 'Advance notice window — book at least the required hours before pickup' },
              { icon: IoShieldCheckmarkOutline, text: 'Identity verification is still required before your trip starts' },
              { icon: IoCheckmarkCircleOutline, text: 'Cancellation policy applies if you need to cancel after booking' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Not instant book note */}
        <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <IoCloseCircleOutline className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Vehicles <span className="font-medium">without</span> Instant Book require the host to manually approve your request within 24 hours. If not approved, you are not charged.
          </p>
        </div>

      </div>
    </BottomSheet>
  )
}
