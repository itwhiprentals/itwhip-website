import { Link } from '@/i18n/navigation'
import { IoChevronForwardOutline, IoHomeOutline } from 'react-icons/io5'
import { getTranslations } from 'next-intl/server'

interface BreadcrumbsProps {
  type?: string
  make?: string
}

export default async function Breadcrumbs({ type, make }: BreadcrumbsProps) {
  const t = await getTranslations('RentalsCatalog')

  const TYPE_LABELS: Record<string, string> = {
    suv: t('suvs'),
    sedan: t('sedans'),
    luxury: t('luxuryCars'),
    electric: t('electricVehicles'),
    truck: t('trucks'),
    sports: t('sportsCars'),
    convertible: t('convertibles')
  }

  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbRentals'), href: '/rentals' }
  ]

  // Add type breadcrumb
  if (type) {
    const typeLabel = TYPE_LABELS[type.toLowerCase()] || type
    breadcrumbs.push({
      label: typeLabel,
      href: `/rentals?type=${type.toLowerCase()}`
    })
  }

  // Add make breadcrumb
  if (make) {
    breadcrumbs.push({
      label: make,
      href: type
        ? `/rentals?type=${type.toLowerCase()}&make=${make}`
        : `/rentals?make=${make}`
    })
  }

  // BreadcrumbList schema for SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://itwhip.com${crumb.href}`
    }))
  }

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <IoChevronForwardOutline className="w-4 h-4 text-gray-400 mx-1" />
                )}

                {isLast ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    {index === 0 && <IoHomeOutline className="w-4 h-4" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
