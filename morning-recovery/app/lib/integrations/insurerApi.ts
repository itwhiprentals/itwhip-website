// app/lib/integrations/insurerApi.ts

/**
 * Generic Insurance Provider API Integration
 * 
 * This is a generic integration that can work with any insurance provider.
 * Provider-specific configuration is stored in the database.
 * 
 * Currently configured for mock mode - will be updated with real provider
 * credentials when ready (e.g., Liberty Mutual, Tint, etc.)
 */

interface InsurerConfig {
    providerName: string
    apiUrl: string
    apiKey?: string
    clientId?: string
    enabled: boolean
  }
  
  interface FNOLSubmissionData {
    // Claim information
    claimId: string
    claimType: string
    incidentDate: string
    description: string
    estimatedCost: number
    
    // Policy information
    policyNumber: string | null
    externalPolicyId: string | null
    policyTier: string
    liabilityCoverage: number
    collisionCoverage: number
    deductible: number
    
    // Host information
    hostName: string
    hostEmail: string
    hostPhone: string
    hostEarningsTier: string
    
    // Guest information
    guestName: string
    guestEmail: string
    guestLocation?: string
    guestInsurance?: {
      provider: string
      policyNumber: string
    }
    
    // Vehicle information
    vehicleMake: string
    vehicleModel: string
    vehicleYear: number
    vehicleLicensePlate: string
    vehicleVIN?: string
    
    // Booking information
    bookingCode: string
    bookingStartDate: string
    bookingEndDate: string
    
    // Evidence
    damagePhotos?: string[]
    incidentLocation?: string
  }
  
  interface FNOLSubmissionResponse {
    success: boolean
    insurerClaimId?: string
    insurerStatus?: string
    submittedAt?: string
    error?: string
    rawResponse?: any
  }
  
  /**
   * Get insurer configuration from environment
   * This will be moved to database later for multi-provider support
   */
  function getInsurerConfig(): InsurerConfig {
    return {
      providerName: process.env.INSURER_PROVIDER_NAME || 'Mock Insurance Provider',
      apiUrl: process.env.INSURER_API_URL || 'https://api-mock.insurance-provider.com',
      apiKey: process.env.INSURER_API_KEY,
      clientId: process.env.INSURER_CLIENT_ID,
      enabled: process.env.INSURER_API_ENABLED === 'true',
    }
  }
  
  /**
   * Format FNOL data for insurance provider API
   * This format is generic - adjust based on actual provider requirements
   */
  function formatFNOLPayload(data: FNOLSubmissionData): any {
    return {
      // Standard FNOL fields (most insurers use similar structure)
      loss: {
        lossDate: data.incidentDate,
        lossType: data.claimType,
        lossDescription: data.description,
        estimatedAmount: data.estimatedCost,
        location: data.incidentLocation || 'Unknown',
      },
      
      policy: {
        policyNumber: data.policyNumber || data.externalPolicyId,
        policyType: 'COMMERCIAL_AUTO',
        coverageType: data.policyTier,
        deductible: data.deductible,
        limits: {
          liability: data.liabilityCoverage,
          collision: data.collisionCoverage,
        },
      },
      
      insured: {
        type: 'POLICYHOLDER',
        name: data.hostName,
        email: data.hostEmail,
        phone: data.hostPhone,
        reference: data.bookingCode,
      },
      
      claimant: {
        type: 'THIRD_PARTY',
        name: data.guestName,
        email: data.guestEmail,
        location: data.guestLocation,
        insurance: data.guestInsurance ? {
          carrier: data.guestInsurance.provider,
          policyNumber: data.guestInsurance.policyNumber,
        } : null,
      },
      
      vehicle: {
        make: data.vehicleMake,
        model: data.vehicleModel,
        year: data.vehicleYear,
        licensePlate: data.vehicleLicensePlate,
        vin: data.vehicleVIN,
      },
      
      rental: {
        bookingReference: data.bookingCode,
        rentalStartDate: data.bookingStartDate,
        rentalEndDate: data.bookingEndDate,
        platform: 'ItWhip',
      },
      
      attachments: data.damagePhotos ? data.damagePhotos.map((url, index) => ({
        type: 'PHOTO',
        url: url,
        description: `Damage photo ${index + 1}`,
      })) : [],
      
      metadata: {
        source: 'ItWhip Platform',
        submittedBy: 'FLEET_ADMIN',
        internalClaimId: data.claimId,
        earningsTier: data.hostEarningsTier,
      },
    }
  }
  
  /**
   * Submit FNOL (First Notice of Loss) to insurance provider
   */
  export async function submitFNOL(data: FNOLSubmissionData): Promise<FNOLSubmissionResponse> {
    const config = getInsurerConfig()
    
    // If API is not enabled, return mock success
    if (!config.enabled) {
      console.log('📋 [MOCK MODE] FNOL Submission:', {
        claimId: data.claimId,
        provider: config.providerName,
        estimatedCost: data.estimatedCost,
        claimType: data.claimType,
      })
      
      return {
        success: true,
        insurerClaimId: `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        insurerStatus: 'RECEIVED',
        submittedAt: new Date().toISOString(),
      }
    }
    
    // Real API submission
    try {
      const payload = formatFNOLPayload(data)
      
      const response = await fetch(`${config.apiUrl}/v1/fnol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Client-ID': config.clientId || '',
          'X-Platform': 'ItWhip',
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      
      console.log('✅ FNOL Submitted Successfully:', {
        claimId: data.claimId,
        insurerClaimId: result.claimId || result.claimNumber,
        provider: config.providerName,
      })
      
      return {
        success: true,
        insurerClaimId: result.claimId || result.claimNumber,
        insurerStatus: result.status || 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        rawResponse: result,
      }
      
    } catch (error) {
      console.error('❌ FNOL Submission Failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  /**
   * Check claim status with insurance provider
   */
  export async function checkClaimStatus(insurerClaimId: string): Promise<{
    success: boolean
    status?: string
    updates?: any
    error?: string
  }> {
    const config = getInsurerConfig()
    
    // If API is not enabled, return mock status
    if (!config.enabled) {
      console.log('📋 [MOCK MODE] Status Check:', { insurerClaimId })
      
      return {
        success: true,
        status: 'IN_REVIEW',
        updates: {
          lastUpdated: new Date().toISOString(),
          notes: 'Claim is being reviewed by adjuster',
        },
      }
    }
    
    // Real API status check
    try {
      const response = await fetch(`${config.apiUrl}/v1/claims/${insurerClaimId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Client-ID': config.clientId || '',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      return {
        success: true,
        status: result.status,
        updates: result,
      }
      
    } catch (error) {
      console.error('❌ Status Check Failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  /**
   * Update claim with additional information
   */
  export async function updateClaim(
    insurerClaimId: string,
    updates: {
      description?: string
      estimatedCost?: number
      additionalPhotos?: string[]
      notes?: string
    }
  ): Promise<{
    success: boolean
    error?: string
  }> {
    const config = getInsurerConfig()
    
    // If API is not enabled, return mock success
    if (!config.enabled) {
      console.log('📋 [MOCK MODE] Claim Update:', { insurerClaimId, updates })
      return { success: true }
    }
    
    // Real API update
    try {
      const response = await fetch(`${config.apiUrl}/v1/claims/${insurerClaimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Client-ID': config.clientId || '',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`)
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ Claim Update Failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
  
  /**
   * Utility: Get provider name (for display purposes)
   */
  export function getProviderName(): string {
    return getInsurerConfig().providerName
  }
  
  /**
   * Utility: Check if insurer API is enabled
   */
  export function isInsurerApiEnabled(): boolean {
    return getInsurerConfig().enabled
  }
  
  // Export types
  export type { InsurerConfig, FNOLSubmissionData, FNOLSubmissionResponse }