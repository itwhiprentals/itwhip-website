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

// Dashboard UI components
export { default as ProfileCard } from './ProfileCard'
export { default as FeaturedCards } from './FeaturedCards'
export { default as StatsGrid } from './StatsGrid'
export { default as QuickActions } from './QuickActions'
export { default as RecentTrips } from './RecentTrips'
export { default as SupportCard } from './SupportCard'
export { default as DisclaimerCard } from './DisclaimerCard'

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
