
// app/sys-2847/fleet/bulk/page.tsx
'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader, Alert } from '../components'
import { DEFAULT_HOST_IDS } from '../constants'

// Force dynamic rendering to avoid pre-rendering issues


export default function BulkUploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [csvData, setCsvData] = useState('')
  const [hostId, setHostId] = useState(DEFAULT_HOST_IDS[0].id)
  const [results, setResults] = useState<any>(null)

  const sampleCSV = `make,model,year,color,carType,seats,doors,transmission,fuelType,dailyRate,city,state,zipCode,address,features
Lamborghini,Aventador,2023,Orange,CONVERTIBLE,2,2,AUTOMATIC,PREMIUM,1299,Scottsdale,AZ,85255,North Scottsdale,"Carbon Fiber, Sport Mode"
Ferrari,F8 Tributo,2023,Red,SPORTS,2,2,SEMI_AUTOMATIC,PREMIUM,1199,Phoenix,AZ,85001,Downtown Phoenix,"Racing Mode, Premium Sound"
McLaren,720S,2022,Blue,SPORTS,2,2,AUTOMATIC,PREMIUM,1099,Tempe,AZ,85281,Mill Avenue,"Carbon Brakes, Track Mode"
Rolls-Royce,Ghost,2023,Black,SEDAN,5,4,AUTOMATIC,PREMIUM,1499,Paradise Valley,AZ,85253,Lincoln Drive,"Starlight Ceiling, Massage Seats"
Bentley,Continental GT,2023,White,SEDAN,4,2,AUTOMATIC,PREMIUM,999,Scottsdale,AZ,85260,Old Town,"W12 Engine, Diamond Quilting"`

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'car-import-template.csv'
    a.click()
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj: any = {}
      headers.forEach((header, i) => {
        obj[header] = values[i]
      })
      return obj
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvData(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!csvData.trim()) {
      setError('Please enter or upload CSV data')
      return
    }
    
    setLoading(true)
    setError('')
    setResults(null)
    
    try {
      const cars = parseCSV(csvData)
      
      const response = await fetch('/sys-2847/fleet/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cars, hostId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
      } else {
        setError(data.error || 'Failed to import cars')
      }
    } catch (err) {
      setError('Failed to process CSV data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader 
        title="Bulk Import Cars" 
        description="Upload multiple cars at once using CSV format"
      />

      {error && <Alert type="error" message={error} />}

      {/* Host Selection */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">Default Host Assignment</h3>
        <select
          value={hostId}
          onChange={(e) => setHostId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
        >
          {DEFAULT_HOST_IDS.map(host => (
            <option key={host.id} value={host.id}>{host.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          All imported cars will be assigned to this host unless specified in CSV
        </p>
      </div>

      {/* CSV Input */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">CSV Data</h3>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Download Template
            </button>
            <label className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder={sampleCSV}
          className="w-full h-64 px-3 py-2 bg-gray-900 border border-gray-700 rounded font-mono text-xs"
        />
        
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !csvData.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
          >
            {loading ? 'Importing...' : 'Import Cars'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Import Results</h3>
          
          {results.success.length > 0 && (
            <div className="mb-4">
              <h4 className="text-green-400 font-semibold mb-2">
                Successfully Imported: {results.success.length}
              </h4>
              <div className="bg-gray-900 rounded p-3">
                {results.success.map((car: any, idx: number) => (
                  <div key={idx} className="text-sm text-gray-300">
                    ✓ {car.make} {car.model} (ID: {car.id})
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.failed.length > 0 && (
            <div>
              <h4 className="text-red-400 font-semibold mb-2">
                Failed: {results.failed.length}
              </h4>
              <div className="bg-gray-900 rounded p-3">
                {results.failed.map((car: any, idx: number) => (
                  <div key={idx} className="text-sm text-red-300">
                    ✗ {car.make} {car.model}: {car.error}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => router.push('/sys-2847/fleet')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Fleet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}