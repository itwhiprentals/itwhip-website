import { Metadata } from 'next'
import TermsContent from './TermsContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('termsTitle'),
    description: t('termsDescription'),
    openGraph: {
      title: t('termsOgTitle'),
      description: t('termsOgDescription'),
      url: 'https://itwhip.com/terms',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/terms',
    },
  }
}

export default function TermsPage() {
  return <TermsContent />
}
