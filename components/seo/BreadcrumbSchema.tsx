// components/seo/BreadcrumbSchema.tsx
// Breadcrumb structured data for better Google search results display
// https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

'use client'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) return null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  )
}

// Pre-built breadcrumb generators for common page types
export function generateRentalBreadcrumbs(carName: string, carUrl: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: carName, url: carUrl }
  ]
}

export function generateCityBreadcrumbs(cityName: string, citySlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: 'Cities', url: 'https://itwhip.com/rentals/cities' },
    { name: cityName, url: `https://itwhip.com/rentals/cities/${citySlug}` }
  ]
}

export function generateTypeBreadcrumbs(typeName: string, typeSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: 'Vehicle Types', url: 'https://itwhip.com/rentals/types' },
    { name: typeName, url: `https://itwhip.com/rentals/types/${typeSlug}` }
  ]
}

export function generateMakeBreadcrumbs(makeName: string, makeSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: 'Makes', url: 'https://itwhip.com/rentals/makes' },
    { name: makeName, url: `https://itwhip.com/rentals/makes/${makeSlug}` }
  ]
}

export function generateMakeModelBreadcrumbs(
  makeName: string,
  makeSlug: string,
  modelName: string,
  modelSlug: string
): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: 'Makes', url: 'https://itwhip.com/rentals/makes' },
    { name: makeName, url: `https://itwhip.com/rentals/makes/${makeSlug}` },
    { name: modelName, url: `https://itwhip.com/rentals/makes/${makeSlug}/${modelSlug}` }
  ]
}

export function generateAirportBreadcrumbs(airportName: string, airportSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Rentals', url: 'https://itwhip.com/rentals' },
    { name: 'Airports', url: 'https://itwhip.com/rentals/airports' },
    { name: airportName, url: `https://itwhip.com/rentals/airports/${airportSlug}` }
  ]
}

export function generateHostBreadcrumbs(pageName: string, pageSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'List Your Car', url: 'https://itwhip.com/list-your-car' },
    { name: pageName, url: `https://itwhip.com/${pageSlug}` }
  ]
}

export function generateBlogBreadcrumbs(postTitle: string, postSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Blog', url: 'https://itwhip.com/blog' },
    { name: postTitle, url: `https://itwhip.com/blog/${postSlug}` }
  ]
}

export function generateSupportBreadcrumbs(pageName: string, pageSlug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: 'https://itwhip.com' },
    { name: 'Support', url: 'https://itwhip.com/support' },
    { name: pageName, url: `https://itwhip.com/support/${pageSlug}` }
  ]
}
