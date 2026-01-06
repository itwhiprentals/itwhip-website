// app/sys-2847/fleet/templates/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader, Alert } from '../components'
import { COMMON_LUXURY_MODELS } from '../constants'

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/sys-2847/fleet/api/templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = (template: any) => {
    // Store template in sessionStorage and redirect to add page
    sessionStorage.setItem('carTemplate', JSON.stringify(template.data))
    router.push('/fleet/add')
  }

  const quickTemplates = [
    {
      name: 'Luxury Sedan',
      data: {
        carType: 'SEDAN',
        seats: 5,
        doors: 4,
        transmission: 'AUTOMATIC',
        fuelType: 'PREMIUM',
        dailyRate: 599,
        features: 'Leather Seats, Premium Sound, Navigation, Heated Seats'
      }
    },
    {
      name: 'Electric SUV',
      data: {
        carType: 'SUV',
        seats: 7,
        doors: 4,
        transmission: 'AUTOMATIC',
        fuelType: 'ELECTRIC',
        dailyRate: 499,
        features: 'Autopilot, Third Row, Panoramic Roof, Premium Audio'
      }
    },
    {
      name: 'Sports Car',
      data: {
        carType: 'SPORTS',
        seats: 2,
        doors: 2,
        transmission: 'MANUAL',
        fuelType: 'PREMIUM',
        dailyRate: 799,
        features: 'Sport Mode, Carbon Fiber, Racing Seats, Performance Exhaust'
      }
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <SectionHeader 
        title="Car Templates" 
        description="Use templates to quickly add similar vehicles"
      />

      {/* Pre-configured Templates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Luxury Car Templates</h3>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600">
              <h4 className="font-semibold text-white mb-2">{template.name}</h4>
              <div className="text-sm text-gray-400 mb-3">
                <div>{template.data.make} {template.data.model}</div>
                <div>${template.data.dailyRate}/day</div>
                <div>{template.data.transmission} • {template.data.fuelType}</div>
              </div>
              <button
                onClick={() => useTemplate(template)}
                className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickTemplates.map((template, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600">
              <h4 className="font-semibold text-white mb-2">{template.name}</h4>
              <div className="text-sm text-gray-400 mb-3">
                <div>{template.data.seats} seats • {template.data.doors} doors</div>
                <div>${template.data.dailyRate}/day</div>
                <div>{template.data.transmission} • {template.data.fuelType}</div>
              </div>
              <button
                onClick={() => useTemplate(template)}
                className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Common Models Reference */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Popular Models Reference</h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            {COMMON_LUXURY_MODELS.map((model, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{model.make}</span>
                <span className="text-gray-500">{model.model}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Use these as reference when manually entering car details
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push('/fleet/add')}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Car Manually
        </button>
        <button
          onClick={() => router.push('/fleet')}
          className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}