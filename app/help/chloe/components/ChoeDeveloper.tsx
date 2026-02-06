// app/help/chloe/components/ChoeDeveloper.tsx
'use client'

import Link from 'next/link'
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
    description: 'Consumer search app (web + mobile)'
  },
  {
    icon: IoCodeSlashOutline,
    name: 'Choé Element',
    description: 'Embeddable UI component for websites'
  },
  {
    icon: IoTerminalOutline,
    name: 'Choé Provider API',
    description: 'REST API for full control'
  },
  {
    icon: IoAppsOutline,
    name: 'Choé Provider SDK',
    description: 'npm, pip, gems packages'
  },
  {
    icon: IoAppsOutline,
    name: 'Choé Dashboard',
    description: 'Management console'
  },
  {
    icon: IoDocumentTextOutline,
    name: 'Choé Docs',
    description: 'Developer documentation'
  }
]

const pricingTiers = [
  { tier: 'Sandbox', price: 'Free', queries: '100/mo', highlight: false },
  { tier: 'Launch', price: '$0.03/query', queries: '10K/mo', highlight: false },
  { tier: 'Growth', price: '$499/mo', queries: 'Unlimited', highlight: true },
  { tier: 'Enterprise', price: 'Custom', queries: 'Everything', highlight: false }
]

export function ChoeDeveloper() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#0f0f0f] relative border-t border-gray-300 dark:border-[#222]">
      {/* Code/IDE-style background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-600 dark:text-[#a8a8a8] text-xs font-mono uppercase tracking-wider mb-4">
            <IoCodeSlashOutline className="w-4 h-4 text-[#e87040]" />
            <span className="text-[#e87040]">{"<"}</span>developers<span className="text-[#e87040]">{"/>"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Choé Cloud Platform
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-[#a8a8a8] max-w-2xl mx-auto">
            The AI infrastructure for car rental — and eventually, all commerce.
            Add conversational booking to your platform.
          </p>
        </div>

        {/* Products Grid - IDE style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="group bg-white dark:bg-[#1a1a1a] rounded-lg p-4 sm:p-5 border border-gray-300 dark:border-[#333] hover:border-[#e87040]/40 transition-all choe-animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#e87040]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <product.icon className="w-5 h-5 text-[#e87040]" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[#666]">
                {product.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing - Terminal style */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-300 dark:border-[#333] mb-10">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#252525] border-b border-gray-300 dark:border-[#333]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-[#666]">
              <IoPricetagOutline className="w-4 h-4" />
              <span>choé pricing --list</span>
            </div>
          </div>

          {/* Pricing tiers */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`rounded-lg p-4 text-center transition-all ${
                    tier.highlight
                      ? 'bg-gradient-to-br from-[#c94c24] to-[#e87040] ring-2 ring-[#e87040]/50'
                      : 'bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#333] hover:border-[#e87040]/30'
                  }`}
                >
                  <div className={`text-xs font-mono mb-1 ${tier.highlight ? 'text-white/70' : 'text-gray-500 dark:text-[#666]'}`}>
                    {tier.tier}
                  </div>
                  <div className={`font-bold text-base sm:text-lg mb-1 ${tier.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {tier.price}
                  </div>
                  <div className={`text-[10px] sm:text-xs ${tier.highlight ? 'text-white/60' : 'text-gray-500 dark:text-[#666]'}`}>
                    {tier.queries}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="https://choe.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c94c24] to-[#e87040] text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg hover:shadow-[#e87040]/20 transition-all"
          >
            Visit choe.cloud
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 dark:text-[#666] mt-4 font-mono">
            $ npm install @choe/sdk • $ pip install choe-cloud
          </p>
        </div>
      </div>
    </section>
  )
}
