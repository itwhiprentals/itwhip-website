// app/(guest)/hotels/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels - ItWhip',
  description: 'Book Phoenix hotels with instant ride benefits. Premium properties with integrated luxury transportation.',
}

export default function HotelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  )
}