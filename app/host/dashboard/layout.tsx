// app/host/layout.tsx

import { Metadata } from 'next'
import Header from '@/app/components/Header'

export const metadata: Metadata = {
  title: 'Host Portal - ItWhip',
  description: 'Manage your car rental business on ItWhip',
}

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </>
  )
}