import { Metadata } from 'next'
import ContactContent from './ContactContent'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SeoMeta' })

  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    openGraph: {
      title: t('contactOgTitle'),
      description: t('contactOgDescription'),
      url: 'https://itwhip.com/contact',
      type: 'website',
    },
    alternates: {
      canonical: 'https://itwhip.com/contact',
    },
  }
}

export default function ContactPage() {
  return <ContactContent />
}
