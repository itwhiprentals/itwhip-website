// app/(guest)/dashboard/layout.tsx
// Dashboard Layout - Server Component wrapper

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - ItWhip',
  description: 'Your all-in-one travel dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Dashboard Container */}
      <div className="relative">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-green-100 mt-1">
                  Your all-in-one travel dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="dashboard-content">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 ItWhip. Your travel, simplified.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Help
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}