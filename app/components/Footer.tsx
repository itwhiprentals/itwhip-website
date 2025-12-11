// app/components/Footer.tsx

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoTimeOutline
} from 'react-icons/io5'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set launch date to 60 days from now
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 60)
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 md:gap-4 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo - ItWhip with bold W and TECHNOLOGY underneath */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                It<span className="font-black">W</span>hip
              </h3>
              <p className="text-[10px] tracking-wider text-gray-500 dark:text-gray-500 -mt-0.5">
                TECHNOLOGY
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Arizona's peer-to-peer car sharing platform.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/share/17C2AahAqu/?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/itwhiptech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/itwhiptech?igsh=NWhtdXVlNnZwYzlx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/itwhip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="LinkedIn"
              >
                <IoLogoLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Guests */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              For Guests
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/how-it-works" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/rentals/daily" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Daily Rentals
                </Link>
              </li>
              <li>
                <Link href="/rentals/long-term" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Long-Term Rentals
                </Link>
              </li>
              <li>
                <Link href="/insurance-guide" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Insurance Guide
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hosts */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              For Hosts
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/list-your-car" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  List Your Car
                </Link>
              </li>
              <li>
                <Link href="/host/fleet-owners" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Fleet Owners
                </Link>
              </li>
              <li>
                <Link href="/host/payouts" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Payouts & Earnings
                </Link>
              </li>
              <li>
                <Link href="/host/insurance-options" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Insurance Options
                </Link>
              </li>
              <li>
                <Link href="/host-requirements" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Host Requirements
                </Link>
              </li>
              <li>
                <Link href="/host/tax-benefits" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Tax Benefits
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Support
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/support" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Coverage Areas
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Company
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/about" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Developers
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Corporate Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Technology
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/mileage-forensics" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Mileage Forensics™
                </Link>
              </li>
              <li>
                <Link href="/esg-dashboard" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  ESG Dashboard
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Developer APIs
                </Link>
              </li>
              <li>
                <Link href="/sdk" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Instant Ride SDK™
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Legal
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/terms" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Legal Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* App Download Section with Countdown */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Download the ItWhip App
              </h4>
              {/* Countdown Timer */}
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                <IoTimeOutline className="w-4 h-4 mr-1" />
                <span>Full app launches in:</span>
                <span className="font-bold text-purple-600">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://testflight.apple.com/join/ygzsQbNf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoApple className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </div>
                <div className="absolute bottom-1 right-2">
                  <span className="text-[9px] bg-blue-500 px-1.5 py-0.5 rounded text-white font-medium">BETA</span>
                </div>
              </a>
              
              <a 
                href="#"
                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg opacity-90"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoGooglePlaystore className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90">Get it on</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </div>
                <div className="absolute bottom-1 right-2">
                  <span className="text-[9px] bg-orange-500 px-1.5 py-0.5 rounded text-white font-medium">SOON</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                © {currentYear} ItWhip Technologies, Inc. All rights reserved.
              </p>
              <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Privacy
                </Link>
                <Link href="/accessibility" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Phoenix, Arizona</span>
              <span>•</span>
              <span>United States</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}