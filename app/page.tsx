// app/page.tsx
// Server Component - SSR for SEO with car links in initial HTML

import HomeClient from '@/app/components/home/HomeClient'
import { getESGCars, getP2PCars } from '@/app/lib/server/fetchHomeData'

// Force dynamic rendering - fresh cars on every page load
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch car data server-side with Prisma (no API calls)
  // This ensures Google sees car links in the initial HTML

  // Fetch ESG cars first, then P2P with ESG IDs excluded to prevent duplicates
  const esgCars = await getESGCars(10)
  const esgCarIds = esgCars.map(c => c.id)
  const cityCars = await getP2PCars(undefined, 10, esgCarIds)

  return (
    <HomeClient
      initialEsgCars={esgCars}
      initialCityCars={cityCars}
    />
  )
}
