// app/admin/auth/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Portal - ItWhip',
  description: 'Secure admin access portal',
  robots: 'noindex, nofollow', // Prevent search engine indexing
}

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Auth Container */}
      <div className="relative">
        {/* Background Pattern Overlay */}
        <div className="fixed inset-0 opacity-5">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Security Badge - Top Corner */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-red-900/20 backdrop-blur-sm border border-red-800/50 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-red-400">Secure Admin Area</span>
          </div>
        </div>

        {/* Version/Environment Indicator */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className="text-xs text-gray-600">
            <div>Admin Portal v1.0</div>
            <div className="mt-1">
              Environment: {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Session Timeout Warning (will be populated by client component) */}
        <div id="session-warning-portal" />
        
        {/* Loading Overlay (will be controlled by client) */}
        <div id="admin-loading-portal" />
      </div>
    </div>
  )
}