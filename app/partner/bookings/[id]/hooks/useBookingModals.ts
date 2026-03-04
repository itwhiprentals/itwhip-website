// app/partner/bookings/[id]/hooks/useBookingModals.ts
// Consolidates all modal/dialog boolean states for the booking detail page

import { useState } from 'react'

export function useBookingModals() {
  // Charge / Edit / Extend modals
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)

  // Host reject modal + reason
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Confirmation action modal (generic)
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    message: string
    onConfirm: () => void
    isDangerous?: boolean
  } | null>(null)

  // Car activation modals
  const [showCarActivateModal, setShowCarActivateModal] = useState(false)
  const [showCarNotApprovedModal, setShowCarNotApprovedModal] = useState(false)

  // Onboard guest modal
  const [showOnboardModal, setShowOnboardModal] = useState(false)

  // Learn more bottomsheets
  const [showTaxInfo, setShowTaxInfo] = useState(false)
  const [showVerificationInfo, setShowVerificationInfo] = useState(false)

  return {
    showChargeModal, setShowChargeModal,
    showEditModal, setShowEditModal,
    showExtendModal, setShowExtendModal,
    showRejectModal, setShowRejectModal,
    rejectReason, setRejectReason,
    confirmAction, setConfirmAction,
    showCarActivateModal, setShowCarActivateModal,
    showCarNotApprovedModal, setShowCarNotApprovedModal,
    showOnboardModal, setShowOnboardModal,
    showTaxInfo, setShowTaxInfo,
    showVerificationInfo, setShowVerificationInfo,
  }
}
