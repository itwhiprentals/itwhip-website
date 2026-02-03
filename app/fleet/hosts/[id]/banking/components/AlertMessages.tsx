// app/fleet/hosts/[id]/banking/components/AlertMessages.tsx
'use client'

import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoAlertCircleOutline } from 'react-icons/io5'

interface AlertMessagesProps {
  success: string | null
  error: string | null
  onDismissSuccess: () => void
  onDismissError: () => void
}

export function AlertMessages({ success, error, onDismissSuccess, onDismissError }: AlertMessagesProps) {
  return (
    <>
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoCheckmarkCircleOutline className="text-xl" />
            {success}
          </div>
          <button onClick={onDismissSuccess} className="text-green-700 hover:text-green-900">
            <IoCloseCircleOutline className="text-xl" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoAlertCircleOutline className="text-xl" />
            {error}
          </div>
          <button onClick={onDismissError} className="text-red-700 hover:text-red-900">
            <IoCloseCircleOutline className="text-xl" />
          </button>
        </div>
      )}
    </>
  )
}
