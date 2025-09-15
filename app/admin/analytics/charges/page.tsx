// app/admin/analytics/charges/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoStatsChartOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoWarningOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoFlagOutline,
  IoCalendarOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCalculatorOutline
} from 'react-icons/io5'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts'

interface ChargeAnalytics {
  summary: {
    totalChargesProcessed: number
    totalChargesAmount: number
    totalWaivedAmount: number
    totalDisputedAmount: number
    averageChargeAmount: number
    averageWaivePercentage: number
    successRate: number
    failureRate: number
  }
  trends: {
    daily: Array<{
      date: string
      charges: number
      waived: number
      disputed: number
      failed: number
      amount: number
    }>
    monthly: Array<{
      month: string
      charges: number
      waived: number
      revenue: number
    }>
  }
  waivePatterns: {
    byReason: Array<{
      reason: string
      count: number
      totalAmount: number
      percentage: number
    }>
    byAdmin: Array<{
      adminId: string
      adminName: string
      waiveCount: number
      waiveTotal: number
      averageWaivePercent: number
    }>
    byPercentage: Array<{
      range: string
      count: number
      totalAmount: number
    }>
  }
  paymentFailures: {
    byReason: Array<{
      reason: string
      count: number
      totalAmount: number
    }>
    byTimeOfDay: Array<{
      hour: number
      failures: number
      successRate: number
    }>
    recurring: Array<{
      customerId: string
      customerName: string
      failureCount: number
      lastFailure: string
      totalAttempts: number
    }>
  }
  disputes: {
    byType: Array<{
      type: string
      count: number
      resolvedCount: number
      resolutionRate: number
      averageResolutionTime: number
    }>
    trends: Array<{
      week: string
      opened: number
      resolved: number
      pending: number
    }>
    topDisputed: Array<{
      chargeType: string
      count: number
      percentage: number
    }>
  }
}

