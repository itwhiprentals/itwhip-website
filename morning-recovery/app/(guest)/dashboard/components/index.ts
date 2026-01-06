// app/(guest)/dashboard/components/index.ts
// Central export file for all dashboard components

// Core components
export { default as AICommandStrip } from './AICommandStrip'
export { default as ActiveServices } from './ActiveServices'
export { default as HotelMiniStore } from './HotelMiniStore'
export { default as ServiceGrid } from './ServiceGrid'
export { default as SmartSidebar } from './SmartSidebar'
export { default as TripTimeline } from './TripTimeline'

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

// Legacy exports for backwards compatibility
export {
  RentalContext as HotelContext,
  RentalProvider as HotelProvider,
  useRental as useHotel
} from './RentalContext'

// Re-export component prop types for external use
export type {
  ServiceGridProps,
  Service,
  ServiceStatus
} from './ServiceGrid'

export type {
  ActiveServicesProps,
  ActiveService
} from './ActiveServices'

export type {
  HotelMiniStoreProps,
  StoreItem,
  StoreCategory
} from './HotelMiniStore'

export type {
  SmartSidebarProps,
  SidebarWidget
} from './SmartSidebar'

export type {
  TripTimelineProps,
  TimelineEvent,
  TimelineStatus
} from './TripTimeline'

export type {
  AICommandStripProps,
  AICommand,
  CommandAction
} from './AICommandStrip'