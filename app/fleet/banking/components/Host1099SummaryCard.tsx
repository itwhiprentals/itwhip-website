// app/fleet/banking/components/Host1099SummaryCard.tsx
// Shows 1099-K tax information summary for hosts with 2025 threshold updates

'use client'

import { formatCurrency } from '../types'

interface Host1099Props {
  data: {
    taxYear: number
    totalHosts: number
    hostsAboveThreshold: number
    totalGrossReceipts: number
    totalPlatformFees: number
    totalProcessingFees: number
    totalNetPayouts: number
    // New fields for enhanced 1099 tracking
    hostsWith200Transactions?: number
    hostsAbove20k?: number
  }
}

// 2025 IRS 1099-K Threshold (One Big Beautiful Bill Act, July 2025)
const IRS_THRESHOLD = {
  amount: 20000,
  transactions: 200
}

export function Host1099SummaryCard({ data }: Host1099Props) {
  const currentYear = new Date().getFullYear()
  const filingYear = currentYear + 1

  // Export 1099 data as CSV for Stripe Connect upload
  const handleExport = () => {
    // Generate CSV with required columns for Stripe 1099 reporting
    const headers = [
      'host_id',
      'name',
      'email',
      'ssn_ein',
      'gross_receipts',
      'platform_fees',
      'processing_fees',
      'net_payouts',
      'transaction_count'
    ].join(',')

    // In a real implementation, this would fetch actual host data
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `1099k_data_${data.taxYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          1099-K Summary ({data.taxYear})
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
            Stripe Connect
          </span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
            Tax Info
          </span>
        </div>
      </div>

      {/* Updated Threshold Info Banner */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              2025 IRS Threshold Update
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              1099-K required for hosts with <strong>${IRS_THRESHOLD.amount.toLocaleString()}</strong> gross receipts AND <strong>{IRS_THRESHOLD.transactions}+</strong> transactions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Hosts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.totalHosts.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hosts Requiring 1099</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.hostsAboveThreshold.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            ≥ ${(IRS_THRESHOLD.amount / 1000).toFixed(0)}k + {IRS_THRESHOLD.transactions} transactions
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Gross Receipts (Box 1a)</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(data.totalGrossReceipts)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Platform Fees Deducted</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(data.totalPlatformFees)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Processing Fees</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(data.totalProcessingFees)}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="font-medium text-gray-900 dark:text-white">Net Payouts</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalNetPayouts)}
          </span>
        </div>
      </div>

      {/* Compliance Timeline */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Compliance Timeline ({data.taxYear} Tax Year)
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Tax year ends</span>
            <span className="font-medium text-gray-900 dark:text-white">Dec 31, {data.taxYear}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Send 1099-K to hosts</span>
            <span className="font-medium text-gray-900 dark:text-white">Jan 31, {filingYear}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">File with IRS (electronic)</span>
            <span className="font-medium text-gray-900 dark:text-white">Mar 31, {filingYear}</span>
          </div>
        </div>
      </div>

      {/* Stripe Connect Info */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-xs text-purple-800 dark:text-purple-200">
          <strong>Electronic Delivery via Stripe Connect:</strong> Export data below and upload to Stripe Connect Dashboard.
          Stripe handles IRS e-filing ($2.99/form) and electronic delivery to hosts.
        </p>
      </div>

      <button
        onClick={handleExport}
        className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export 1099 Data for Stripe
      </button>
    </div>
  )
}
