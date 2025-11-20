// app/lib/pdf/pdfStyles.ts

/**
 * PDF Styling Constants for Claim Export
 * Defines colors, fonts, spacing, and layout rules
 */

export const PDF_STYLES = {
    // Page settings
    page: {
      margin: 50,
      width: 612, // US Letter width in points
      height: 792, // US Letter height in points
    },
  
    // Colors (matching ItWhip brand)
    colors: {
      primary: '#2563eb', // Blue-600
      secondary: '#6b7280', // Gray-500
      success: '#10b981', // Green-600
      warning: '#f59e0b', // Amber-500
      danger: '#ef4444', // Red-600
      text: '#111827', // Gray-900
      textLight: '#6b7280', // Gray-500
      background: '#f9fafb', // Gray-50
      border: '#e5e7eb', // Gray-200
    },
  
    // Typography
    fonts: {
      heading: {
        size: 18,
        lineHeight: 1.2,
      },
      subheading: {
        size: 14,
        lineHeight: 1.3,
      },
      body: {
        size: 10,
        lineHeight: 1.5,
      },
      small: {
        size: 8,
        lineHeight: 1.4,
      },
      large: {
        size: 12,
        lineHeight: 1.4,
      },
    },
  
    // Spacing
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
  
    // Status badge colors
    statusColors: {
      PENDING: { bg: '#fef3c7', text: '#92400e' }, // Yellow
      APPROVED: { bg: '#d1fae5', text: '#065f46' }, // Green
      DENIED: { bg: '#fee2e2', text: '#991b1b' }, // Red
      SUBMITTED: { bg: '#dbeafe', text: '#1e40af' }, // Blue
    },
  
    // Insurance hierarchy colors
    insuranceColors: {
      PRIMARY: '#10b981', // Green
      SECONDARY: '#3b82f6', // Blue
      TERTIARY: '#6b7280', // Gray
    },
  }
  
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }