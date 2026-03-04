'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import {
  IoWalletOutline,
  IoSwapHorizontalOutline,
  IoGiftOutline,
  IoTrendingDownOutline,
  IoCashOutline,
  IoSettingsOutline,
  IoGridOutline,
  IoEyeOffOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoCarSportOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoCardOutline,
  IoCameraOutline,
  IoChatbubblesOutline,
  IoPersonAddOutline,
  IoNavigateOutline,
  IoStarOutline,
  IoSpeedometerOutline,
  IoTrendingUpOutline,
  IoBriefcaseOutline,
  IoLockClosedSharp,
} from 'react-icons/io5'

interface RevenueLearnMoreSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function RevenueLearnMoreSheet({ isOpen, onClose }: RevenueLearnMoreSheetProps) {
  const t = useTranslations('PartnerDashboard')

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('rlsTitle')}
      size="large"
      showDragHandle={true}
      footer={
        <div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
          >
            {t('rlsGotIt')}
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">{t('rlsContactSupport')}</p>
        </div>
      }
    >
      {/* ═══ 1. How Your Revenue Works ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoWalletOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSection1Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('rlsSection1Body')}</p>
      </div>

      {/* ═══ 2. Two Revenue Paths ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoSwapHorizontalOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSection2Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsSection2Intro')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('rlsInsuranceTiers')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('rlsInsuranceDesc')}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{t('rlsBasicCoverage')}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep40')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{t('rlsStandardCoverage')}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep75')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{t('rlsPremiumCoverage')}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep90')}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('rlsCommissionTiers')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('rlsCommissionDesc')}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Standard (1-9)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep75')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Gold (10-49)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep80')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Platinum (50-99)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep85')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Diamond (100+)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{t('rlsKeep90')}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{t('rlsRecruitedNote')}</p>
      </div>

      {/* ═══ 3. Your Welcome Rate — 10% ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoGiftOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSection3Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsSection3Body')}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">{t('rlsFirstBooking')}</p>
              <p className="text-xs text-green-600 dark:text-green-400">$1,000 → {t('rlsYouKeep')} $900</p>
            </div>
            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">10%</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('rlsSecondBooking')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">$1,000 → {t('rlsYouKeep')} $750</p>
            </div>
            <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full font-bold">25%</span>
          </div>
        </div>
      </div>

      {/* ═══ 4. How to Lower Your Commission ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoTrendingDownOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSection4Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsSection4Body')}</p>
        <div className="space-y-0">
          {[
            { tier: 'Standard', cars: '1-9', rate: '25%', active: true },
            { tier: 'Gold', cars: '10-49', rate: '20%', active: false },
            { tier: 'Platinum', cars: '50-99', rate: '15%', active: false },
            { tier: 'Diamond', cars: '100+', rate: '10%', active: false },
          ].map(({ tier, cars, rate, active }, idx) => (
            <div key={tier} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  active ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />}
              </div>
              <div className="flex-1 flex items-center justify-between py-1">
                <div>
                  <span className={`text-sm font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{tier}</span>
                  <span className="text-xs text-gray-400 ml-1.5">({cars} {t('rlsCars')})</span>
                </div>
                <span className={`text-sm font-bold ${active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>{rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 5. Accept Cash or Card — Your Choice (merged with When You Get Paid) ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoCashOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsPayChoiceTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsPayChoiceBody')}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <IoBriefcaseOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('rlsPayBankTitle')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('rlsPayBankDesc')}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <IoCashOutline className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('rlsPayCashTitle')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('rlsPayCashDesc')}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('rlsPayChoiceFooter')}</p>
      </div>

      {/* ═══ 6. Your Car Doesn't Need to Be Listed ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoEyeOffOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsCarPrivateTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsCarPrivateBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsCarPrivateBody2')}</p>
        {/* Private booking visual */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <IoCarSportOutline className="w-7 h-7 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <IoLockClosedSharp className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <IoArrowForwardOutline className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <IoPersonOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-[10px] text-gray-500 font-medium">{t('rlsCarPrivateGuest')}</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3 font-medium">{t('rlsCarPrivateLabel')}</p>
        </div>
      </div>

      {/* ═══ 7. Verify Your Customers ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoShieldCheckmarkOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsVerifyTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsVerifyBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsVerifyBody2')}</p>
        {/* Verification flow */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          {[
            { icon: IoCardOutline, label: t('rlsVerifyStepId'), color: 'text-blue-500' },
            { icon: IoCameraOutline, label: t('rlsVerifyStepSelfie'), color: 'text-purple-500' },
            { icon: IoSearchOutline, label: t('rlsVerifyStepFraud'), color: 'text-orange-500' },
            { icon: IoCheckmarkCircleOutline, label: t('rlsVerifyStepDone'), color: 'text-green-500' },
          ].map(({ icon: Icon, label, color }, idx) => (
            <div key={label} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-center gap-0 w-full justify-center">
                {idx > 0 && <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600 -mr-1" />}
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0 z-10">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {idx < 3 && <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600 -ml-1" />}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 8. Digital Agreements — E-Signed Before Pickup ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoDocumentTextOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsEsignTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsEsignBody')}</p>
        <div className="space-y-2 mb-4">
          {[
            { label: t('rlsEsignOpt1'), desc: t('rlsEsignOpt1Desc'), recommended: true },
            { label: t('rlsEsignOpt2'), desc: t('rlsEsignOpt2Desc'), recommended: false },
            { label: t('rlsEsignOpt3'), desc: t('rlsEsignOpt3Desc'), recommended: false },
          ].map(({ label, desc, recommended }) => (
            <div key={label} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 border ${
              recommended
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <IoDocumentTextOutline className={`w-4 h-4 flex-shrink-0 mt-0.5 ${recommended ? 'text-orange-500' : 'text-gray-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${recommended ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {label}
                  {recommended && <span className="ml-1.5 text-[10px] font-medium bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">{t('rlsRecommended')}</span>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('rlsEsignFooter')}</p>
      </div>

      {/* ═══ 9. Full Self-Service Dashboard ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoGridOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsDashTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsDashBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsDashBody2')}</p>
        {/* Mini dashboard mockup */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: IoWalletOutline, label: t('rlsDashEarnings'), value: '$2,450', color: 'text-green-500' },
            { icon: IoCarSportOutline, label: t('rlsDashTrips'), value: '3', color: 'text-blue-500' },
            { icon: IoCarSportOutline, label: t('rlsDashVehicles'), value: '2', color: 'text-orange-500' },
            { icon: IoCashOutline, label: t('rlsDashPayouts'), value: '$1,840', color: 'text-purple-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <Icon className={`w-4 h-4 ${color} mb-1.5`} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 10. Choé AI — Your 24/7 Support ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <Image src="/images/choe-logo.png" alt="Choé" width={24} height={24} className="w-6 h-6 rounded flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsChoeTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsChoeBody')}</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            t('rlsChoeCap1'),
            t('rlsChoeCap2'),
            t('rlsChoeCap3'),
            t('rlsChoeCap4'),
          ].map((cap) => (
            <div key={cap} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <IoCheckmarkCircleOutline className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{cap}</span>
            </div>
          ))}
        </div>
        {/* Chat mockup */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-start gap-2">
            <Image src="/images/choe-logo.png" alt="Choé" width={32} height={32} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cho&eacute;</p>
              <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-300">{t('rlsChoeMsg1')}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-500 rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-xs text-white">{t('rlsChoeGuestQ')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Image src="/images/choe-logo.png" alt="Choé" width={32} height={32} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cho&eacute;</p>
              <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-300">{t('rlsChoeGuestA')}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{t('rlsChoeFooter')}</p>
      </div>

      {/* ═══ 11. Search-Optimized Listings ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoSearchOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSeoTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsSeoBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsSeoBody2')}</p>
        {/* Google search result mockup */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
          <p className="text-xs text-green-700 dark:text-green-500 mb-0.5">itwhip.com › rentals › phoenix</p>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">{t('rlsSeoResult')}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-0.5">
              <IoStarOutline className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>{t('rlsSeoRating')}</span>
            </div>
            <span>·</span>
            <span>{t('rlsSeoPrice')}</span>
          </div>
        </div>
      </div>

      {/* ═══ 12. Access to Our Existing Customers ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoPeopleOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsAccessTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsAccessBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsAccessBody2')}</p>
        {/* Guest profile cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Sarah M.', trips: 12, rating: 4.9 },
            { name: 'James R.', trips: 8, rating: 5.0 },
            { name: 'Maria L.', trips: 5, rating: 4.8 },
          ].map(({ name, trips, rating }) => (
            <div key={name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-1.5">
                <IoPersonOutline className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{name}</p>
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <IoStarOutline className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-gray-500">{rating}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{trips} {t('rlsAccessTrips')}</p>
              <span className="inline-block text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full mt-1 font-medium">{t('rlsAccessVerified')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 13. Built by a Rental Company — For Rental Companies ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoBusinessOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsBuiltTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{t('rlsBuiltBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsBuiltBody2')}</p>
        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: IoCashOutline, label: t('rlsBuiltCash') },
            { icon: IoSpeedometerOutline, label: t('rlsBuiltMileage') },
            { icon: IoGridOutline, label: t('rlsBuiltFleet') },
            { icon: IoTrendingUpOutline, label: t('rlsBuiltTiers') },
            { icon: IoDocumentTextOutline, label: t('rlsBuiltAgreements') },
            { icon: IoShieldCheckmarkOutline, label: t('rlsBuiltInsurance') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
              <Icon className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('rlsBuiltBody3')}</p>
      </div>

      {/* ═══ 14. Guest Messaging ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoChatbubblesOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsMsgTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('rlsMsgBody')}</p>
      </div>

      {/* ═══ 15. Create Guests for Manual Bookings ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoPersonAddOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsGuestCreateTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('rlsGuestCreateBody')}</p>
      </div>

      {/* ═══ 16. Handoff & Real-Time Tracking ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoNavigateOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsHandoffTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsHandoffBody')}</p>
        <div className="space-y-2">
          {[
            { num: '1', label: t('rlsHandoffStep1') },
            { num: '2', label: t('rlsHandoffStep2') },
            { num: '3', label: t('rlsHandoffStep3') },
            { num: '4', label: t('rlsHandoffStep4') },
            { num: '5', label: t('rlsHandoffStep5') },
            { num: '6', label: t('rlsHandoffStep6') },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{num}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 17. Return Protection ═══ */}
      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <IoCameraOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsReturnTitle')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('rlsReturnBody')}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2 font-medium">{t('rlsReturnBody2')}</p>
      </div>

      {/* ═══ 18. Setup Required ═══ */}
      <div className="py-5">
        <div className="flex items-start gap-3 mb-3">
          <IoSettingsOutline className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{t('rlsSection6Title')}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t('rlsSection6Body')}</p>
        <div className="space-y-2">
          {[
            { num: '1', label: t('rlsSetup1') },
            { num: '2', label: t('rlsSetup2') },
            { num: '3', label: t('rlsSetup3') },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{num}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{t('rlsSetupIncomplete')}</p>
      </div>
    </BottomSheet>
  )
}
