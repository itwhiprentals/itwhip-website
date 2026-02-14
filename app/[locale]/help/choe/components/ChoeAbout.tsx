// app/help/choe/components/ChoeAbout.tsx
'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoSparklesOutline,
  IoChatbubbleEllipsesOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

export function ChoeAbout() {
  const t = useTranslations('HelpChoe')

  const aboutPoints = [
    {
      icon: IoSparklesOutline,
      titleKey: 'aboutPoint1Title' as const,
      descKey: 'aboutPoint1Desc' as const,
      accent: '#e87040'
    },
    {
      icon: IoChatbubbleEllipsesOutline,
      titleKey: 'aboutPoint2Title' as const,
      descKey: 'aboutPoint2Desc' as const,
      accent: '#ff7f50'
    },
    {
      icon: IoGlobeOutline,
      titleKey: 'aboutPoint3Title' as const,
      descKey: 'aboutPoint3Desc' as const,
      accent: '#d4a574'
    },
    {
      icon: IoRocketOutline,
      titleKey: 'aboutPoint4Title' as const,
      descKey: 'aboutPoint4Desc' as const,
      accent: '#c94c24'
    }
  ]

  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-[#0f0f0f] relative border-t border-gray-300 dark:border-[#222]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/50 dark:via-[#1a1a1a]/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t.rich('aboutTitle', { brand: (chunks) => <span className="text-[#e87040]">Choé</span> })}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto leading-relaxed">
            {t('aboutSubtitlePre')}
            <span className="font-semibold text-gray-900 dark:text-white">{t('aboutSubtitleHighlight')}</span>
            {t('aboutSubtitlePost')}
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
          {aboutPoints.map((point, index) => (
            <div
              key={point.titleKey}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#e87040]/10 dark:hover:shadow-[#e87040]/5 choe-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${point.accent}15` }}
                >
                  <point.icon className="w-6 h-6" style={{ color: point.accent }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 tracking-tight">
                    {t(point.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[#a8a8a8] leading-relaxed">
                    {t(point.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* choe.cloud callout - Arizona sunset gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#c94c24] via-[#e87040] to-[#ff7f50] rounded-lg p-6 sm:p-8">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-white mb-2 tracking-tight">{t('aboutCloudTitle')}</h3>
              <p className="text-sm sm:text-base text-white/80">
                {t('aboutCloudDesc')}
              </p>
            </div>
            <Link
              href="https://choe.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#c94c24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/90 transition-colors whitespace-nowrap shadow-lg"
            >
              {t('aboutCloudCta')}
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
