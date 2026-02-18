// app/blog/page.tsx
// Server wrapper — resolves localized posts and passes to client

import { getLocale } from 'next-intl/server'
import { categories } from '@/content/posts'
import { getLocalizedPosts } from '@/app/lib/blog'
import BlogListingClient from './BlogListingClient'

// Minimal listing data (no full HTML content sent to client)
export interface BlogListingPost {
  slug: string
  title: string
  excerpt: string
  category: string
  author: { name: string; role: string }
  publishedAt: string
  readTime: number
}

export default async function BlogPage() {
  const locale = await getLocale()
  const allPosts = getLocalizedPosts(locale)

  // Only pass listing-relevant fields (exclude heavy HTML content)
  const listingPosts: BlogListingPost[] = allPosts.map(({ slug, title, excerpt, category, author, publishedAt, readTime }) => ({
    slug, title, excerpt, category, author, publishedAt, readTime
  }))

  return <BlogListingClient posts={listingPosts} categories={[...categories]} />
}
