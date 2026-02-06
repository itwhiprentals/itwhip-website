// app/help/chloe/components/ChoeAbout.tsx
'use client'

import Link from 'next/link'
import {
  IoSparklesOutline,
  IoChatbubbleEllipsesOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

const aboutPoints = [
  {
    icon: IoSparklesOutline,
    title: 'Not a Chatbot',
    description: 'Choé is a booking companion powered by advanced language models. It understands context, calculates budgets, and actually books cars.'
  },
  {
    icon: IoChatbubbleEllipsesOutline,
    title: 'Natural Conversation',
    description: 'Type like you\'re texting a friend. No dropdowns. No filters. Just tell Choé what you need.'
  },
  {
    icon: IoGlobeOutline,
    title: 'Arizona Expert',
    description: 'Choé knows Arizona — weather patterns, traffic, neighborhoods, and local hosts. Built for the desert, expanding globally.'
  },
  {
    icon: IoRocketOutline,
    title: 'Constantly Improving',
    description: 'Choé learns from every conversation to get smarter. New features and capabilities added regularly.'
  }
]

export function ChoeAbout() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            What is Choé?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choé is ItWhip&apos;s proprietary AI booking assistant. Not a search box. Not a chatbot.
            A <span className="font-semibold text-violet-600 dark:text-violet-400">booking companion</span> that understands what you need and finds it for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {aboutPoints.map((point) => (
            <div
              key={point.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {point.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* choe.cloud callout */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg sm:text-xl mb-1">Powered by choe.cloud</h3>
              <p className="text-sm text-white/80">
                The AI infrastructure behind Choé. Available for developers and businesses.
              </p>
            </div>
            <Link
              href="https://choe.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-violet-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Visit choe.cloud
              <IoChevronForwardOutline className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
