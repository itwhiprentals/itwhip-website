// app/lib/blog.ts
// Locale-aware blog helpers — server-side only (imports translation data)

import { type BlogPost, blogPosts, getPostBySlug } from '@/content/posts'
import { blogTranslationsEs } from '@/content/translations/blog-es'
import { blogTranslationsFr } from '@/content/translations/blog-fr'

export type BlogTranslation = {
  title: string
  excerpt: string
  content: string
  keywords: string[]
}

const translationMaps: Record<string, Record<string, BlogTranslation>> = {
  es: blogTranslationsEs,
  fr: blogTranslationsFr,
}

export function getLocalizedPost(post: BlogPost, locale: string): BlogPost {
  if (locale === 'en') return post
  const translations = translationMaps[locale]
  if (!translations) return post
  const t = translations[post.slug]
  if (!t) return post
  return {
    ...post,
    title: t.title,
    excerpt: t.excerpt,
    content: t.content,
    keywords: t.keywords,
  }
}

export function getLocalizedPosts(locale: string): BlogPost[] {
  return blogPosts.map(post => getLocalizedPost(post, locale))
}

export function getLocalizedPostBySlug(slug: string, locale: string): BlogPost | undefined {
  const post = getPostBySlug(slug)
  if (!post) return undefined
  return getLocalizedPost(post, locale)
}

/** Check if a post has a translation for the given locale */
export function hasTranslation(slug: string, locale: string): boolean {
  if (locale === 'en') return true
  const translations = translationMaps[locale]
  return !!translations?.[slug]
}
