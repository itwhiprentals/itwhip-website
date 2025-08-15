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
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline
} from 'react-icons/io5'
import type { FooterProps } from '../types'
import { footerLinks, socialLinks, serviceAreas, API_ENDPOINTS } from '../utils/constants'

export default function Footer({
  handleSearchClick,
  handleGetAppClick
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <IoCarOutline className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ItWhip
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Flight Intelligence & Driver Connection Platform. Connecting passengers with independent drivers at Phoenix Sky Harbor.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <IoLogoFacebook className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Twitter"
              >
                <IoLogoTwitter className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.linkedin}
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
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={handleSearchClick}
                    className="text-xs md:text-sm text-gray-600 dark:text-gray-400 
                      hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Drivers Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Drivers
            </h4>
            <ul className="space-y-2">
              {footerLinks.drivers.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={handleSearchClick}
                    className="text-xs md:text-sm text-gray-600 dark:text-gray-400 
                      hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-600 dark:text-gray-400 
                      hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support Links */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-gray-600 dark:text-gray-400 
                      hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Service Areas */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Service Areas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs text-gray-600 dark:text-gray-400">
            {serviceAreas.map((area) => (
              <div key={area} className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                {area}
              </div>
            ))}
          </div>
        </div>
        
        {/* App Download Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Download the ItWhip App
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Track flights, beat surge pricing, connect with drivers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => window.open(API_ENDPOINTS.testFlight, '_blank')}
                className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black 
                  px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <IoLogoApple className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs leading-tight">TestFlight</div>
                  <div className="text-sm font-semibold leading-tight">Beta App</div>
                </div>
              </button>
              <button 
                disabled
                className="flex items-center space-x-2 bg-gray-300 dark:bg-gray-600 
                  text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                <IoLogoGooglePlaystore className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs leading-tight">Coming</div>
                  <div className="text-sm font-semibold leading-tight">Soon</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <IoShieldCheckmarkOutline className="w-8 h-8 text-green-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">Platform Verified</div>
                <div>All drivers screened</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoCarOutline className="w-8 h-8 text-blue-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">100+ Drivers</div>
                <div>Ready at PHX</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoGlobeOutline className="w-8 h-8 text-purple-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">24/7 Service</div>
                <div>Always available</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <IoCallOutline className="w-8 h-8 text-orange-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold">Support Team</div>
                <div>Here to help</div>
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
                © {currentYear} ItWhip. Technology platform connecting independent service providers.
              </p>
              <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-500">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Privacy
                </Link>
                <Link href="/cookies" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Cookies
                </Link>
                <Link href="/sitemap" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
            
            {/* Location and Language */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
              <IoLocationOutline className="w-4 h-4" />
              <span>Phoenix, Arizona</span>
              <span>•</span>
              <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                English (US)
              </button>
            </div>
          </div>
          
          {/* Platform Disclaimer */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              <strong>Platform Notice:</strong> ItWhip is a technology platform that connects passengers with independent transportation providers. 
              All drivers are independent contractors who set their own rates and maintain their own permits, licenses, and insurance. 
              ItWhip does not provide transportation services directly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}