// app/host/tax-benefits/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoReceiptOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoCalculatorOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'Tax Benefits for Car Sharing Hosts | ItWhip',
  description: 'Learn about tax deductions for car sharing hosts. Mileage, depreciation, maintenance, and more. Maximize your earnings with smart tax strategies.',
  keywords: ['car sharing tax deductions', 'turo tax benefits', 'car rental tax write offs', 'vehicle depreciation deduction', 'car sharing business expenses'],
  openGraph: {
    title: 'Tax Benefits for Car Sharing Hosts | ItWhip',
    description: 'Maximize your car sharing earnings with these tax deduction strategies.',
    url: 'https://itwhip.com/host/tax-benefits',
    type: 'website'
  },
  alternates: {
    canonical: 'https://itwhip.com/host/tax-benefits',
  },
}

export default function TaxBenefitsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 via-emerald-700 to-green-800 text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/30 rounded-full text-green-200 text-xs font-medium mb-4">
              <IoReceiptOutline className="w-4 h-4" />
              Host Resources
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Tax Benefits for Hosts
            </h1>
            <p className="text-xl text-green-100 mb-6">
              Car sharing can be a business. That means potential tax deductions for mileage, depreciation, maintenance, insurance, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-amber-600 flex items-center gap-1">
                <IoHomeOutline className="w-3.5 h-3.5" />
                Home
              </Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/list-your-car" className="hover:text-amber-600">Host</Link>
              <IoChevronForwardOutline className="w-2.5 h-2.5" />
            </li>
            <li className="text-gray-800 dark:text-gray-200 font-medium">
              Tax Benefits
            </li>
          </ol>
        </nav>
      </div>

      {/* Disclaimer */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
            <IoAlertCircleOutline className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Disclaimer:</strong> This information is for educational purposes only and is not tax advice. Consult with a qualified tax professional for advice specific to your situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deduction Categories */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Common Tax Deductions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: IoCarOutline,
                title: 'Vehicle Depreciation',
                description: 'Deduct a portion of your vehicle\'s value as it depreciates over time. Section 179 and bonus depreciation may apply.',
                items: ['Standard depreciation over 5 years', 'Section 179 for business vehicles', 'Bonus depreciation (varies by year)']
              },
              {
                icon: IoCalculatorOutline,
                title: 'Mileage & Gas',
                description: 'Track business miles for the standard mileage deduction, or deduct actual gas expenses if you choose the actual expense method.',
                items: ['Standard mileage rate (67 cents/mile 2024)', 'Actual gas expenses', 'Choose one method per vehicle']
              },
              {
                icon: IoDocumentTextOutline,
                title: 'Insurance & Registration',
                description: 'Business-related insurance premiums and registration fees may be deductible based on business use percentage.',
                items: ['Auto insurance premiums', 'Registration fees', 'Commercial insurance costs']
              },
              {
                icon: IoReceiptOutline,
                title: 'Maintenance & Repairs',
                description: 'Car washes, oil changes, tire rotations, repairs - all may be deductible based on business use.',
                items: ['Regular maintenance', 'Repairs and parts', 'Car washes and detailing']
              }
            ].map((category, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Record Keeping */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Record Keeping Tips
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Track Business Use %',
                description: 'Keep a log of personal vs. business miles. Only the business portion of expenses is deductible.'
              },
              {
                title: 'Save All Receipts',
                description: 'Use an app to photograph and categorize receipts for gas, maintenance, and other expenses.'
              },
              {
                title: 'Use Accounting Software',
                description: 'Consider QuickBooks, Wave, or similar tools to track income and expenses throughout the year.'
              }
            ].map((tip, i) => (
              <div key={i} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Start Earning (and Saving)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            List your car on ItWhip and start building your car sharing business with potential tax benefits.
          </p>
          <Link
            href="/list-your-car"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            List Your Car
            <IoChevronForwardOutline className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
