// app/security/certification/details/components/TUNavigationBar.tsx

'use client'

import React from 'react'
import {
  IoDocumentTextOutline,
  IoLayersOutline,
  IoLeafOutline,
  IoCheckmarkCircleOutline,
  IoShieldOutline,
  IoCalculatorOutline,
  IoRocketOutline
} from 'react-icons/io5'

interface TUNavigationBarProps {
  activeSection: string
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>, section: string) => void
  refs: {
    overviewRef: React.RefObject<HTMLDivElement | null>
    levelsRef: React.RefObject<HTMLDivElement | null>
    esgRef: React.RefObject<HTMLDivElement | null>
    complianceRef: React.RefObject<HTMLDivElement | null>
    shieldRef: React.RefObject<HTMLDivElement | null>
    roiRef: React.RefObject<HTMLDivElement | null>
    ctaRef: React.RefObject<HTMLDivElement | null>
  }
}

export default function TUNavigationBar({ activeSection, scrollToSection, refs }: TUNavigationBarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: IoDocumentTextOutline, ref: refs.overviewRef },
    { id: 'levels', label: 'TU Levels', icon: IoLayersOutline, ref: refs.levelsRef },
    { id: 'esg', label: 'ESG Integration', icon: IoLeafOutline, ref: refs.esgRef },
    { id: 'compliance', label: 'Compliance', icon: IoCheckmarkCircleOutline, ref: refs.complianceRef },
    { id: 'shield', label: 'Shield Booster', icon: IoShieldOutline, ref: refs.shieldRef },
    { id: 'roi', label: 'ROI Calculator', icon: IoCalculatorOutline, ref: refs.roiRef },
    { id: 'cta', label: 'Get Started', icon: IoRocketOutline, ref: refs.ctaRef }
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.ref, item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.ref, item.id)}
              className={`flex items-center space-x-1.5 px-4 py-3 transition-colors whitespace-nowrap min-w-fit ${
                activeSection === item.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side Dots Navigation (Desktop Only) */}
      <nav className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.ref, item.id)}
                className="group flex items-center justify-end"
                title={item.label}
              >
                <span className={`text-xs font-medium mr-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeSection === item.id ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                <div className={`w-3 h-3 rounded-full transition-all ${
                  activeSection === item.id
                    ? 'bg-purple-600 scale-125'
                    : 'bg-gray-300 dark:bg-gray-700 hover:bg-purple-400'
                }`} />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}