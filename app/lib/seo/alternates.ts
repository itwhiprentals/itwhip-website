const BASE_URL = 'https://itwhip.com'

/**
 * Generate hreflang alternate URLs for all supported locales.
 * English uses the root path, Spanish/French get /es/ and /fr/ prefixes.
 */
export function getAlternateLanguages(path: string) {
  return {
    'en': `${BASE_URL}${path}`,
    'es': `${BASE_URL}/es${path}`,
    'fr': `${BASE_URL}/fr${path}`,
    'x-default': `${BASE_URL}${path}`,
  }
}

/** Return the locale-aware canonical URL for a given path and locale */
export function getCanonicalUrl(path: string, locale: string) {
  if (locale === 'en') return `${BASE_URL}${path}`
  return `${BASE_URL}/${locale}${path}`
}

/** Map locale code to OpenGraph locale string */
export function getOgLocale(locale: string) {
  const map: Record<string, string> = { en: 'en_US', es: 'es_ES', fr: 'fr_FR' }
  return map[locale] || 'en_US'
}
