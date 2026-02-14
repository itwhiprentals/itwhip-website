// app/fleet/layout.tsx
// Server component wrapper — provides html/body for fleet portal
// (root layout is now a pass-through for i18n [locale] support)

import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import '@/app/globals.css'
import FleetLayoutClient from './FleetLayoutClient'
import enMessages from '@/messages/en.json'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

// Only pass Header/MobileMenu/Common namespaces — fleet portal stays English
const fleetMessages = {
  Header: enMessages.Header,
  MobileMenu: enMessages.MobileMenu,
  Footer: enMessages.Footer,
  Common: enMessages.Common,
}

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NextIntlClientProvider locale="en" messages={fleetMessages}>
          <FleetLayoutClient>{children}</FleetLayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
