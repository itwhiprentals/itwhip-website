export default async function sitemap() {
  const baseUrl = 'https://itwhip.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/rentals/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Add dynamic car pages with SEO-friendly URLs
  let carPages = []
  try {
    const response = await fetch(`${baseUrl}/api/rentals/cars`)
    if (response.ok) {
      const data = await response.json()
      const cars = data.results || data.cars || data || []
      
      carPages = cars.map(car => {
        // Generate SEO-friendly slug
        const slug = `${car.year}-${car.make}-${car.model}-${car.city || 'phoenix'}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        return {
          url: `${baseUrl}/rentals/${slug}-${car.id}`,
          lastModified: car.updatedAt ? new Date(car.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }
      })
    }
  } catch (error) {
    console.error('Error fetching cars for sitemap:', error)
    // Continue without car pages if fetch fails
  }

  return [...staticPages, ...carPages]
}