export default function ChargeAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState<ChargeAnalytics | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'waives' | 'failures' | 'disputes'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(
        `/api/admin/analytics/charges?start=${dateRange.start}&end=${dateRange.end}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Mock data for development
      setAnalytics(generateMockData())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const generateMockData = (): ChargeAnalytics => {
    // Generate realistic mock data for development
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString(),
        charges: Math.floor(Math.random() * 20) + 5,
        waived: Math.floor(Math.random() * 5),
        disputed: Math.floor(Math.random() * 3),
        failed: Math.floor(Math.random() * 4),
        amount: Math.floor(Math.random() * 5000) + 1000
      }
    })

    return {
      summary: {
        totalChargesProcessed: 487,
        totalChargesAmount: 125650,
        totalWaivedAmount: 8450,
        totalDisputedAmount: 3200,
        averageChargeAmount: 258,
        averageWaivePercentage: 42,
        successRate: 87.3,
        failureRate: 12.7
      },
      trends: {
        daily: last30Days,
        monthly: [
          { month: 'Oct', charges: 120, waived: 15, revenue: 28500 },
          { month: 'Nov', charges: 145, waived: 22, revenue: 35200 },
          { month: 'Dec', charges: 222, waived: 31, revenue: 61950 }
        ]
      },
      waivePatterns: {
        byReason: [
          { reason: 'First-time customer', count: 23, totalAmount: 2875, percentage: 35 },
          { reason: 'Service issue', count: 15, totalAmount: 3200, percentage: 23 },
          { reason: 'Loyalty discount', count: 12, totalAmount: 1500, percentage: 18 },
          { reason: 'Admin discretion', count: 10, totalAmount: 875, percentage: 15 },
          { reason: 'Other', count: 6, totalAmount: 0, percentage: 9 }
        ],
        byAdmin: [
          { adminId: '1', adminName: 'Admin John', waiveCount: 25, waiveTotal: 3500, averageWaivePercent: 45 },
          { adminId: '2', adminName: 'Admin Sarah', waiveCount: 18, waiveTotal: 2200, averageWaivePercent: 38 },
          { adminId: '3', adminName: 'Admin Mike', waiveCount: 12, waiveTotal: 1800, averageWaivePercent: 52 },
          { adminId: '4', adminName: 'Admin Lisa', waiveCount: 11, waiveTotal: 950, averageWaivePercent: 25 }
        ],
        byPercentage: [
          { range: '0-25%', count: 15, totalAmount: 1200 },
          { range: '26-50%', count: 28, totalAmount: 3500 },
          { range: '51-75%', count: 12, totalAmount: 2200 },
          { range: '76-99%', count: 5, totalAmount: 800 },
          { range: '100%', count: 8, totalAmount: 750 }
        ]
      },
      paymentFailures: {
        byReason: [
          { reason: 'Insufficient funds', count: 25, totalAmount: 6250 },
          { reason: 'Card expired', count: 12, totalAmount: 3100 },
          { reason: 'Authentication required', count: 8, totalAmount: 2200 },
          { reason: 'Card declined', count: 5, totalAmount: 1450 },
          { reason: 'Network error', count: 3, totalAmount: 950 }
        ],
        byTimeOfDay: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          failures: Math.floor(Math.random() * 10),
          successRate: 75 + Math.random() * 20
        })),
        recurring: [
          { customerId: 'cus_123', customerName: 'John Doe', failureCount: 4, lastFailure: '2024-01-15', totalAttempts: 7 },
          { customerId: 'cus_456', customerName: 'Jane Smith', failureCount: 3, lastFailure: '2024-01-18', totalAttempts: 5 },
          { customerId: 'cus_789', customerName: 'Bob Wilson', failureCount: 3, lastFailure: '2024-01-20', totalAttempts: 4 }
        ]
      },
      disputes: {
        byType: [
          { type: 'Mileage overage', count: 15, resolvedCount: 12, resolutionRate: 80, averageResolutionTime: 18 },
          { type: 'Fuel charge', count: 8, resolvedCount: 7, resolutionRate: 87.5, averageResolutionTime: 12 },
          { type: 'Late return', count: 5, resolvedCount: 3, resolutionRate: 60, averageResolutionTime: 24 },
          { type: 'Damage claim', count: 3, resolvedCount: 1, resolutionRate: 33.3, averageResolutionTime: 72 }
        ],
        trends: [
          { week: 'Week 1', opened: 8, resolved: 6, pending: 2 },
          { week: 'Week 2', opened: 10, resolved: 8, pending: 4 },
          { week: 'Week 3', opened: 7, resolved: 9, pending: 2 },
          { week: 'Week 4', opened: 6, resolved: 5, pending: 3 }
        ],
        topDisputed: [
          { chargeType: 'Mileage', count: 15, percentage: 48 },
          { chargeType: 'Fuel', count: 8, percentage: 26 },
          { chargeType: 'Late fees', count: 5, percentage: 16 },
          { chargeType: 'Damage', count: 3, percentage: 10 }
        ]
      }
    }
  }

  const exportData = () => {
    if (!analytics) return
    
    const csv = [
      ['Charge Analytics Report'],
      [`Date Range: ${dateRange.start} to ${dateRange.end}`],
      [''],
      ['Summary'],
      ['Total Charges Processed', analytics.summary.totalChargesProcessed],
      ['Total Amount', `$${analytics.summary.totalChargesAmount}`],
      ['Total Waived', `$${analytics.summary.totalWaivedAmount}`],
      ['Success Rate', `${analytics.summary.successRate}%`],
      // Add more data as needed
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `charge-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          Failed to load analytics data
        </div>
      </div>
    )
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <IoArrowBackOutline className="mr-2" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Charge Analytics</h1>
            <p className="text-gray-600 mt-1">Track patterns, failures, and dispute trends</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            
            <button
              onClick={fetchAnalytics}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <IoDownloadOutline className="inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.summary.totalChargesAmount.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.summary.totalChargesProcessed} charges
              </p>
            </div>
            <IoCashOutline className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Waived</p>
              <p className="text-2xl font-bold text-amber-600">
                ${analytics.summary.totalWaivedAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {analytics.summary.averageWaivePercentage}%
              </p>
            </div>
            <IoReceiptOutline className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.summary.successRate.toFixed(1)}%
              </p>
              <p className="text-xs text-red-600 mt-1">
                {analytics.summary.failureRate.toFixed(1)}% failed
              </p>
            </div>
            <IoCheckmarkCircleOutline className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disputed</p>
              <p className="text-2xl font-bold text-red-600">
                ${analytics.summary.totalDisputedAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Under review
              </p>
            </div>
            <IoFlagOutline className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'waives', 'failures', 'disputes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Daily Trend Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Charge Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="amount" stackId="1" stroke="#10B981" fill="#10B981" name="Processed" />
                  <Area type="monotone" dataKey="waived" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Waived" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" name="Failed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.trends.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                  <Bar dataKey="waived" fill="#F59E0B" name="Waived" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'waives' && (
          <>
            {/* Waive by Reason */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Waive Reasons</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.waivePatterns.byReason}
                      dataKey="percentage"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics.waivePatterns.byReason.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  {analytics.waivePatterns.byReason.map((reason, index) => (
                    <div key={reason.reason} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700">{reason.reason}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${reason.totalAmount}</p>
                        <p className="text-xs text-gray-500">{reason.count} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Waive by Admin */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Waive Patterns by Admin</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waives</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.waivePatterns.byAdmin.map((admin) => (
                      <tr key={admin.adminId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <IoPersonOutline className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{admin.adminName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.waiveCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${admin.waiveTotal.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            admin.averageWaivePercent > 50 
                              ? 'bg-red-100 text-red-800'
                              : admin.averageWaivePercent > 25
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {admin.averageWaivePercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Waive by Percentage Range */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Waive Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.waivePatterns.byPercentage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'failures' && (
          <>
            {/* Failure Reasons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Failure Reasons</h2>
              <div className="space-y-4">
                {analytics.paymentFailures.byReason.map((reason) => (
                  <div key={reason.reason} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <IoWarningOutline className="w-5 h-5 text-red-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reason.reason}</p>
                        <div className="mt-1 relative">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div 
                              style={{ width: `${(reason.count / 53) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold">${reason.totalAmount}</p>
                      <p className="text-xs text-gray-500">{reason.count} failures</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure by Time of Day */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Failures by Time of Day</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.paymentFailures.byTimeOfDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="failures" stroke="#EF4444" name="Failures" />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#10B981" name="Success Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recurring Failures */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Recurring Payment Failures</h2>
                <p className="text-sm text-gray-600 mt-1">Customers with multiple failed payments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failures</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Failure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.paymentFailures.recurring.map((customer) => (
                      <tr key={customer.customerId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{customer.customerName}</p>
                          <p className="text-xs text-gray-500">{customer.customerId}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-red-600 font-medium">{customer.failureCount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm">
                            {((customer.totalAttempts - customer.failureCount) / customer.totalAttempts * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.lastFailure}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 text-sm">
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'disputes' && (
          <>
            {/* Dispute Types */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dispute Categories</h2>
              <div className="space-y-4">
                {analytics.disputes.byType.map((type) => (
                  <div key={type.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{type.type}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        type.resolutionRate > 75
                          ? 'bg-green-100 text-green-800'
                          : type.resolutionRate > 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type.resolutionRate.toFixed(0)}% resolved
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-semibold">{type.count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Resolved</p>
                        <p className="font-semibold text-green-600">{type.resolvedCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Time</p>
                        <p className="font-semibold">{type.averageResolutionTime}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Weekly Dispute Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.disputes.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="opened" stroke="#EF4444" name="Opened" />
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Most Disputed Charges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Most Disputed Charge Types</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.disputes.topDisputed} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="chargeType" type="category" />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#EF4444" name="% of Total Disputes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Insights Panel */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          <IoInformationCircleOutline className="inline mr-2" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Waive Pattern Alert</p>
            <p>Admin Mike has the highest average waive percentage at 52%. Consider review.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Payment Failure Trend</p>
            <p>Insufficient funds accounts for 47% of failures. Consider payment retry strategy.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Dispute Resolution</p>
            <p>Damage claims have lowest resolution rate (33%). May need clearer documentation.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Revenue Opportunity</p>
            <p>${analytics.summary.totalWaivedAmount} waived this period. Review waive policies.</p>
          </div>
        </div>
      </div>
    </div>
  )
}