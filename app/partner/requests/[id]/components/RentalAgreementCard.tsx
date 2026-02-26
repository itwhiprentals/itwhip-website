'use client'

import { useTranslations } from 'next-intl'
import {
  IoDocumentTextOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoSendOutline,
  IoEyeOutline
} from 'react-icons/io5'
import AgreementUpload from './AgreementUpload'

interface RentalAgreementCardProps {
  agreementUploaded: boolean
  expanded: boolean
  onToggle: () => void
  onShowTestPdf: () => void
  onShowPreview: () => void
  onRefresh: () => void
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
  }
}

export default function RentalAgreementCard({
  agreementUploaded,
  expanded,
  onToggle,
  onShowTestPdf,
  onShowPreview,
  onRefresh,
  existingAgreement,
}: RentalAgreementCardProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <div id="agreement-section" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('rentalAgreement')}</h3>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            agreementUploaded
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {agreementUploaded ? t('uploaded') : t('notUploaded')}
          </span>
        </div>
        {expanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Host's Agreement - with AI validation */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{t('yourRentalAgreement')}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('optional')}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('uploadAgreementDesc')}
            </p>

            <AgreementUpload
              onUploadSuccess={onRefresh}
              existingAgreement={existingAgreement}
            />

            {agreementUploaded && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={onShowTestPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium"
                >
                  <IoSendOutline className="w-4 h-4" />
                  {t('testESignExperience')}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {t('previewGuestSigning')}
                </p>
              </div>
            )}
          </div>

          {/* ItWhip Agreement */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{t('itwhipStandardAgreement')}</h4>
              <span className="text-xs text-purple-600 dark:text-purple-400">{t('required')}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('standardTermsDesc')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onShowPreview}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              >
                <IoEyeOutline className="w-4 h-4" />
                {t('previewAgreement')}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('guestWillSignBoth')}
          </p>
        </div>
      )}
    </div>
  )
}
