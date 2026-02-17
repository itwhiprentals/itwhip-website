import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Payouts & Earnings | Stripe Connect | ItWhip',
  description: 'Get paid fast with ItWhip. Secure Stripe Connect payouts, instant transfers available, and transparent earnings. Hosts earn up to 90% with direct deposit in 2-3 days.',
  keywords: ['car sharing payouts', 'host earnings payment', 'stripe connect car rental', 'turo payout alternative', 'instant car host payout', 'when do hosts get paid'],
  openGraph: {
    title: 'Host Payouts & Earnings | Stripe Connect | ItWhip',
    description: 'Secure, fast payouts powered by Stripe. Earn up to 90% and get paid within 2-3 business days.',
    url: 'https://itwhip.com/host/payouts',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/payouts',
  },
}

export default function PayoutsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
