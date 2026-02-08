'use client'

import { useState } from 'react'

export default function SystemTest() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: Record<string, any> = {}

    try {
      const patterns = await fetch('/api/admin/system/alerts/patterns').then(r => r.json())
      testResults.patterns = patterns

      const monitor = await fetch('/api/admin/system/monitor', { method: 'POST' }).then(r => r.json())
      testResults.monitor = monitor

      const dashboard = await fetch('/api/admin/system/alerts/dashboard').then(r => r.json())
      testResults.dashboard = dashboard

      const cron = await fetch('/api/admin/system/cron', {
        headers: { 'Authorization': 'Bearer itwhip-cron-94e9c35d522e8c95ba124fb0de2a9171' }
      }).then(r => r.json())
      testResults.cron = cron
    } catch (error) {
      testResults.error = error
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SIEM System Test</h1>
      
      <button 
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Running Tests...' : 'Run All SIEM Tests'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
