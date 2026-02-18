// content/translations/blog-fr.ts
// French translations for blog posts
// Style: formal vous form

import { blogTranslationsFrPart1 } from './blog-fr-part1'
import { blogTranslationsFrPart2 } from './blog-fr-part2'

export const blogTranslationsFr: Record<string, {
  title: string
  excerpt: string
  content: string
  keywords: string[]
}> = {
  ...blogTranslationsFrPart1,
  ...blogTranslationsFrPart2,
}
