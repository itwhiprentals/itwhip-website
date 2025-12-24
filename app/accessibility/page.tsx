'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoAccessibilityOutline,
  IoEyeOutline,
  IoEarOutline,
  IoHandLeftOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoMailOutline,
  IoCallOutline,
  IoInformationCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCarOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline
} from 'react-icons/io5'

export default function AccessibilityPage() {
  const [expandedSections, setExpandedSections] = useState({})
  const [fontSize, setFontSize] = useState('normal')
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'commitment',
      title: 'Our Accessibility Commitment',
      icon: IoAccessibilityOutline,
      content: `ItWhip Technologies is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

We believe that transportation should be accessible to everyone, regardless of ability. This commitment extends beyond our digital platforms to the vehicles and services we facilitate.

Conformance Status:
• WCAG 2.1 Level AA (Target Standard)
• Section 508 Compliant
• ADA Title III Compliant
• Currently achieving 87% automated accessibility score

Our accessibility efforts are ongoing. We recognize that accessibility is not a destination but a continuous journey of improvement.`
    },
    {
      id: 'features',
      title: 'Accessibility Features',
      icon: IoCheckmarkCircle,
      content: `Website Accessibility:
• Keyboard navigation support throughout the site
• Screen reader compatibility (JAWS, NVDA, VoiceOver)
• Alt text for all informative images
• Proper heading structure for easy navigation
• Color contrast ratios meeting WCAG AA standards
• Resizable text up to 200% without loss of functionality
• Focus indicators for keyboard users
• Skip navigation links
• ARIA labels and landmarks
• Closed captions for video content

Mobile App Accessibility:
• VoiceOver support (iOS)
• TalkBack support (Android)
• Dynamic Type support
• High contrast mode
• Reduced motion options
• Voice control compatibility
• Haptic feedback for important actions

Vehicle Accessibility:
• Filter for wheelchair-accessible vehicles
• Hand control equipped vehicles available
• Extra space vehicles for mobility devices
• Detailed accessibility information in listings`
    },
    {
      id: 'visual',
      title: 'Visual Accessibility',
      icon: IoEyeOutline,
      content: `For Users with Visual Impairments:

Screen Reader Support:
• Full compatibility with popular screen readers
• Descriptive alt text for all images
• Proper semantic HTML structure
• ARIA labels for interactive elements
• Keyboard shortcuts documentation available

Visual Enhancements:
• High contrast mode available
• Text scaling up to 200%
• Clear focus indicators
• Consistent navigation structure
• No reliance on color alone for information
• Minimum 4.5:1 color contrast ratio for normal text
• 3:1 contrast ratio for large text
• Dark mode option available

Additional Features:
• Text-to-speech for important notifications
• Audio descriptions for video content
• Large click/tap targets (minimum 44x44 pixels)
• Clear visual hierarchy
• Consistent layout patterns`
    },
    {
      id: 'hearing',
      title: 'Hearing Accessibility',
      icon: IoEarOutline,
      content: `For Users with Hearing Impairments:

Communication Options:
• In-app messaging as primary communication
• SMS notifications available
• Email support for all inquiries
• Visual alerts for important notifications
• No audio-only content

Video Content:
• Closed captions for all videos
• Transcripts available for audio content
• Visual indicators for audio alerts
• Sign language interpretation available upon request

Customer Support:
• Text-based chat support
• Email support: info@itwhip.com
• TTY/TDD relay service compatible
• Video relay service (VRS) compatible
• Response within 2-4 business hours`
    },
    {
      id: 'motor',
      title: 'Motor Accessibility',
      icon: IoHandLeftOutline,
      content: `For Users with Motor Impairments:

Navigation Features:
• Full keyboard navigation support
• Tab order follows visual flow
• Keyboard shortcuts available
• No time limits on form completion
• Sticky navigation for easy access
• Large clickable areas (minimum 44x44 pixels)
• Sufficient spacing between interactive elements

Input Assistance:
• Voice input support
• Auto-complete for forms
• Error prevention and correction
• Save progress functionality
• Simple, clear form layouts
• Alternative input methods supported

Mobile Features:
• Voice control support
• AssistiveTouch compatibility (iOS)
• Switch Control support
• Gesture alternatives available
• One-handed operation possible`
    },
    {
      id: 'cognitive',
      title: 'Cognitive Accessibility',
      icon: IoPeopleOutline,
      content: `For Users with Cognitive Disabilities:

Simplified Experience:
• Clear, simple language
• Consistent navigation patterns
• Predictable functionality
• Step-by-step booking process
• Visual cues and icons
• Progress indicators for multi-step processes
• Clear error messages with solutions
• Confirmation dialogs for important actions

Support Features:
• Extended time limits where applicable
• Ability to review before confirming
• Clear instructions at each step
• Help text available throughout
• Simple sentence structure
• Common words preferred over jargon
• Logical content organization
• Breadcrumb navigation

Additional Assistance:
• Save and resume functionality
• Undo options where possible
• Clear feedback for all actions
• Minimal cognitive load
• Distraction-free mode available`
    },
    {
      id: 'vehicles',
      title: 'Accessible Vehicle Options',
      icon: IoCarOutline,
      content: `Wheelchair Accessible Vehicles (WAV):
• Ramp or lift equipped vehicles
• Securement systems for wheelchairs
• Adequate interior height
• Wide door openings
• Lowered floor options

Adaptive Driving Controls:
• Hand controls for acceleration/braking
• Spinner knobs for steering
• Left foot accelerator options
• Extended pedals available
• Panoramic mirrors for limited neck mobility

Accessibility Features in Listings:
• Clear accessibility badges
• Detailed equipment descriptions
• Photos of accessibility features
• Direct messaging with hosts about needs
• Filter by specific accessibility requirements

Support Animals:
• Service animals always welcome
• No additional fees for service animals
• Clear policy communication
• Host education about ADA requirements`
    },
    {
      id: 'testing',
      title: 'Testing & Validation',
      icon: IoDesktopOutline,
      content: `Our Accessibility Testing Process:

Automated Testing:
• Daily automated accessibility scans
• WAVE (WebAIM) evaluation
• axe DevTools integration
• Lighthouse accessibility audits
• Color contrast analyzers
• Screen reader testing

Manual Testing:
• Keyboard-only navigation testing
• Screen reader testing (JAWS, NVDA, VoiceOver)
• Mobile accessibility testing
• Cognitive load assessment
• User journey mapping
• Form accessibility review

User Testing:
• Regular testing with users with disabilities
• Feedback incorporation process
• Accessibility user research
• Beta testing program for new features
• Community advisory board

Third-Party Audits:
• Annual accessibility audit by certified professionals
• WCAG 2.1 Level AA compliance verification
• Section 508 compliance review
• Remediation roadmap development`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <IoAccessibilityOutline className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Accessibility at ItWhip
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Making transportation accessible for everyone, regardless of ability.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-6 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal')}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'} Text Size
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                High Contrast
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                Keyboard Nav Guide
              </button>
              <button
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
              >
                Read Aloud
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className={`py-8 sm:py-12 ${fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      aria-expanded={expandedSections[section.id]}
                      aria-controls={`section-${section.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-left">
                          {section.title}
                        </h2>
                      </div>
                      {expandedSections[section.id] ? (
                        <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                      ) : (
                        <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections[section.id] && (
                      <div id={`section-${section.id}`} className="px-6 pb-6">
                        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 sm:py-12 bg-blue-50 dark:bg-blue-900/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Need Accessibility Assistance?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We're here to help make your ItWhip experience accessible.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoMailOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  For accessibility inquiries and feedback
                </p>
                <a href="mailto:info@itwhip.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  info@itwhip.com
                </a>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoCallOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TTY/TDD Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Text telephone for hearing impaired
                </p>
                <p className="text-blue-600 font-medium">
                  711 (Relay Service)
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                <IoPeopleOutline className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Help us improve accessibility
                </p>
                <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                  Submit Feedback
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Statement */}
        <section className="py-8 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Compliance & Standards
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
              ItWhip strives to conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
              and comply with the Americans with Disabilities Act (ADA) Title III.
            </p>
            <p className="text-xs text-gray-500">
              Last accessibility audit: December 2024 • Next scheduled: March 2025
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}