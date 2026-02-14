// app/fleet/layout.tsx
// Fleet portal layout — providers only (html/body in root layout)

import { NextIntlClientProvider } from 'next-intl'
import FleetLayoutClient from './FleetLayoutClient'
import enMessages from '@/messages/en.json'

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
    <NextIntlClientProvider locale="en" messages={fleetMessages}>
      <FleetLayoutClient>{children}</FleetLayoutClient>
    </NextIntlClientProvider>
  )
}
