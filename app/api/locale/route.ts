// app/api/locale/route.ts
// Sets NEXT_LOCALE cookie for partner portal locale switching
// (Guest portal uses [locale] routing; partner portal uses this cookie instead)

import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LOCALES = ['en', 'es', 'fr']

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json()

    if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale. Supported: en, es, fr' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true, locale })

    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Client needs to read this
      sameSite: 'lax',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
