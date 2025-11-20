// app/lib/service/service-validation.ts

import { ServiceType } from '@prisma/client'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Service record data to validate
 */
export interface ServiceRecordInput {
  serviceType: ServiceType | string
  serviceDate: Date | string
  mileageAtService: number | string
  shopName: string
  shopAddress: string
  costTotal: number | string
  receiptUrl: string
  itemsServiced?: string[]
  notes?: string
  nextServiceDue?: Date | string | null
  nextServiceMileage?: number | string | null
  technicianName?: string
  invoiceNumber?: string
  inspectionReportUrl?: string
}

/**
 * Validate a complete service record before creation
 */
export function validateServiceRecord(
  data: ServiceRecordInput,
  currentCarMileage?: number,
  previousServiceMileage?: number
): ValidationResult {
  const errors: ValidationError[] = []

  // Validate serviceType
  if (!data.serviceType) {
    errors.push({
      field: 'serviceType',
      message: 'Service type is required',
      code: 'REQUIRED'
    })
  } else if (!Object.values(ServiceType).includes(data.serviceType as ServiceType)) {
    errors.push({
      field: 'serviceType',
      message: 'Invalid service type',
      code: 'INVALID_ENUM'
    })
  }

  // Validate serviceDate
  if (!data.serviceDate) {
    errors.push({
      field: 'serviceDate',
      message: 'Service date is required',
      code: 'REQUIRED'
    })
  } else {
    const serviceDate = new Date(data.serviceDate)
    const now = new Date()
    
    if (isNaN(serviceDate.getTime())) {
      errors.push({
        field: 'serviceDate',
        message: 'Invalid date format',
        code: 'INVALID_FORMAT'
      })
    } else if (serviceDate > now) {
      errors.push({
        field: 'serviceDate',
        message: 'Service date cannot be in the future',
        code: 'FUTURE_DATE'
      })
    } else {
      // Check if date is more than 10 years in the past
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      
      if (serviceDate < tenYearsAgo) {
        errors.push({
          field: 'serviceDate',
          message: 'Service date cannot be more than 10 years ago',
          code: 'TOO_OLD'
        })
      }
    }
  }

  // Validate mileageAtService
  if (!data.mileageAtService && data.mileageAtService !== 0) {
    errors.push({
      field: 'mileageAtService',
      message: 'Mileage at service is required',
      code: 'REQUIRED'
    })
  } else {
    const mileage = typeof data.mileageAtService === 'string' 
      ? parseInt(data.mileageAtService) 
      : data.mileageAtService

    if (isNaN(mileage)) {
      errors.push({
        field: 'mileageAtService',
        message: 'Mileage must be a valid number',
        code: 'INVALID_NUMBER'
      })
    } else if (mileage < 0) {
      errors.push({
        field: 'mileageAtService',
        message: 'Mileage cannot be negative',
        code: 'NEGATIVE_VALUE'
      })
    } else if (mileage > 999999) {
      errors.push({
        field: 'mileageAtService',
        message: 'Mileage seems unrealistic (maximum 999,999)',
        code: 'TOO_HIGH'
      })
    }

    // Validate against current car mileage
    if (currentCarMileage !== undefined && mileage > currentCarMileage + 1000) {
      errors.push({
        field: 'mileageAtService',
        message: `Service mileage (${mileage.toLocaleString()}) cannot be more than 1,000 miles above current vehicle mileage (${currentCarMileage.toLocaleString()})`,
        code: 'EXCEEDS_CURRENT'
      })
    }

    // Validate against previous service mileage
    if (previousServiceMileage !== undefined && previousServiceMileage > 0 && mileage < previousServiceMileage) {
      errors.push({
        field: 'mileageAtService',
        message: `Service mileage (${mileage.toLocaleString()}) cannot be less than previous service mileage (${previousServiceMileage.toLocaleString()})`,
        code: 'LESS_THAN_PREVIOUS'
      })
    }
  }

  // Validate shopName
  if (!data.shopName || data.shopName.trim().length === 0) {
    errors.push({
      field: 'shopName',
      message: 'Shop/service provider name is required',
      code: 'REQUIRED'
    })
  } else if (data.shopName.length > 200) {
    errors.push({
      field: 'shopName',
      message: 'Shop name is too long (maximum 200 characters)',
      code: 'TOO_LONG'
    })
  }

  // Validate shopAddress
  if (!data.shopAddress || data.shopAddress.trim().length === 0) {
    errors.push({
      field: 'shopAddress',
      message: 'Shop address is required',
      code: 'REQUIRED'
    })
  } else if (data.shopAddress.length > 500) {
    errors.push({
      field: 'shopAddress',
      message: 'Shop address is too long (maximum 500 characters)',
      code: 'TOO_LONG'
    })
  }

  // Validate costTotal
  if (!data.costTotal && data.costTotal !== 0) {
    errors.push({
      field: 'costTotal',
      message: 'Service cost is required',
      code: 'REQUIRED'
    })
  } else {
    const cost = typeof data.costTotal === 'string' 
      ? parseFloat(data.costTotal) 
      : data.costTotal

    if (isNaN(cost)) {
      errors.push({
        field: 'costTotal',
        message: 'Cost must be a valid number',
        code: 'INVALID_NUMBER'
      })
    } else if (cost < 0) {
      errors.push({
        field: 'costTotal',
        message: 'Cost cannot be negative',
        code: 'NEGATIVE_VALUE'
      })
    } else if (cost > 50000) {
      errors.push({
        field: 'costTotal',
        message: 'Cost seems unrealistic (maximum $50,000)',
        code: 'TOO_HIGH'
      })
    }
  }

  // Validate receiptUrl
  if (!data.receiptUrl || data.receiptUrl.trim().length === 0) {
    errors.push({
      field: 'receiptUrl',
      message: 'Receipt/proof of service is required',
      code: 'REQUIRED'
    })
  } else {
    // Basic URL validation
    try {
      new URL(data.receiptUrl)
    } catch {
      errors.push({
        field: 'receiptUrl',
        message: 'Invalid URL format for receipt',
        code: 'INVALID_URL'
      })
    }
  }

  // Validate optional fields

  // Validate itemsServiced (if provided)
  if (data.itemsServiced && Array.isArray(data.itemsServiced)) {
    if (data.itemsServiced.length > 50) {
      errors.push({
        field: 'itemsServiced',
        message: 'Too many items serviced (maximum 50)',
        code: 'TOO_MANY'
      })
    }
    
    data.itemsServiced.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        errors.push({
          field: `itemsServiced[${index}]`,
          message: 'Each item must be a non-empty string',
          code: 'INVALID_ITEM'
        })
      } else if (item.length > 200) {
        errors.push({
          field: `itemsServiced[${index}]`,
          message: 'Item description too long (maximum 200 characters)',
          code: 'TOO_LONG'
        })
      }
    })
  }

  // Validate notes (if provided)
  if (data.notes && data.notes.length > 2000) {
    errors.push({
      field: 'notes',
      message: 'Notes are too long (maximum 2000 characters)',
      code: 'TOO_LONG'
    })
  }

  // Validate nextServiceDue (if provided)
  if (data.nextServiceDue) {
    const nextServiceDue = new Date(data.nextServiceDue)
    const serviceDate = new Date(data.serviceDate)
    
    if (isNaN(nextServiceDue.getTime())) {
      errors.push({
        field: 'nextServiceDue',
        message: 'Invalid date format for next service due',
        code: 'INVALID_FORMAT'
      })
    } else if (nextServiceDue <= serviceDate) {
      errors.push({
        field: 'nextServiceDue',
        message: 'Next service due must be after service date',
        code: 'BEFORE_SERVICE_DATE'
      })
    }
  }

  // Validate nextServiceMileage (if provided)
  if (data.nextServiceMileage) {
    const nextMileage = typeof data.nextServiceMileage === 'string'
      ? parseInt(data.nextServiceMileage)
      : data.nextServiceMileage
    
    const currentMileage = typeof data.mileageAtService === 'string'
      ? parseInt(data.mileageAtService)
      : data.mileageAtService

    if (isNaN(nextMileage)) {
      errors.push({
        field: 'nextServiceMileage',
        message: 'Next service mileage must be a valid number',
        code: 'INVALID_NUMBER'
      })
    } else if (nextMileage <= currentMileage) {
      errors.push({
        field: 'nextServiceMileage',
        message: 'Next service mileage must be greater than current mileage',
        code: 'NOT_GREATER'
      })
    } else if (nextMileage > 999999) {
      errors.push({
        field: 'nextServiceMileage',
        message: 'Next service mileage seems unrealistic (maximum 999,999)',
        code: 'TOO_HIGH'
      })
    }
  }

  // Validate technicianName (if provided)
  if (data.technicianName && data.technicianName.length > 200) {
    errors.push({
      field: 'technicianName',
      message: 'Technician name is too long (maximum 200 characters)',
      code: 'TOO_LONG'
    })
  }

  // Validate invoiceNumber (if provided)
  if (data.invoiceNumber && data.invoiceNumber.length > 100) {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is too long (maximum 100 characters)',
      code: 'TOO_LONG'
    })
  }

  // Validate inspectionReportUrl (if provided)
  if (data.inspectionReportUrl) {
    try {
      new URL(data.inspectionReportUrl)
    } catch {
      errors.push({
        field: 'inspectionReportUrl',
        message: 'Invalid URL format for inspection report',
        code: 'INVALID_URL'
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format validation errors into a human-readable string
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors'
  }

  if (errors.length === 1) {
    return errors[0].message
  }

  return errors.map((error, index) => `${index + 1}. ${error.message}`).join('\n')
}

/**
 * Get error messages for a specific field
 */
export function getFieldErrors(errors: ValidationError[], fieldName: string): string[] {
  return errors
    .filter(error => error.field === fieldName)
    .map(error => error.message)
}

/**
 * Check if a specific field has errors
 */
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(error => error.field === fieldName)
}

/**
 * Validate mileage gap between services
 * Warns if mileage increase is unusually high
 */
export function validateMileageGap(
  previousMileage: number,
  currentMileage: number,
  daysBetweenServices: number
): {
  isReasonable: boolean
  warning: string | null
} {
  const mileageDiff = currentMileage - previousMileage
  
  // If less than 1 day between services, skip validation
  if (daysBetweenServices < 1) {
    return { isReasonable: true, warning: null }
  }

  const milesPerDay = mileageDiff / daysBetweenServices
  
  // Typical range: 20-150 miles per day
  // Warning if > 300 miles per day
  if (milesPerDay > 300) {
    return {
      isReasonable: false,
      warning: `Unusually high mileage increase: ${mileageDiff.toLocaleString()} miles in ${daysBetweenServices} days (${Math.round(milesPerDay)} miles/day). Please verify.`
    }
  }

  // Warning if < 5 miles per day for long periods
  if (daysBetweenServices > 30 && milesPerDay < 5) {
    return {
      isReasonable: false,
      warning: `Unusually low mileage increase: ${mileageDiff.toLocaleString()} miles in ${daysBetweenServices} days (${Math.round(milesPerDay)} miles/day). Please verify.`
    }
  }

  return { isReasonable: true, warning: null }
}

/**
 * Validate service type matches itemsServiced
 */
export function validateServiceTypeConsistency(
  serviceType: ServiceType,
  itemsServiced: string[]
): {
  isConsistent: boolean
  warning: string | null
} {
  if (!itemsServiced || itemsServiced.length === 0) {
    return { isConsistent: true, warning: null }
  }

  const itemsLower = itemsServiced.map(item => item.toLowerCase())

  // Check for common inconsistencies
  const inconsistencies: Record<ServiceType, string[]> = {
    [ServiceType.OIL_CHANGE]: ['brake', 'tire', 'suspension'],
    [ServiceType.BRAKE_CHECK]: ['oil', 'transmission', 'coolant'],
    [ServiceType.TIRE_ROTATION]: ['oil', 'brake', 'transmission'],
    [ServiceType.STATE_INSPECTION]: [], // Can include anything
    [ServiceType.FLUID_CHECK]: [],
    [ServiceType.BATTERY_CHECK]: [],
    [ServiceType.AIR_FILTER]: [],
    [ServiceType.MAJOR_SERVICE_30K]: [],
    [ServiceType.MAJOR_SERVICE_60K]: [],
    [ServiceType.MAJOR_SERVICE_90K]: [],
    [ServiceType.CUSTOM]: []
  }

  const problematicTerms = inconsistencies[serviceType] || []

  for (const term of problematicTerms) {
    if (itemsLower.some(item => item.includes(term))) {
      return {
        isConsistent: false,
        warning: `Service type '${serviceType}' typically doesn't include '${term}'. Consider using a different service type or CUSTOM.`
      }
    }
  }

  return { isConsistent: true, warning: null }
}