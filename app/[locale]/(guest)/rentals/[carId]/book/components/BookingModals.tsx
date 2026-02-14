'use client'

import { useTranslations } from 'next-intl'
import { IoWarningOutline } from 'react-icons/io5'
import RentalAgreementModal from '@/app/[locale]/(guest)/rentals/components/modals/RentalAgreementModal'
import InsuranceRequirementsModal from '@/app/[locale]/(guest)/rentals/components/modals/InsuranceRequirementsModal'
import TrustSafetyModal from '@/app/[locale]/(guest)/rentals/components/modals/TrustSafetyModal'

interface BookingModalsProps {
  showRentalAgreement: boolean
  onCloseRentalAgreement: () => void
  showInsuranceModal: boolean
  onCloseInsuranceModal: () => void
  showTrustSafetyModal: boolean
  onCloseTrustSafetyModal: () => void
  showManualApprovalModal: string | null
  onCloseManualApprovalModal: () => void
  onAcceptManualApproval: () => void
  car: any
  savedBookingDetails: any
  guestName: string
  guestEmail: string
}

export function BookingModals({
  showRentalAgreement,
  onCloseRentalAgreement,
  showInsuranceModal,
  onCloseInsuranceModal,
  showTrustSafetyModal,
  onCloseTrustSafetyModal,
  showManualApprovalModal,
  onCloseManualApprovalModal,
  onAcceptManualApproval,
  car,
  savedBookingDetails,
  guestName,
  guestEmail
}: BookingModalsProps) {
  const t = useTranslations('BookingPage')

  return (
    <>
      <RentalAgreementModal
        isOpen={showRentalAgreement}
        onClose={onCloseRentalAgreement}
        carDetails={car}
        bookingDetails={savedBookingDetails}
        guestDetails={{
          name: guestName,
          email: guestEmail,
          bookingCode: '',
          verificationStatus: 'PENDING'
        }}
        isDraft={true}
      />

      <InsuranceRequirementsModal
        isOpen={showInsuranceModal}
        onClose={onCloseInsuranceModal}
      />

      <TrustSafetyModal
        isOpen={showTrustSafetyModal}
        onClose={onCloseTrustSafetyModal}
      />

      {showManualApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoWarningOutline className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">{t('manualApprovalRequired')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">{showManualApprovalModal}</p>
            <div className="flex gap-3">
              <button
                onClick={onCloseManualApprovalModal}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onAcceptManualApproval}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
              >
                {t('continueAnyway')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
