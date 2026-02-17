// app/cancellation-policy/page.tsx
import { Metadata } from 'next'
import CancellationPolicyContent from './CancellationPolicyContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('cancellationPolicyTitle'),
    description: t('cancellationPolicyDescription'),
    openGraph: {
      title: t('cancellationPolicyOgTitle'),
      description: t('cancellationPolicyOgDescription'),
      url: 'https://itwhip.com/cancellation-policy',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/cancellation-policy',
    },
  }
}

export default function CancellationPolicyPage() {
  return <CancellationPolicyContent />
}
