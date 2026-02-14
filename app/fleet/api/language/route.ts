// app/fleet/api/language/route.ts
// Coverage Report API — returns language stats, namespace coverage, page status
// Phase 1 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../choe/auth'

// Language metadata (known languages — new ones detected from files)
const LANGUAGE_META: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Português', flag: '🇵🇹' },
  'pt-BR': { label: 'Português', flag: '🇧🇷' },
  ja: { label: '日本語', flag: '🇯🇵' },
  ko: { label: '한국어', flag: '🇰🇷' },
  zh: { label: '中文', flag: '🇨🇳' },
  'zh-CN': { label: '简体中文', flag: '🇨🇳' },
  'zh-TW': { label: '繁體中文', flag: '🇹🇼' },
  ar: { label: 'العربية', flag: '🇸🇦' },
  'es-MX': { label: 'Español (México)', flag: '🇲🇽' },
  'en-GB': { label: 'English (UK)', flag: '🇬🇧' },
}

// Page-to-namespace mapping for active pages
const PAGE_NAMESPACE_MAP: Record<string, string[]> = {
  '/': ['Home', 'Header', 'Footer'],
  '/about': ['About'],
  '/how-it-works': ['HowItWorks'],
  '/rentals': ['RentalsHome', 'SearchResults'],
  '/rentals/search': ['SearchResults', 'Search'],
  '/rentals/budget': ['RentalsBudget'],
  '/rentals/corporate-travel': ['RentalsCorporateTravel'],
  '/rentals/cities': ['RentalCities'],
  '/rentals/[carId]': ['CarDetails', 'BookingWidget', 'PhotoGallery', 'SimilarCars', 'HostProfile', 'ReviewSection', 'DateRangePicker'],
  '/rentals/[carId]/book': ['BookingPage'],
  '/rentals/manage': ['GuestDashboard'],
  '/rentals/trip/start/[id]': ['TripStart'],
  '/rentals/trip/end/[id]': ['TripEnd', 'PaymentConfirm'],
  '/rentals/dashboard/bookings/[id]': ['BookingDetail', 'ModifyBooking'],
  '/dashboard': ['GuestDashboard'],
  '/messages': ['GuestMessages'],
  '/claims': ['Claims'],
  '/claims/new': ['NewClaim'],
  '/claims/[id]': ['ClaimDetail'],
  '/payments': ['Payments'],
  '/payments/methods': ['PaymentMethods'],
  '/payments/deposit': ['DepositWallet'],
  '/payments/credits': ['Credits'],
  '/profile': ['ProfilePage', 'TabNav', 'ProfileTab', 'DocumentsTab', 'PaymentTab', 'ReviewsProfileTab', 'InsuranceTab', 'SecurityTab'],
  '/blog': ['Blog'],
  '/faq': ['FAQ'],
  '/drive': ['Drive'],
  '/calculator': ['Calculator'],
  '/careers': ['Careers'],
  '/careers/[id]': ['CareerDetail'],
  '/pricing': ['Pricing'],
  '/contact': ['Contact'],
  '/list-your-car': ['ListYourCar'],
  '/insurance-guide': ['InsuranceGuide'],
  '/coverage': ['Coverage'],
  '/legal': ['Legal'],
  '/privacy': ['Privacy'],
  '/terms': ['Terms'],
  '/driver-requirements': ['DriverRequirements'],
  '/host-benefits': ['HostBenefits'],
  '/host-earnings': ['HostEarnings'],
  '/host-protection': ['HostProtection'],
  '/host-requirements': ['HostRequirements'],
  '/host-university': ['HostUniversity'],
  '/corporate': ['Corporate'],
  '/hotel-solutions': ['HotelSolutions'],
  '/private-club': ['PrivateClub'],
  '/sdk': ['SDK'],
  '/developers': ['Developers'],
  '/integrations': ['Integrations'],
  '/investors': ['Investors'],
  '/gds': ['GDS'],
  '/press': ['Press'],
  '/accessibility': ['Accessibility'],
  '/esg-dashboard': ['ESGDashboard'],
  '/get-started': ['GetStarted'],
  '/get-started/business': ['GetStartedBusiness'],
  '/mileage-forensics': ['MileageForensics'],
  '/security/bounty': ['SecurityBounty'],
  '/reviews': ['ReviewsCars'],
  '/rideshare': ['Rideshare'],
  '/choe': ['ChoeAI'],
  '/help/choe': ['HelpChoe'],
  '/help/guest-account': ['HelpGuestAccount'],
  '/help/host-account': ['HelpHostAccount'],
  '/help/identity-verification': ['HelpIdentityVerification'],
  '/cancellation-policy': ['CancellationPolicy'],
  '/platform-agreement': ['PlatformAgreement'],
  '/support': ['Support'],
  '/support/booking': ['SupportBooking'],
  '/support/claims': ['SupportClaims'],
  '/support/cleaning-policy': ['SupportCleaningPolicy'],
  '/support/damage-process': ['SupportDamageProcess'],
  '/support/deposits': ['SupportDeposits'],
  '/support/extend-rental': ['SupportExtendRental'],
  '/support/insurance': ['SupportInsurance'],
  '/support/insurance-coverage': ['SupportInsuranceCoverage'],
  '/support/modify-reservation': ['SupportModifyReservation'],
  '/support/payments': ['SupportPayments'],
  '/support/roadside': ['SupportRoadside'],
  '/support/vehicle-issues': ['SupportVehicleIssues'],
  '/support/verification': ['SupportVerification'],
  '/partners/apply': ['PartnersApply'],
  '/partners/commission': ['PartnersCommission'],
  '/partners/resources': ['PartnersResources'],
  '/auth/login': ['Auth'],
  '/auth/signup': ['Auth'],
  '/auth/forgot-password': ['Auth'],
  '/host/signup': ['HostSignup'],
  '/portal/login': ['PortalLogin'],
  '/portal/dashboard': ['PortalDashboard'],
  '/portal/drivers': ['PortalDrivers'],
  '/portal/reservations': ['PortalReservations'],
  '/partner/dashboard': ['PartnerDashboard', 'PartnerNav'],
  '/partner/fleet': ['PartnerFleet', 'PartnerNav'],
  '/partner/bookings': ['PartnerBookings', 'PartnerNav'],
  '/partner/bookings/new': ['PartnerBookingNew', 'PartnerNav'],
  '/partner/customers': ['PartnerCustomers', 'PartnerNav'],
  '/partner/tracking': ['PartnerTracking', 'PartnerNav'],
  '/partner/revenue': ['PartnerRevenue', 'PartnerNav'],
  '/partner/analytics': ['PartnerAnalytics', 'PartnerNav'],
  '/partner/maintenance': ['PartnerMaintenance', 'PartnerNav'],
  '/partner/claims': ['PartnerClaims', 'PartnerNav'],
  '/partner/calendar': ['PartnerCalendar', 'PartnerNav'],
  '/partner/reviews': ['PartnerReviews', 'PartnerNav'],
  '/partner/messages': ['PartnerMessages', 'PartnerNav'],
  '/partner/insurance': ['PartnerInsurance', 'PartnerNav'],
  '/partner/landing': ['PartnerLanding', 'PartnerNav'],
  '/partner/discounts': ['PartnerDiscounts', 'PartnerNav'],
  '/partner/settings': ['PartnerSettings', 'PartnerNav'],
}

