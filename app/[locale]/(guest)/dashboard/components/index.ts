// app/(guest)/dashboard/components/index.ts
// Central export file for dashboard components

// Rental car components
export { default as RentalBookingsSection } from './RentalBookingsSection'
export { default as WarningBanner } from './WarningBanner'
export { default as AppealModal } from './AppealModal'
export { default as AppealStatusBanner } from './AppealStatusBanner'
export { default as GoodStandingBanner } from './GoodStandingBanner'
export { default as VerificationAlert } from './VerificationAlert'
export { default as RestrictionGuard } from './RestrictionGuard'

// Context and hooks
export {
  RentalContext,
  RentalProvider,
  useRental,
  type RentalBooking,
  type RentalLocation,
  type VehicleFeatures,
  type RentalInventoryItem
} from './RentalContext'
