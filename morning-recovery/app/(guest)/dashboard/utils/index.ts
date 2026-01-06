// app/(guest)/dashboard/utils/index.ts
// Central export file for all utility functions and classes

// Geolocation and context detection
export { 
    default as GeofenceDetector,
    type GeofenceConfig,
    type LocationData,
    type GeofenceResult 
  } from './GeofenceDetector'
  
  // Hotel inventory management
  export { 
    default as HotelInventoryManager,
    type InventoryItem,
    type InventoryCategory,
    type InventoryUpdate 
  } from './HotelInventoryManager'
  
  // Advanced orchestration engine
  export { 
    default as OrchestrationEngine,
    type OrchestrationConfig,
    type ServiceOrchestration,
    type OrchestrationResult 
  } from './OrchestrationEngine'
  
  // Reservation management
  export { 
    default as ReservationManager,
    type Reservation,
    type ReservationStatus,
    type BookingRequest,
    type ReservationUpdate 
  } from './ReservationManager'
  
  // Central state management
  export { 
    default as StateManager,
    type AppState,
    type StateUpdate,
    type StateSubscriber 
  } from './StateManager'
  
  // Re-export commonly used utility functions
  export {
    // From OrchestrationEngine
    calculateOptimalRoute,
    bundleServices,
    validateServiceAvailability,
    estimateServiceTime,
    
    // From ReservationManager  
    validateReservation,
    calculateCancellationFee,
    checkAvailability,
    generateConfirmationCode,
    
    // From StateManager
    createInitialState,
    persistState,
    clearPersistedState,
    subscribeToState,
    
    // From GeofenceDetector
    getCurrentLocation,
    calculateDistance,
    isWithinRadius,
    detectNearbyHotels,
    
    // From HotelInventoryManager
    checkInventory,
    updateInventory,
    getInventoryByCategory,
    calculateInventoryValue
  } from './OrchestrationEngine'