// app/[locale]/auth/layout.tsx
// Auth pages should not be indexed by search engines

import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
