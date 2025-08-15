// Live Data Types
export interface LiveTickerItem {
  id: string
  type: 'surge' | 'flight' | 'traffic' | 'weather'
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: Date
}

export interface FlightPrediction {
  flightNumber: string
  from: string
  scheduled: string
  delayProbability: number
  surgePrediction: number
  status: string
}

export interface TrafficRoute {
  route: string
  status: 'clear' | 'moderate' | 'heavy'
  delay: number
  alternative?: string
}

export interface SurgePrediction {
  time: string
  multiplier: number
  probability: number
}

export interface DriverPosition {
  id: string
  name: string
  terminal: number
  status: 'positioned' | 'enroute' | 'available'
  eta?: number
}

export interface GroupMember {
  id: string
  name: string
  flight: string
  arrival: string
  terminal: number
}

export interface PriceComparison {
  service: string
  price: string
  time: string
  available: boolean
}

export interface DynamicPrices {
  itwhip: number
  competitorMin: number
  competitorMax: number
  savings: number
}

// Component Props Types
export interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  handleGetAppClick: () => void
  handleSearchClick: () => void
}

export interface LiveTickerProps {
  items: LiveTickerItem[]
  currentIndex: number
  currentTime: Date
}

export interface HeroSectionProps {
  handleSearchClick: () => void
  flightsTracked: number
  totalSavings: number
  driversPositioned: DriverPosition[]
  timeUntilSurge: string
}

export interface CompareSectionProps {
  compareOptions: PriceComparison[]
}

export interface DriveSectionProps {
  handleSearchClick: () => void
}

export interface FlightIntelligenceSectionProps {
  flightPredictions: FlightPrediction[]
  trafficRoutes: TrafficRoute[]
  dynamicPrices: DynamicPrices
}

export interface SurgePredictionSectionProps {
  surgePredictions: SurgePrediction[]
}

export interface GroupCoordinationSectionProps {
  groupMembers: GroupMember[]
  handleSearchClick: () => void
}

export interface FooterProps {
  handleSearchClick: () => void
  handleGetAppClick: () => void
}

export interface ModalsProps {
  showAppModal: boolean
  setShowAppModal: (show: boolean) => void
  handleGetAppClick: () => void
}

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  handleGetAppClick: () => void
  handleSearchClick: () => void
}

// UI Component Types
export interface StatCardProps {
  value: string | number
  label: string
  color?: string
  icon?: React.ReactNode
}

export interface ServiceOptionProps {
  option: PriceComparison
  isHighlighted?: boolean
  onSelect?: () => void
}

export interface FlightCardProps {
  flight: FlightPrediction
  dynamicPrices?: DynamicPrices
}

export interface TrafficCardProps {
  route: TrafficRoute
}

export interface PredictionCardProps {
  prediction: SurgePrediction
}

export interface StepCardProps {
  step: string
  title: string
  description: string
  icon: React.ReactNode
  showConnector?: boolean
}

export interface PatternItemProps {
  icon: string
  title: string
  description: string
  color: string
}

export interface PhoneMockupProps {
  imageSrc: string
  altText: string
  rotation?: number
  zIndex?: number
  position?: {
    left?: string
    top?: string
  }
}

// Form & Input Types
export interface SearchPillProps {
  onClick: () => void
  placeholder?: string
  showCalendar?: boolean
}

export interface CTAButtonProps {
  text: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
}

// Navigation Types
export interface NavLink {
  label: string
  href: string
  badge?: string
  subItems?: NavLink[]
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

// State Types
export interface AppState {
  isLoading: boolean
  currentTime: Date
  isDarkMode: boolean
  isMobileMenuOpen: boolean
  showAppModal: boolean
  searchFocused: boolean
}

export interface LiveDataState {
  liveTickerItems: LiveTickerItem[]
  currentTickerIndex: number
  flightPredictions: FlightPrediction[]
  trafficRoutes: TrafficRoute[]
  surgePredictions: SurgePrediction[]
  driversPositioned: DriverPosition[]
  currentUberSurge: number
  nextSurgeTime: Date | null
  totalSavings: number
  flightsTracked: number
  dynamicPrices: DynamicPrices
  groupMembers: GroupMember[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FlightApiResponse {
  flights: FlightPrediction[]
  lastUpdated: string
}

export interface SurgeApiResponse {
  currentSurge: number
  predictions: SurgePrediction[]
  nextSurgeTime: string
}

export interface DriverApiResponse {
  available: DriverPosition[]
  total: number
  byTerminal: Record<number, number>
}

// Utility Types
export type ThemeMode = 'light' | 'dark' | 'system'

export type VehicleType = 'sedan' | 'suv' | 'minivan' | 'luxury'

export type TripStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export type PaymentMethod = 'card' | 'cash' | 'apple_pay' | 'google_pay'

// Event Types
export interface ThemeChangeEvent {
  theme: ThemeMode
  timestamp: Date
}

export interface SurgeUpdateEvent {
  oldValue: number
  newValue: number
  timestamp: Date
}

export interface FlightUpdateEvent {
  flightNumber: string
  updates: Partial<FlightPrediction>
  timestamp: Date
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Constants Types
export interface AppConfig {
  tickerRotationInterval: number
  surgeUpdateInterval: number
  statsUpdateInterval: number
  surgePredictionInterval: number
  defaultDistanceMiles: number
  driverMinimumFare: number
  platformFeePercentage: number
  savingsPercentage: number
}

export interface ColorScheme {
  surge: {
    critical: string
    warning: string
    info: string
  }
  traffic: {
    heavy: string
    moderate: string
    clear: string
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}