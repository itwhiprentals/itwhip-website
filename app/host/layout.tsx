// app/host/layout.tsx
// Host portal layout — providers only (html/body in root layout)
// Note: Host dashboard is being deprecated in favor of /partner/

import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
import { Providers } from '@/app/providers'
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
    <NextIntlClientProvider locale={safeLocale} messages={hostMessages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  )
}
