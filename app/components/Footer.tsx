// app/components/Footer.tsx

'use client'

import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoApple,
  IoLogoGooglePlaystore
} from 'react-icons/io5'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations('Footer')

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-5">
        {/* Top Row: Logo + Language Switcher */}
        <div className="flex items-start justify-between mb-4 md:mb-6">
          {/* Logo and Branding */}
          <div className="flex flex-col items-start">
            <div className="relative ml-3 mt-1 w-7 h-7 rounded-full overflow-hidden bg-white dark:bg-gray-800">
              {/* Light mode logo */}
              <Image
                src="/logo.png"
                alt="ItWhip"
                fill
                className="object-contain dark:hidden"
                style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
              />
              {/* Dark mode logo */}
              <Image
                src="/logo-white.png"
                alt="ItWhip"
                fill
                className="object-contain hidden dark:block"
                style={{ transform: 'scale(1.15) translateY(0.5px)', transformOrigin: 'center center' }}
              />
            </div>
            <span className="text-[8px] text-gray-700 dark:text-gray-300 tracking-widest uppercase font-medium mt-0.5">
              ITWHIP RIDES
            </span>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 -ml-0.5">
              {t('peerToPeer')}
            </p>
            {/* Social Links */}
            <div className="flex space-x-3 mt-3">
              <a
                href="https://www.facebook.com/people/Itwhipcom/61573990760395/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/itwhipofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/itwhipofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/itwhip/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="LinkedIn"
              >
                <IoLogoLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Language Switcher — right corner, aligned with logo */}
          <div className="mt-1">
            <LanguageSwitcher variant="footer" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4 mb-8">

          {/* For Guests */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('forGuests')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/help/guest-account" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('guestAccount')}
                </Link>
              </li>
              <li>
                <Link href="/rentals/budget" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('budgetCars')}
                </Link>
              </li>
              <li>
                <Link href="/rentals/daily" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('dailyRentals')}
                </Link>
              </li>
              <li>
                <Link href="/rentals/long-term" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('longTermRentals')}
                </Link>
              </li>
              <li>
                <Link href="/trip-planner" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('tripPlanner')}
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('reviews')}
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-xs md:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
                  {t('guestPortal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hosts */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('forHosts')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/help/host-account" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('hostAccount')}
                </Link>
              </li>
              <li>
                <Link href="/list-your-car" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('listYourCar')}
                </Link>
              </li>
              <li>
                <Link href="/switch-from-turo" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('switchFromTuro')}
                </Link>
              </li>
              <li>
                <Link href="/host-university" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('hostUniversity')}
                </Link>
              </li>
              <li>
                <Link href="/host/fleet-owners" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('fleetOwners')}
                </Link>
              </li>
              <li>
                <Link href="/host/payouts" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('payoutsEarnings')}
                </Link>
              </li>
              <li>
                <Link href="/insurance-guide" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('insuranceGuide')}
                </Link>
              </li>
              <li>
                <NextLink href="/host/login" className="text-xs md:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
                  {t('hostPortal')}
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('support')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/support" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/support/insurance" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('insuranceSupport')}
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('cancellationPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('coverageAreas')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('companySection')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/how-it-works" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/help/identity-verification" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('identityVerification')}
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('press')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('corporateRentals')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('technology')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/tracking" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('fleetTracking')}
                </Link>
              </li>
              <li>
                <Link href="/mileage-forensics" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('mileageForensics')}
                </Link>
              </li>
              <li>
                <Link href="/esg-dashboard" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('esgDashboard')}
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('developerApis')}
                </Link>
              </li>
              <li>
                <Link href="/sdk" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('instantRideSdk')}
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('integrations')}
                </Link>
              </li>
              <li>
                <Link href="/help/choe" className="text-xs md:text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors">
                  {t('choeAi')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('partners')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/partners/apply" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('becomePartner')}
                </Link>
              </li>
              <li>
                <Link href="/rideshare" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('rideshareRentals')}
                </Link>
              </li>
              <li>
                <Link href="/partners/commission" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('commissionTiers')}
                </Link>
              </li>
              <li>
                <Link href="/partners/resources" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('partnerResources')}
                </Link>
              </li>
              <li>
                <NextLink href="/partner/login" className="text-xs md:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
                  {t('partnersPortal')}
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              {t('legal')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/terms" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/platform-agreement" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('platformAgreement')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('accessibility')}
                </Link>
              </li>
              <li>
                <Link href="/investors" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t('investors')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular Cities - SEO internal linking */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">{t('popularCities')}</span>
            <Link href="/rentals/cities/phoenix" className="hover:text-gray-900 dark:hover:text-white transition-colors">Phoenix</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/scottsdale" className="hover:text-gray-900 dark:hover:text-white transition-colors">Scottsdale</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/tempe" className="hover:text-gray-900 dark:hover:text-white transition-colors">Tempe</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/mesa" className="hover:text-gray-900 dark:hover:text-white transition-colors">Mesa</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/chandler" className="hover:text-gray-900 dark:hover:text-white transition-colors">Chandler</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/gilbert" className="hover:text-gray-900 dark:hover:text-white transition-colors">Gilbert</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/glendale" className="hover:text-gray-900 dark:hover:text-white transition-colors">Glendale</Link>
            <span className="text-gray-400">·</span>
            <Link href="/rentals/cities/peoria" className="hover:text-gray-900 dark:hover:text-white transition-colors">Peoria</Link>
          </div>
        </div>

        {/* App Download Section with Countdown */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {t('downloadApp')}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('availableOn')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://testflight.apple.com/join/ygzsQbNf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoApple className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90 leading-tight">{t('downloadOnThe')}</div>
                    <div className="text-sm font-bold -mt-0.5">{t('appStore')}</div>
                  </div>
                </div>
                <div className="absolute bottom-1 right-2">
                  <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-medium">{t('beta')}</span>
                </div>
              </a>

              <a
                href="#"
                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg opacity-90"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoGooglePlaystore className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90 leading-tight">{t('getItOn')}</div>
                    <div className="text-sm font-bold -mt-0.5">{t('googlePlay')}</div>
                  </div>
                </div>
                <div className="absolute top-1 right-2">
                  <span className="text-[9px] bg-orange-800 px-1.5 py-0.5 rounded text-white font-medium">{t('soon')}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs text-gray-600 dark:text-gray-500">
                {t('copyright', { year: currentYear })}
              </p>
              <div className="flex space-x-4 text-xs text-gray-600 dark:text-gray-500">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {t('terms')}
                </Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {t('privacy')}
                </Link>
                <Link href="/accessibility" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {t('accessibility')}
                </Link>
                <Link href="/status" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  {t('status')}
                </Link>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-500">
              <span>{t('phoenixArizona')}</span>
              <span>•</span>
              <span>{t('unitedStates')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
