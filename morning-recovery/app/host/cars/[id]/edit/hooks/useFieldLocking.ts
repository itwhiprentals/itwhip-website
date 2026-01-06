// app/host/cars/[id]/edit/hooks/useFieldLocking.ts
import { useMemo, useCallback } from 'react'
import type { CarDetails } from '../types'

interface UseFieldLockingProps {
  car: CarDetails | null
  vinDecodedFields: string[]
}

interface UseFieldLockingReturn {
  isLocked: boolean
  isApproved: boolean
  isFieldLocked: (fieldName: string) => boolean
  isVinVerified: (fieldName: string) => boolean
}

// Fields that should be locked after vehicle approval
const LOCKED_AFTER_APPROVAL = [
  'make',
  'model',
  'year',
  'color',
  'vin',
  'licensePlate',
  'registrationState'
]

/**
 * Hook to manage field locking state based on:
 * - Active claims (all fields locked)
 * - Approval status (core identity fields locked)
 * - VIN-decoded fields (locked to maintain data integrity)
 */
export function useFieldLocking({ car, vinDecodedFields }: UseFieldLockingProps): UseFieldLockingReturn {
  // Check if vehicle is locked due to active claim
  const isLocked = useMemo(() => {
    return car?.hasActiveClaim || false
  }, [car?.hasActiveClaim])

  // Check if vehicle has been approved
  const isApproved = useMemo(() => {
    return (car as any)?.status === 'APPROVED' || (car as any)?.isApproved === true
  }, [car])

  // Determine if a specific field should be locked
  const isFieldLocked = useCallback((fieldName: string): boolean => {
    // Lock all fields if vehicle has an active claim
    if (isLocked) return true

    // Lock specific fields after approval
    if (isApproved && LOCKED_AFTER_APPROVAL.includes(fieldName)) return true

    // Lock VIN-decoded fields (except VIN itself, which can be re-entered before approval)
    if (vinDecodedFields.includes(fieldName) && fieldName !== 'vin') return true

    return false
  }, [isLocked, isApproved, vinDecodedFields])

  // Check if a field was verified via VIN decode (for showing badge)
  const isVinVerified = useCallback((fieldName: string): boolean => {
    return vinDecodedFields.includes(fieldName)
  }, [vinDecodedFields])

  return {
    isLocked,
    isApproved,
    isFieldLocked,
    isVinVerified
  }
}

export default useFieldLocking
