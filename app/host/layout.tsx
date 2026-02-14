// app/host/layout.tsx
// Server component wrapper — provides html/body for host portal
// (root layout is now a pass-through for i18n [locale] support)
// Note: Host dashboard is being deprecated in favor of /partner/

import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import '@/app/globals.css'
import { Providers } from '@/app/providers'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import frMessages from '@/messages/fr.json'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const allMessages: Record<string, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
}

function pickNamespaces(messages: typeof enMessages) {
  return {
    Header: messages.Header,
    MobileMenu: messages.MobileMenu,
    Footer: messages.Footer,
    Common: messages.Common,
    Auth: messages.Auth,
    HostSignup: (messages as any).HostSignup,
  }
}

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'en'
  const safeLocale = (locale in allMessages) ? locale : 'en'
  const hostMessages = pickNamespaces(allMessages[safeLocale])

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NextIntlClientProvider locale={safeLocale} messages={hostMessages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
