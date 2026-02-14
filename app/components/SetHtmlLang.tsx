// app/components/SetHtmlLang.tsx
// Sets the <html lang> attribute client-side for locale routes
// (Root layout defaults to lang="en", this updates it for es/fr/etc.)
'use client'

import { useEffect } from 'react'

export default function SetHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return null
}
