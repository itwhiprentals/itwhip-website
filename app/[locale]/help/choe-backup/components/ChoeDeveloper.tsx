// app/help/choe/components/ChoeDeveloper.tsx
'use client'

import { Link } from '@/i18n/navigation'
import {
  IoCodeSlashOutline,
  IoExtensionPuzzleOutline,
  IoTerminalOutline,
  IoAppsOutline,
  IoDocumentTextOutline,
  IoChevronForwardOutline,
  IoPricetagOutline
} from 'react-icons/io5'

const products = [
  {
    icon: IoExtensionPuzzleOutline,
    name: 'Choé AI',
    description: 'Consumer search app (web + mobile)',
    color: 'violet'
  },
  {
    icon: IoCodeSlashOutline,
    name: 'Choé Element',
    description: 'Embeddable UI component for websites',
    color: 'blue'
  },
  {
    icon: IoTerminalOutline,
    name: 'Choé Provider API',
    description: 'REST API for full control',
    color: 'emerald'
  },
  {
    icon: IoAppsOutline,
    name: 'Choé Provider SDK',
    description: 'npm, pip, gems packages',
    color: 'amber'
  },
  {
    icon: IoAppsOutline,
    name: 'Choé Dashboard',
    description: 'Management console',
    color: 'rose'
  },
  {
    icon: IoDocumentTextOutline,
    name: 'Choé Docs',
    description: 'Developer documentation',
    color: 'cyan'
  }
]

const pricingTiers = [
  { tier: 'Sandbox', price: 'Free', queries: '100/mo', highlight: false },
  { tier: 'Launch', price: '$0.03/query', queries: '10K/mo', highlight: false },
  { tier: 'Growth', price: '$499/mo', queries: 'Unlimited', highlight: true },
  { tier: 'Enterprise', price: 'Custom', queries: 'Everything', highlight: false }
]

const colorStyles = {
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
}

export function ChoeDeveloper() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium mb-4">
            <IoCodeSlashOutline className="w-3.5 h-3.5" />
            FOR DEVELOPERS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Choé Cloud Platform
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The AI infrastructure for car rental — and eventually, all commerce.
            Add conversational booking to your platform.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className={`w-10 h-10 ${(colorStyles as any)[product.color]} rounded-lg flex items-center justify-center mb-3`}>
                <product.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                {product.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {product.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <IoPricetagOutline className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pricing Tiers</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`rounded-xl p-3 sm:p-4 text-center ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${tier.highlight ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {tier.tier}
                </div>
                <div className={`font-bold text-sm sm:text-base mb-0.5 ${tier.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {tier.price}
                </div>
                <div className={`text-[10px] sm:text-xs ${tier.highlight ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  {tier.queries}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Visit choe.cloud
            <IoChevronForwardOutline className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Get API keys • Read the docs • Start building
          </p>
        </div>
      </div>
    </section>
  )
}
