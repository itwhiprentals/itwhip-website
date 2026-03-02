'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import {
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoLockClosedOutline,
  IoChatbubblesOutline,
  IoGiftOutline,
  IoListOutline,
  IoPersonOutline,
  IoCameraOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoSpeedometerOutline,
  IoStarOutline,
  IoCashOutline,
  IoBriefcaseOutline,
  IoSearchOutline,
  IoPeopleOutline,
} from 'react-icons/io5'

interface HowItWorksSheetProps {
  isOpen: boolean
  onClose: () => void
  onGetStarted: () => void
}

export default function HowItWorksSheet({ isOpen, onClose, onGetStarted }: HowItWorksSheetProps) {
  const t = useTranslations('PartnerRequestDetail')

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('hiwTitle')}
      size="large"
      showDragHandle={true}
      footer={
        <div>
          <button
            onClick={onGetStarted}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            {t('hiwGetStarted')}
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">{t('hiwGetStartedSub')}</p>
        </div>
      }
    >
      {/* Section 1: Why Add Your Car First? */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoCarSportOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection1Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('hiwSection1Body')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection1Extra')}</p>
        {/* Mini car listing card mockup */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex gap-3">
            <div className="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoCameraOutline className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('hiwYourCar')}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <IoStarOutline className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-gray-500">5.0</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                $XX/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Your Guest Is Already Verified */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection2Title')}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection2Body')}</p>
          {/* 4 verification badges */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: IoPersonOutline, label: t('hiwVerifiedId') },
              { icon: IoCameraOutline, label: t('hiwVerifiedSelfie') },
              { icon: IoCardOutline, label: t('hiwVerifiedPayment') },
              { icon: IoCheckmarkCircleOutline, label: t('hiwVerifiedTerms') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                <Icon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">{label}</span>
              </div>
            ))}
          </div>
          <Link
            href="https://itwhip.com/help/identity-verification"
            target="_blank"
            className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
          >
            {t('hiwSection2Link')}
          </Link>
      </div>

      {/* Section 3: Get Paid Your Way */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoWalletOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection3Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection3Body')}</p>
        {/* 2 side-by-side payment cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <IoBriefcaseOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t('hiwDirectDeposit')}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('hiwDirectDepositDesc')}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <IoCashOutline className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">{t('hiwCashPickup')}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('hiwCashPickupDesc')}</p>
          </div>
        </div>
      </div>

      {/* Section 4: Your Car Is Protected */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoLockClosedOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection4Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection4Body')}</p>
        {/* Protection grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: IoDocumentTextOutline, label: t('hiwProtectAgreement') },
            { icon: IoSpeedometerOutline, label: t('hiwProtectMileage') },
            { icon: IoStarOutline, label: t('hiwProtectReviews') },
            { icon: IoCameraOutline, label: t('hiwProtectPhotos') },
            { icon: IoSearchOutline, label: t('hiwProtectFraud') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>
        {/* Fraud detection callout */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">{t('hiwProtectFraudDesc')}</p>
        </div>
      </div>

      {/* Section 5: AI-Powered Support — Meet Choé */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoChatbubblesOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection5Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection5Body')}</p>
        {/* Chat conversation mockup */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 space-y-3">
          {/* Choé intro message */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-orange-600">C</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cho&eacute;</p>
              <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-300">{t('hiwChoeMessage')}</p>
              </div>
            </div>
          </div>
          {/* Guest question */}
          <div className="flex justify-end">
            <div className="bg-blue-500 rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-xs text-white">{t('hiwChoeGuestQ')}</p>
            </div>
          </div>
          {/* Choé reply */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-orange-600">C</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cho&eacute;</p>
              <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-300">{t('hiwChoeGuestA')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Your Welcome Rate */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoGiftOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection6Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection6Body')}</p>
        {/* Tier steps with clear welcome rate visual */}
        <div className="space-y-2">
          {/* Standard tier — highlighted with welcome rate */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Standard</span>
              <span className="text-xs text-gray-400">(0-9 {t('hiwCars')})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">
                10% {t('hiwNow')}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">25%</span>
            </div>
          </div>
          {/* Other tiers */}
          {[
            { tier: 'Gold', rate: '20%', cars: '10-49' },
            { tier: 'Platinum', rate: '15%', cars: '50-99' },
            { tier: 'Diamond', rate: '10%', cars: '100+' },
          ].map(({ tier, rate, cars }) => (
            <div
              key={tier}
              className="flex items-center justify-between px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{tier}</span>
                <span className="text-xs text-gray-400">({cars} {t('hiwCars')})</span>
              </div>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7: What Happens Next */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoListOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection7Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('hiwSection7Body')}</p>
        {/* 4-step vertical stepper with time estimates */}
        <div className="space-y-0">
          {[
            { step: 1, label: t('hiwStep1'), time: t('hiwStep1Time') },
            { step: 2, label: t('hiwStep2'), time: t('hiwStep2Time') },
            { step: 3, label: t('hiwStep3'), time: t('hiwStep3Time') },
            { step: 4, label: t('hiwStep4'), time: t('hiwStep4Time') },
          ].map(({ step, label, time }, idx) => (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step}
                </div>
                {idx < 3 && <div className="w-0.5 h-6 bg-orange-200 dark:bg-orange-800" />}
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{time}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-3">{t('hiwStep7Total')}</p>
      </div>

      {/* Section 8: You're Not Alone */}
      <div className="py-5">
        <div className="flex items-start gap-3 mb-3">
          <IoPeopleOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('hiwSection8Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('hiwSection8Body')}</p>
      </div>
    </BottomSheet>
  )
}
