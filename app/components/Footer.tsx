// app/components/Footer.tsx

'use client'

import Link from 'next/link'
import { 
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoApple,
  IoLogoGooglePlaystore,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoCodeSlashOutline,
  IoServerOutline,
  IoBusinessOutline,
  IoDocumentTextOutline,
  IoRocketOutline
} from 'react-icons/io5'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <IoCarOutline className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ItWhip
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Premium transportation network serving Phoenix since 2019. 
              GDS integrated platform connecting travelers with luxury vehicles.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="LinkedIn"
              >
                <IoLogoLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Coverage Areas
                </Link>
              </li>
              <li>
                <Link href="/private-club" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Private Club
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Corporate
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology Section - THE TRAP DOOR */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Technology
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/developers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Developer APIs
                </Link>
              </li>
              <li>
                <Link href="/sdk" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center">
                  Instant Ride SDK™
                  <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Integration Partners
                </Link>
              </li>
              <li>
                <Link href="/hotel-solutions" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Hotel Solutions
                </Link>
              </li>
              <li>
                <Link href="/hotel-portal" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Hotel Portal
                </Link>
              </li>
              <li>
                <Link href="/gds" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  GDS Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Drivers Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Drivers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/drive" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Become a Driver
                </Link>
              </li>
              <li>
                <Link href="/driver-requirements" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Requirements
                </Link>
              </li>
              <li>
                <Link href="/driver-portal" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Driver Portal
                </Link>
              </li>
              <li>
                <Link href="/earnings" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Earnings
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Careers
                  <span className="ml-1 text-[10px] text-green-600">12 open</span>
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/investors" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Investors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Service Areas */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Service Areas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Phoenix</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Scottsdale</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Tempe</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Mesa</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Chandler</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Gilbert</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Glendale</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Peoria</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Surprise</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Sky Harbor</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Carefree</div>
            <div className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Paradise Valley</div>
          </div>
        </div>
        
        {/* App Download Section - Updated Design */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Download the ItWhip App
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Skip the surge. Book luxury rides at fixed prices.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://testflight.apple.com/join/itwhip"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoApple className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90">Download on the</div>
                    <div className="text-sm font-bold -mt-0.5">App Store</div>
                  </div>
                </div>
                <div className="absolute top-1 right-2">
                  <span className="text-[9px] bg-blue-500 px-1.5 py-0.5 rounded text-white font-medium">BETA</span>
                </div>
              </a>
              
              <a 
                href="#"
                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg opacity-90"
              >
                <div className="flex items-center space-x-3">
                  <IoLogoGooglePlaystore className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-90">Get it on</div>
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

        {/* Trust Badges */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">Est. 2019</div>
                <div>6 Years Operating</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoBusinessOutline className="w-8 h-8 text-amber-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">500+ Partners</div>
                <div>Hotels Integrated</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoCarOutline className="w-8 h-8 text-blue-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">450+ Drivers</div>
                <div>Luxury Vehicles</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoServerOutline className="w-8 h-8 text-purple-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">GDS Integrated</div>
                <div>Amadeus Certified</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoRocketOutline className="w-8 h-8 text-orange-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">2.5M+ Trips</div>
                <div>Successfully Completed</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                © 2019-{currentYear} ItWhip Technologies, Inc. All rights reserved.
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
                <Link href="/legal" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Legal
                </Link>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <IoLocationOutline className="w-4 h-4" />
              <span>Phoenix, Arizona</span>
              <span>•</span>
              <span>United States</span>
              <span>•</span>
              <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                English (US)
              </button>
            </div>
          </div>
          
          {/* Platform Disclaimer */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              <strong>Platform Notice:</strong> ItWhip is a technology platform and GDS integration provider established in 2019. 
              We connect travelers with independent luxury transportation providers and integrated hotel partners. 
              All drivers maintain their own permits, licenses, and insurance. Hotel partnerships subject to tier requirements.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}