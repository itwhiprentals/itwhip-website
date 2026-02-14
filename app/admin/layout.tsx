import { NextIntlClientProvider } from 'next-intl'
import enMessages from '@/messages/en.json'

// Only pass Header/MobileMenu/Common namespaces — admin portal stays English
const adminMessages = {
  Header: enMessages.Header,
  MobileMenu: enMessages.MobileMenu,
  Footer: enMessages.Footer,
  Common: enMessages.Common,
}

export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <NextIntlClientProvider locale="en" messages={adminMessages}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold">ItWhip Admin</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/admin/rentals/bookings" className="text-gray-700 hover:text-gray-900">Bookings</a>
                  <a href="/admin/rentals/cars" className="text-gray-700 hover:text-gray-900">Cars</a>
                  <a href="/admin/rentals/hosts" className="text-gray-700 hover:text-gray-900">Hosts</a>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </NextIntlClientProvider>
    )
  }