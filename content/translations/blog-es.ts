// content/translations/blog-es.ts
// Spanish (Latin American) translations for blog posts
// Style: tú form, natural Latin American Spanish

import { blogTranslationsEsPart1 } from './blog-es-part1'
import { blogTranslationsEsPart2 } from './blog-es-part2'

export const blogTranslationsEs: Record<string, {
  title: string
  excerpt: string
  content: string
  keywords: string[]
}> = {
  ...blogTranslationsEsPart1,
  ...blogTranslationsEsPart2,
}
