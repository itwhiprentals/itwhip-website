// app/(guest)/rentals/lib/company-utils.ts

// Helper function to detect if name is a company
export function isCompanyName(name: string): boolean {
    // Check if name contains numbers (common in company names like "Cars 39" or "24/7 Rentals")
    if (/\d/.test(name)) {
      return true
    }
    
    const companyIndicators = [
      'LLC', 'Inc', 'Corp', 'Corporation', 'Company', 'Co.', 'Ltd', 'Limited',
      'Group', 'Holdings', 'Enterprises', 'Solutions', 'Services', 'Partners',
      'Associates', 'Rentals', 'Motors', 'Auto', 'Automotive', 'Cars', 'Vehicles',
      'Fleet', 'Leasing', 'Management', 'Properties', 'Investments', 'Capital',
      'Ventures', 'Systems', 'Technologies', 'Tech', 'Industries', 'International',
      'Global', 'Worldwide', '&', 'and Sons', 'Brothers', 'Bros', 'Rent', 'Rental'
    ]
    
    const lowerName = name.toLowerCase()
    return companyIndicators.some(indicator => 
      lowerName.includes(indicator.toLowerCase())
    )
  }
  
  // Helper function to abbreviate name to first name + last initial (only for individuals)
  export function abbreviateName(fullName: string, isCompany?: boolean): string {
    // If it's explicitly marked as company or detected as company, return full name
    if (isCompany || isCompanyName(fullName)) {
      return fullName
    }
    
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) {
      return parts[0] // Just first name if no last name
    }
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }