// app/security/bounty/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  IoBugOutline,
  IoTrophyOutline,
  IoCashOutline,
  IoChevronForwardOutline,
  IoTimerOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoSkullOutline,
  IoFlashOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoLockClosedOutline,
  IoTerminalOutline,
  IoGitNetworkOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoMailOutline
} from 'react-icons/io5'

export default function BugBountyPage() {
  const t = useTranslations('SecurityBounty')
  const [totalPaid, setTotalPaid] = useState(892500)
  const [activeBounty, setActiveBounty] = useState(247000)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Increment bounty amount
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBounty(prev => prev + 100)
    }, 30000) // Increase every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Bounty tiers
  const bountyTiers = [
    {
      severityKey: 'critical' as const,
      amount: '$10,000',
      color: 'red',
      descriptionKey: 'tierCriticalDesc' as const,
      exampleKeys: ['tierCriticalEx1', 'tierCriticalEx2', 'tierCriticalEx3', 'tierCriticalEx4'] as const
    },
    {
      severityKey: 'high' as const,
      amount: '$5,000',
      color: 'orange',
      descriptionKey: 'tierHighDesc' as const,
      exampleKeys: ['tierHighEx1', 'tierHighEx2', 'tierHighEx3', 'tierHighEx4'] as const
    },
    {
      severityKey: 'medium' as const,
      amount: '$1,000',
      color: 'yellow',
      descriptionKey: 'tierMediumDesc' as const,
      exampleKeys: ['tierMediumEx1', 'tierMediumEx2', 'tierMediumEx3', 'tierMediumEx4'] as const
    },
    {
      severityKey: 'low' as const,
      amount: '$500',
      color: 'blue',
      descriptionKey: 'tierLowDesc' as const,
      exampleKeys: ['tierLowEx1', 'tierLowEx2', 'tierLowEx3', 'tierLowEx4'] as const
    }
  ]

  // Hall of Fame researchers
  const hallOfFame = [
    {
      rank: 1,
      name: 'BugBountyPro',
      avatar: '👨‍💻',
      country: '🇺🇸',
      findings: 47,
      earned: '$67,500',
      badge: 'platinum'
    },
    {
      rank: 2,
      name: 'SecurityNinja',
      avatar: '🥷',
      country: '🇯🇵',
      findings: 32,
      earned: '$45,000',
      badge: 'gold'
    },
    {
      rank: 3,
      name: 'WhiteHat_2024',
      avatar: '🎩',
      country: '🇮🇳',
      findings: 28,
      earned: '$38,500',
      badge: 'gold'
    },
    {
      rank: 4,
      name: 'CyberWarrior',
      avatar: '⚔️',
      country: '🇷🇺',
      findings: 23,
      earned: '$31,000',
      badge: 'silver'
    },
    {
      rank: 5,
      name: 'Bug_Hunter_X',
      avatar: '🔍',
      country: '🇧🇷',
      findings: 19,
      earned: '$24,500',
      badge: 'silver'
    }
  ]

  // Recent submissions
  const recentSubmissions = [
    {
      id: '#8471',
      severity: 'critical',
      titleKey: 'submission1Title' as const,
      status: 'paid',
      amount: '$10,000',
      dateKey: 'submission1Date' as const,
      researcher: 'BugBountyPro'
    },
    {
      id: '#8469',
      severity: 'high',
      titleKey: 'submission2Title' as const,
      status: 'paid',
      amount: '$5,000',
      dateKey: 'submission2Date' as const,
      researcher: 'SecurityNinja'
    },
    {
      id: '#8467',
      severity: 'medium',
      titleKey: 'submission3Title' as const,
      status: 'triaging',
      amount: 'TBD',
      dateKey: 'submission3Date' as const,
      researcher: 'NewHacker123'
    },
    {
      id: '#8465',
      severity: 'low',
      titleKey: 'submission4Title' as const,
      status: 'rejected',
      amount: '$0',
      dateKey: 'submission4Date' as const,
      researcher: 'Anonymous'
    },
    {
      id: '#8463',
      severity: 'high',
      titleKey: 'submission5Title' as const,
      status: 'paid',
      amount: '$5,000',
      dateKey: 'submission5Date' as const,
      researcher: 'WhiteHat_2024'
    }
  ]

  // Scope categories
  const scopeCategories = [
    {
      nameKey: 'scopeWebApp' as const,
      inScope: true,
      domains: ['*.itwhip.com', 'api.itwhip.com', 'portal.itwhip.com'],
      priority: 'high'
    },
    {
      nameKey: 'scopeMobileApps' as const,
      inScope: true,
      domains: ['iOS App', 'Android App'],
      priority: 'high'
    },
    {
      nameKey: 'scopeAPIs' as const,
      inScope: true,
      domains: ['REST APIs', 'GraphQL', 'WebSocket'],
      priority: 'critical'
    },
    {
      nameKey: 'scopeInfrastructure' as const,
      inScope: false,
      domains: ['AWS', 'Cloudflare'],
      priority: 'none'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">{t('statusPaid')}</span>
      case 'triaging':
        return <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded">{t('statusTriaging')}</span>
      case 'rejected':
        return <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded">{t('statusRejected')}</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/security" className="inline-flex items-center text-green-200 hover:text-white mb-4 transition-colors">
            <IoChevronForwardOutline className="w-4 h-4 rotate-180 mr-1" />
            {t('backToSecurity')}
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoBugOutline className="w-12 h-12 text-yellow-400 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  {t('title')}
                </h1>
                <p className="text-xl text-green-200 mt-2">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-green-200">{t('totalPaidOut')}</div>
              <div className="text-3xl font-bold">${totalPaid.toLocaleString()}</div>
              <div className="text-sm text-green-200">{t('since2019')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bounty Pool */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoTrophyOutline className="w-8 h-8 mr-3" />
              <div>
                <div className="text-sm font-medium">{t('currentBountyPool')}</div>
                <div className="text-2xl font-bold">${activeBounty.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">{t('increasesEveryFailed')}</div>
              <div className="text-xs opacity-80">{t('noSuccessfulBreach')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-12 text-white">
          <div className="text-center">
            <IoRocketOutline className="w-16 h-16 mx-auto mb-4 text-purple-200" />
            <h2 className="text-3xl font-bold mb-4">
              {t('startHunting')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8 text-left max-w-4xl mx-auto">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">{t('step1Title')}</div>
                <p className="text-purple-100">{t('step1Desc')}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">{t('step2Title')}</div>
                <p className="text-purple-100">{t('step2Desc')}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <div className="text-2xl font-bold mb-2">{t('step3Title')}</div>
                <p className="text-purple-100">{t('step3Desc')}</p>
              </div>
            </div>
            <button className="mt-8 bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-lg transition-all">
              {t('submitFirstFinding')}
            </button>
          </div>
        </div>

        {/* Bounty Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('bountyRewards')}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {bountyTiers.map((tier) => (
              <div key={tier.severityKey} className={`border-2 rounded-xl p-6 ${getSeverityColor(tier.severityKey)}`}>
                <div className="text-center mb-4">
                  <div className="text-sm font-medium uppercase tracking-wider opacity-80">
                    {t(tier.severityKey)}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {tier.amount}
                  </div>
                </div>
                <p className="text-xs mb-3 opacity-80">
                  {t(tier.descriptionKey)}
                </p>
                <div className="space-y-1">
                  {tier.exampleKeys.map((exampleKey, index) => (
                    <div key={index} className="text-xs flex items-start">
                      <IoCheckmarkCircleOutline className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                      <span>{t(exampleKey)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 mr-2" />
              {t('inScope')}
            </h2>
            <div className="space-y-4">
              {scopeCategories.filter(cat => cat.inScope).map((category) => (
                <div key={category.nameKey} className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t(category.nameKey)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.domains.map((domain) => (
                      <span key={domain} className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <IoCloseCircleOutline className="w-6 h-6 text-red-600 mr-2" />
              {t('outOfScope')}
            </h2>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">{t('notEligible')}</p>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('outOfScope1')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('outOfScope2')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('outOfScope3')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('outOfScope4')}</span>
                  </li>
                  <li className="flex items-start">
                    <IoCloseCircleOutline className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{t('outOfScope5')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Hall of Fame */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('hallOfFame')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4">{t('rank')}</th>
                  <th className="text-left py-3 px-4">{t('researcher')}</th>
                  <th className="text-center py-3 px-4">{t('country')}</th>
                  <th className="text-center py-3 px-4">{t('findings')}</th>
                  <th className="text-right py-3 px-4">{t('totalEarned')}</th>
                </tr>
              </thead>
              <tbody>
                {hallOfFame.map((researcher) => (
                  <tr key={researcher.rank} className="border-b dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {researcher.rank === 1 && '🥇'}
                        {researcher.rank === 2 && '🥈'}
                        {researcher.rank === 3 && '🥉'}
                        {researcher.rank > 3 && <span className="font-bold text-gray-600">#{researcher.rank}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{researcher.avatar}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{researcher.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-2xl">{researcher.country}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{researcher.findings}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="font-bold text-green-600">{researcher.earned}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {t('recentSubmissions')}
          </h2>
          <div className="space-y-4">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {submission.id}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityColor(submission.severity)}`}>
                        {submission.severity.toUpperCase()}
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t(submission.titleKey)}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('submittedBy', { researcher: submission.researcher, date: t(submission.dateKey) })}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {submission.amount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules & Guidelines */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('programRules')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-2" />
                {t('dos')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('do1')}</li>
                <li>{t('do2')}</li>
                <li>{t('do3')}</li>
                <li>{t('do4')}</li>
                <li>{t('do5')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <IoCloseCircleOutline className="w-5 h-5 text-red-600 mr-2" />
                {t('donts')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('dont1')}</li>
                <li>{t('dont2')}</li>
                <li>{t('dont3')}</li>
                <li>{t('dont4')}</li>
                <li>{t('dont5')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Report CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <IoSkullOutline className="w-16 h-16 mx-auto mb-4 text-green-200" />
          <h2 className="text-3xl font-bold mb-4">
            {t('foundSomething')}
          </h2>
          <p className="text-lg mb-6 text-green-100">
            {t('submitFindingDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-8 rounded-lg transition-all">
              {t('submitVulnerability')}
            </button>
            <Link
              href="/security/challenge"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold py-3 px-8 rounded-lg transition-all"
            >
              {t('startTestingNow')}
            </Link>
          </div>
          <p className="text-sm text-green-200 mt-6">
            {t('questionsEmail')}
          </p>
        </div>

      </div>
    </div>
  )
}
