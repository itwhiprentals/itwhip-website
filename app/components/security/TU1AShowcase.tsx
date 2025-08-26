// app/components/security/TU1AShowcase.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoInfiniteOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoArrowForwardOutline,
  IoBulbOutline,
  IoLockClosedOutline,
  IoHeartOutline,
  IoLeafOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoGlobeOutline,
  IoHappyOutline,
  IoStarOutline,
  IoPhonePortraitOutline,
  IoDocumentTextOutline,
  IoRocketOutline,
  IoBugOutline,
  IoEyeOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoFlameOutline,
  IoWarningOutline,
  IoAnalyticsOutline,
  IoFingerPrintOutline,
  IoPulseOutline,
  IoTrophyOutline
} from 'react-icons/io5'

export default function TU1AShowcase() {
  const [attacksValidated, setAttacksValidated] = useState(48291)
  const [protectionLevel, setProtectionLevel] = useState(100)
  const [activeValidationStep, setActiveValidationStep] = useState(0)

  // Animate attack counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAttacksValidated(prev => prev + Math.floor(Math.random() * 7) + 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Animate validation steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveValidationStep(prev => (prev + 1) % 6)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const validationSteps = [
    { icon: <IoCodeSlashOutline />, title: 'Application', description: 'System registered' },
    { icon: <IoSearchOutline />, title: 'Scanning', description: 'Vulnerabilities checked' },
    { icon: <IoBugOutline />, title: 'Testing', description: 'Real attacks blocked' },
    { icon: <IoEyeOutline />, title: 'Monitoring', description: '24/7 protection' },
    { icon: <IoDocumentTextOutline />, title: 'Reporting', description: 'Live dashboard' },
    { icon: <IoTrophyOutline />, title: 'Certified', description: 'TU-1-A validated' }
  ]

  return (
    <section id="tu1a-standard" className="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-400 px-6 py-3 rounded-full mb-6 border border-purple-300 dark:border-purple-800">
            <IoShieldCheckmarkOutline className="w-6 h-6 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider">The Security Standard Revolution</span>
            <IoShieldCheckmarkOutline className="w-6 h-6 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
            Your Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Never Sleeps</span> Never Stops
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            While others rely on annual audits and PDF certificates, TU-1-A validates security 
            every second through real attacks. The way security should be.
          </p>
          
          {/* Live Counter */}
          <div className="mt-6">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {attacksValidated.toLocaleString()} 
              <span className="text-lg text-slate-600 dark:text-slate-400 ml-2">attacks validated today</span>
            </p>
          </div>
        </div>

        {/* The Perfect Validation Timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Continuous Validation, Not Annual Theater
          </h3>
          <div className="relative">
            {/* Journey Path */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800 transform -translate-y-1/2 hidden md:block"></div>
            
            {/* Validation Steps */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
              {validationSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`text-center transform transition-all duration-500 ${
                    idx === activeValidationStep ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-500 ${
                    idx <= activeValidationStep 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                  }`}>
                    {React.cloneElement(step.icon, { className: 'w-8 h-8' })}
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{step.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Four Company Types */}
        <div className="grid lg:grid-cols-4 gap-6 mb-16">
          {/* SaaS Platform */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <IoBusinessOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">SaaS Platform</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">SOC 2 Alternative</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Better than compliance theater</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Enterprise Ready</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Fortune 500 approved standard</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Public Dashboard</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Customers verify anytime</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-purple-800 dark:text-purple-300 italic">
                "Our enterprise clients love that they can verify our security in real-time."
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">- B2B SaaS CEO</p>
            </div>
          </div>

          {/* Financial Services */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <IoCashOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Financial Services</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Continuous Testing</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Not annual snapshots</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Zero-Day Protection</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">AI catches new threats</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Breach Insurance</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">$10M coverage included</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-800 dark:text-green-300 italic">
                "Finally, security that matches our risk profile. Worth every penny saved."
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">- FinTech CFO</p>
            </div>
          </div>

          {/* Healthcare Tech */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border-2 border-purple-400 dark:border-purple-600">
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">HIPAA+</div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <IoHeartOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Healthcare Tech</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Beyond HIPAA</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Exceeds all requirements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">PHI Protection</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Military-grade encryption</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Audit Trail</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Every access logged</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 italic">
                "Change Healthcare got breached with HIPAA. We chose TU-1-A instead."
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">- Health Tech CISO</p>
            </div>
          </div>

          {/* E-commerce */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <IoGlobeOutline className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">E-commerce</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">PCI DSS Coverage</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Payment data protected</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">DDoS Protection</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Black Friday ready</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Bot Detection</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">AI stops scrapers</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                "Target was PCI compliant. We wanted actual protection."
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">- E-commerce Director</p>
            </div>
          </div>
        </div>

        {/* The Security Layers They Never See */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            The Invisible Security Layers Working 24/7
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoFingerPrintOutline className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">AI Detection</h4>
              <p className="text-xs text-gray-300">Behavioral analysis 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoLockClosedOutline className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">Quantum-Ready</h4>
              <p className="text-xs text-gray-300">Post-quantum encryption</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoShieldCheckmarkOutline className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">Zero Trust</h4>
              <p className="text-xs text-gray-300">Never trust, always verify</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
                <IoPulseOutline className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-white">Live Monitoring</h4>
              <p className="text-xs text-gray-300">2ms threat detection</p>
            </div>
          </div>
        </div>

        {/* What They Never Experience vs Always Get */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Never Experience */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-8 border-2 border-red-200 dark:border-red-800">
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-6 flex items-center">
              <IoCloseCircleOutline className="w-8 h-8 mr-3" />
              What You'll Never Experience
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Annual 3-week audit disruption</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">$75K SOC 2 renewal invoice</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">"We passed but got breached"</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">PDF certificate nobody reads</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">204 days to detect breach</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCloseCircleOutline className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Hiring $116K security staff</p>
              </div>
            </div>
          </div>

          {/* Always Get */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-8 border-2 border-purple-500">
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-6 flex items-center">
              <IoCheckmarkCircle className="w-8 h-8 mr-3" />
              What You Always Get
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Validation every single second</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Free forever certification</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">48K+ real penetration tests</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Live public dashboard</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">2ms threat detection</p>
              </div>
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">Zero breaches since 2019</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Bottom Line */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">
            Security So Advanced, Hackers Think It's Unfair
          </h3>
          <p className="text-xl text-gray-100 mb-6 max-w-3xl mx-auto">
            They attack. We block. They try harder. We learn faster. 
            They give up. You stay protected. Every second of every day.
          </p>
          
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-6">
            <div>
              <IoShieldCheckmarkOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-gray-200">Protection Rate</p>
            </div>
            <div>
              <IoWarningOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-gray-200">Breaches Ever</p>
            </div>
            <div>
              <IoFlashOutline className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">2ms</p>
              <p className="text-sm text-gray-200">Detection Speed</p>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-white">
            This isn't just compliance. It's security perfected.
          </p>
        </div>

        {/* TU-1-A Features Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            The TU-1-A Standard: Where Security Meets Transparency
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoPulseOutline className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Continuous Validation</h4>
              <p className="text-xs text-gray-300">Every second, not annually</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoEyeOutline className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Public Dashboard</h4>
              <p className="text-xs text-gray-300">Anyone can verify your security</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <IoBugOutline className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Bug Bounty Program</h4>
              <p className="text-xs text-gray-300">$247K paid, 0 breaches</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Import statement for IoSearchOutline that was missing
import { IoSearchOutline } from 'react-icons/io5'