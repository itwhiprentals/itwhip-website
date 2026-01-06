// app/page.tsx
// Server Component - SSR for SEO with car links in initial HTML

import HomeClient from '@/app/components/home/HomeClient'
import { getESGCars, getP2PCars } from '@/app/lib/server/fetchHomeData'

export default async function HomePage() {
  // Fetch car data server-side with Prisma (no API calls)
  // This ensures Google sees car links in the initial HTML
  const [esgCars, cityCars] = await Promise.all([
    getESGCars(10),
    getP2PCars(undefined, 10) // Arizona-wide fallback, city refresh happens client-side
  ])

  return (
    <HomeClient
      initialEsgCars={esgCars}
      initialCityCars={cityCars}
    />
  )
}