// Count leaf keys in a nested object
function countLeafKeys(obj: Record<string, unknown>): number {
  let count = 0
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      count += countLeafKeys(val as Record<string, unknown>)
    } else {
      count++
    }
  }
  return count
}

// Get all leaf key paths from a nested object
function getLeafKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getLeafKeyPaths(val as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messagesDir = path.join(process.cwd(), 'messages')

    // Scan for all JSON files in messages/
    const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && !f.startsWith('.'))
    const localeCodes = files.map(f => f.replace('.json', ''))

    // Load all message files
    const allMessages: Record<string, Record<string, unknown>> = {}
    const fileStats: Record<string, Date> = {}

    for (const code of localeCodes) {
      const filePath = path.join(messagesDir, `${code}.json`)
      const content = fs.readFileSync(filePath, 'utf-8')
      allMessages[code] = JSON.parse(content)
      const stat = fs.statSync(filePath)
      fileStats[code] = stat.mtime
    }

    const enMessages = allMessages['en'] || {}
    const enNamespaces = Object.keys(enMessages)

    // Build language overview
    const enTotalKeys = enNamespaces.reduce((sum, ns) => {
      return sum + countLeafKeys((enMessages[ns] as Record<string, unknown>) || {})
    }, 0)

    const languages = localeCodes.map(code => {
      const msgs = allMessages[code] || {}
      const totalKeys = enNamespaces.reduce((sum, ns) => {
        return sum + countLeafKeys((msgs[ns] as Record<string, unknown>) || {})
      }, 0)
      const meta = LANGUAGE_META[code] || { label: code, flag: '🏳️' }
      return {
        code,
        label: meta.label,
        flag: meta.flag,
        totalKeys,
        completion: enTotalKeys > 0 ? Math.round((totalKeys / enTotalKeys) * 10000) / 100 : 100,
        enabled: true,
        isDefault: code === 'en',
        lastModified: fileStats[code]?.toISOString() || null,
      }
    })

    // Build namespace coverage
    const nonEnLocales = localeCodes.filter(c => c !== 'en')
    const namespaces = enNamespaces.map(ns => {
      const enKeys = getLeafKeyPaths((enMessages[ns] as Record<string, unknown>) || {})
      const enCount = enKeys.length

      const entry: Record<string, unknown> = {
        name: ns,
        en: enCount,
      }

      // Track missing keys per locale
      const missingByLocale: Record<string, string[]> = {}
      let allComplete = true

      for (const locale of nonEnLocales) {
        const localeNs = (allMessages[locale]?.[ns] as Record<string, unknown>) || {}
        const localeKeys = getLeafKeyPaths(localeNs)
        const localeCount = localeKeys.length
        entry[locale] = localeCount

        const missing = enKeys.filter(k => !localeKeys.includes(k))
        missingByLocale[locale] = missing
        if (missing.length > 0) allComplete = false
      }

      // Find pages using this namespace
      const usedBy = Object.entries(PAGE_NAMESPACE_MAP)
        .filter(([, nsList]) => nsList.includes(ns))
        .map(([pagePath]) => pagePath)

      return {
        ...entry,
        status: allComplete ? 'complete' : 'incomplete',
        missing: missingByLocale,
        usedBy,
      }
    })

    // Build page translation status
    const pages = Object.entries(PAGE_NAMESPACE_MAP).map(([pagePath, pageNamespaces]) => {
      let allTranslated = true
      for (const locale of nonEnLocales) {
        for (const ns of pageNamespaces) {
          const enKeys = getLeafKeyPaths((enMessages[ns] as Record<string, unknown>) || {})
          const localeNs = (allMessages[locale]?.[ns] as Record<string, unknown>) || {}
          const localeKeys = getLeafKeyPaths(localeNs)
          if (enKeys.some(k => !localeKeys.includes(k))) {
            allTranslated = false
            break
          }
        }
        if (!allTranslated) break
      }
      return {
        path: pagePath,
        namespaces: pageNamespaces,
        status: allTranslated ? 'translated' : 'incomplete',
      }
    })

    // Build summary
    const totalMissingKeys: Record<string, number> = {}
    for (const locale of nonEnLocales) {
      totalMissingKeys[locale] = namespaces.reduce((sum, ns) => {
        const missing = (ns.missing as Record<string, string[]>)?.[locale] || []
        return sum + missing.length
      }, 0)
    }

    const totalKeys: Record<string, number> = {}
    for (const lang of languages) {
      totalKeys[lang.code] = lang.totalKeys
    }

    // Count namespaces used by at least one page
    const usedNamespaceSet = new Set<string>()
    Object.values(PAGE_NAMESPACE_MAP).forEach(nsList => {
      nsList.forEach(ns => usedNamespaceSet.add(ns))
    })
    // Also add shared namespaces that are always used
    ;['Header', 'Footer', 'MobileMenu', 'Common', 'Metadata', 'Errors', 'SeoMeta', 'Auth'].forEach(ns => usedNamespaceSet.add(ns))

    const activeNamespaces = enNamespaces.filter(ns => usedNamespaceSet.has(ns)).length

    const summary = {
      totalNamespaces: enNamespaces.length,
      activeNamespaces,
      unusedNamespaces: enNamespaces.length - activeNamespaces,
      totalKeys,
      totalMissingKeys,
    }

    return NextResponse.json({
      languages,
      namespaces,
      pages,
      summary,
    })
  } catch (error) {
    console.error('[Language API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate coverage report' },
      { status: 500 }
    )
  }
}
