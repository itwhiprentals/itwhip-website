// app/components/Footer.tsx

'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoApple,
  IoLogoGooglePlaystore
} from 'react-icons/io5'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-5">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo and Branding */}
            <div className="flex flex-col items-start mb-4">
              <div className="relative top-1 left-8">
                {/* Light mode logo */}
                <Image
                  src="/logo.png"
                  alt="ItWhip"
                  width={192}
                  height={192}
                  className="h-10 w-10 dark:hidden"
                />
                {/* Dark mode logo */}
                <Image
                  src="/logo-white.png?v=2"
                  alt="ItWhip"
                  width={192}
                  height={192}
                  className="h-10 w-10 hidden dark:block"
                />
              </div>
              <span className="text-[8px] text-gray-700 dark:text-gray-300 tracking-widest uppercase font-medium mt-0.5 ml-3">
                ITWHIP TECHNOLOGY
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Arizona's Peer-to-Peer Car Rentals
              </p>
            </div>
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
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
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
                <Link href="/host/insurance-options" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Insurance Options
                </Link>
              </li>
              <li>
                <Link href="/switch-from-turo" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Switch from Turo
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
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
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
                <Link href="/insurance-guide" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Insurance Guide
                </Link>
              </li>
              <li>
                <Link href="/host-requirements" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Host Requirements
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
              Support
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/support" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/insurance" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Insurance Support
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
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
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
                <Link href="/corporate" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Corporate Rentals
                </Link>
              </li>
              <li>
                <Link href="/host/tax-benefits" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Tax Benefits
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="md:col-span-1">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
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
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-gray-900 dark:decoration-white">
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
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Download the ItWhip App
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Available on iOS, Android coming soon</p>
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
                    <div className="text-[10px] uppercase tracking-wider opacity-90 leading-tight">Download on the</div>
                    <div className="text-sm font-bold -mt-0.5">App Store</div>
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
                    <div className="text-[10px] uppercase tracking-wider opacity-90 leading-tight">Get it on</div>
                    <div className="text-sm font-bold -mt-0.5">Google Play</div>
                  </div>
                </div>
                <div className="absolute top-1 right-2">
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