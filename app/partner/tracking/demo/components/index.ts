// app/partner/tracking/demo/components/index.ts
// Export all tracking map components

export { default as TrackingMap } from './TrackingMap'
export { default as MapLegend } from './MapLegend'
export { default as MapControls } from './MapControls'
export { default as VehicleInfoOverlay } from './VehicleInfoOverlay'
export { default as TripReplayControls } from './TripReplayControls'

// Re-export types
export type { MapStyle } from './MapControls'

// Feature demo components
export {
  FeatureDemoModal,
  FeatureCard,
  GpsDemo,
  LockDemo,
  RemoteStartDemo,
  PreCoolDemo,
  GeofenceDemo,
  SpeedAlertDemo,
  KillSwitchDemo,
  HonkDemo,
  MileageForensicsDemo,
  ProviderBadges
} from './feature-demos'

export type { FeatureCardConfig } from './feature-demos'
