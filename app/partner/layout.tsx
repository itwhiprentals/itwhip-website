// app/partner/layout.tsx
// Partner portal layout — providers only (html/body in root layout)

import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import PartnerLayoutClient from './PartnerLayoutClient'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

// Portal layouts only use a subset of namespaces; cast to bypass full-key equality check
const allMessages: Record<string, typeof enMessages> = {
  en: enMessages,
  es: esMessages as unknown as typeof enMessages,
  fr: frMessages as unknown as typeof enMessages,
}

function pickNamespaces(messages: typeof enMessages) {
  const m = messages as Record<string, any>
  return {
    Header: m.Header,
    MobileMenu: m.MobileMenu,
    Footer: m.Footer,
    Common: m.Common,
    Auth: m.Auth,
    // Partner auth pages
    PartnerLogin: m.PartnerLogin,
    PartnerForgotPassword: m.PartnerForgotPassword,
    PartnerResetPassword: m.PartnerResetPassword,
    // Partner portal namespaces
    PartnerNav: m.PartnerNav,
    PartnerDashboard: m.PartnerDashboard,
    PartnerFleet: m.PartnerFleet,
    PartnerBookings: m.PartnerBookings,
    PartnerBookingNew: m.PartnerBookingNew,
    PartnerCustomers: m.PartnerCustomers,
    // Tier 3
    PartnerTracking: m.PartnerTracking,
    PartnerRevenue: m.PartnerRevenue,
    PartnerAnalytics: m.PartnerAnalytics,
    PartnerMaintenance: m.PartnerMaintenance,
    PartnerClaims: m.PartnerClaims,
    // Tier 4
    PartnerCalendar: m.PartnerCalendar,
    PartnerReviews: m.PartnerReviews,
    PartnerMessages: m.PartnerMessages,
    PartnerInsurance: m.PartnerInsurance,
    PartnerLanding: m.PartnerLanding,
    PartnerDiscounts: m.PartnerDiscounts,
    PartnerSettings: m.PartnerSettings,
    HandoffHost: m.HandoffHost,
  }
}

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'en'
  const safeLocale = (locale in allMessages) ? locale : 'en'
  const partnerMessages = pickNamespaces(allMessages[safeLocale])

  return (
    <NextIntlClientProvider locale={safeLocale} messages={partnerMessages}>
      <PartnerLayoutClient>{children}</PartnerLayoutClient>
    </NextIntlClientProvider>
  )
}
