// Script to add partner portal namespaces to all 3 locale JSON files
// Run: node scripts/add-partner-namespaces.mjs

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ============================
// English namespace definitions
// ============================

const PartnerNav = {
  // Navigation items
  dashboard: "Dashboard",
  fleet: "Fleet",
  managedVehicles: "Managed Vehicles",
  bookings: "Bookings",
  newBooking: "New Booking",
  customers: "Customers",
  calendar: "Calendar",
  reviews: "Reviews",
  messages: "Messages",
  maintenance: "Maintenance",
  claims: "Claims",
  insurance: "Insurance",
  tracking: "Tracking",
  revenue: "Revenue",
  analytics: "Analytics",
  landingPage: "Landing Page",
  discounts: "Discounts",
  settings: "Settings",
  // Loading
  loadingPartnerPortal: "Loading partner portal...",
  // Tier labels
  tierDiamond: "Diamond",
  tierPlatinum: "Platinum",
  tierGold: "Gold",
  tierStandard: "Standard",
  // Role labels
  roleFleetPartner: "Fleet Partner",
  roleHostManager: "Host & Manager",
  roleFleetManager: "Fleet Manager",
  roleVehicleOwner: "Vehicle Owner",
  roleHost: "Host",
  rolePartner: "Partner",
  // Sidebar stats
  myVehicles: "My Vehicles",
  managed: "Managed",
  vehicles: "Vehicles",
  // Dark mode
  darkMode: "Dark Mode",
  lightMode: "Light Mode",
  // Header
  logout: "Logout",
  live: "Live",
  draft: "Draft",
  publishTooltip: "Complete requirements in Landing Page settings to publish",
}

const PartnerDashboard = {
  // Common
  loadingDashboard: "Loading dashboard...",
  errorLoadingDashboard: "Error Loading Dashboard",
  tryAgain: "Try Again",
  failedToLoadDashboard: "Failed to load dashboard data",
  refresh: "Refresh",
  viewAll: "View All",
  recentBookings: "Recent Bookings",
  viewOnly: "View Only",
  noRecentBookings: "No recent bookings for your vehicles",

  // Fleet Manager View
  welcomeBack: "Welcome back",
  fleetManager: "Fleet Manager",
  manageVehiclesGrow: "Manage vehicles and grow your fleet",
  myAccount: "My Account",
  managedVehiclesLabel: "Managed Vehicles",
  activeBookings: "Active Bookings",
  thisMonth: "This Month",
  rating: "Rating",
  quickActions: "Quick Actions",
  inviteCarOwner: "Invite Car Owner",
  growManagedFleet: "Grow your managed fleet",
  addOwnVehicle: "Add Own Vehicle",
  listYourOwnCar: "List your own car",
  accountSettings: "Account Settings",
  profileBankDocuments: "Profile, bank, documents",

  // Vehicle Owner View
  myInvestments: "My Investments",
  vehicleOwner: "Vehicle Owner",
  trackPassiveIncome: "Track your passive income from managed vehicles",
  myVehiclesLabel: "My Vehicles",
  activelyManaged: "{count} actively managed",
  totalEarnings: "Total Earnings",
  yourOwnersShare: "Your owner's share",
  earnedSoFar: "Earned so far",
  pending: "Pending",
  inProgressBookings: "In progress bookings",
  avgOwnerShare: "Your average owner share is {percent}% of revenue",
  platformTakes: "Platform takes 10%, remaining {percent}% is your share after manager's cut",
  noManagedVehiclesYet: "No managed vehicles yet",
  noManagedVehiclesDesc: "When you invite a fleet manager to manage your vehicles, they'll appear here.",
  addAVehicle: "Add a Vehicle",
  managedBy: "Managed by",
  yourShare: "Your Share",
  needHelpTitle: "Need help managing your investments?",
  needHelpDesc: "As a vehicle owner, your manager handles day-to-day operations. If you have questions about your earnings or want to change your management agreement, contact your manager or our support team.",
  viewFullEarnings: "View Full Earnings",
  contactSupport: "Contact Support",

  // Fleet Partner View
  dashboardTitle: "Dashboard",
  welcomeBackFleet: "Welcome back{name}! Here's your fleet overview.",
  fleetSize: "Fleet Size",
  active: "active",
  totalBookings: "Total Bookings",
  activeNow: "{count} active now",
  netRevenue: "Net Revenue",
  vsLastMonth: "vs last month",
  averageRating: "Average Rating",
  reviewsCount: "{count} reviews",
  utilizationRate: "Utilization Rate",
  completedThisMonth: "Completed This Month",
  commissionRate: "Commission Rate",
  revenueOverview: "Revenue Overview",
  viewDetails: "View Details",
  fleetStatus: "Fleet Status",
  manageFleet: "Manage Fleet",

  // Status labels
  statusCompleted: "COMPLETED",
  statusActive: "ACTIVE",
}

const PartnerFleet = {
  // Header
  fleetManagement: "Fleet Management",
  manageVehiclesTrack: "Manage your vehicles and track their performance",
  addVehicle: "Add Vehicle",

  // Stats
  total: "Total",
  active: "Active",
  available: "Available",
  booked: "Booked",
  maintenance: "Maintenance",
  inactive: "Inactive",

  // Status labels
  statusAvailable: "Available",
  statusBooked: "Booked",
  statusMaintenance: "Maintenance",
  statusInactive: "Inactive",
  statusUnknown: "Unknown",

  // Search
  searchPlaceholder: "Search by make, model, or plate...",
  refresh: "Refresh",
  calendar: "Calendar",

  // Table headers
  vehicle: "Vehicle",
  type: "Type",
  status: "Status",
  rate: "Rate",
  trips: "Trips",
  revenue: "Revenue",
  ratingCol: "Rating",
  actions: "Actions",

  // Vehicle type
  rideshare: "Rideshare",
  rental: "Rental",
  clickToSwitch: "Click to switch type",

  // Rate format
  perDay: "${rate}/day",

  // Actions
  viewDetails: "View Details",
  editVehicle: "Edit Vehicle",
  deactivate: "Deactivate",
  activate: "Activate",
  setMaintenance: "Set Maintenance",

  // Empty states
  noVehiclesYet: "No vehicles in your fleet yet",
  noVehiclesMatch: "No vehicles match your filters",
  addFirstVehicle: "Add Your First Vehicle",
}

const PartnerBookings = {
  // Header
  bookingsTitle: "Bookings",
  manageReservations: "Manage reservations across your fleet",
  refresh: "Refresh",
  export: "Export",

  // Stats/Filters
  total: "Total",
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",

  // Status labels
  statusConfirmed: "Confirmed",
  statusPending: "Pending",
  statusActive: "Active",
  statusCompleted: "Completed",
  statusCancelled: "Cancelled",

  // Search and filters
  searchPlaceholder: "Search by guest, vehicle, or booking ID...",
  allTime: "All Time",
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",

  // Table headers
  guest: "Guest",
  vehicle: "Vehicle",
  dates: "Dates",
  status: "Status",
  amount: "Amount",
  actions: "Actions",

  // Table data
  daysCount: "{count} day{count, plural, one {} other {s}}",
  view: "View",

  // Empty state
  noBookingsYet: "No bookings yet",
  noBookingsMatch: "No bookings match your filters",
  bookingsWillAppear: "Bookings will appear here when guests reserve your vehicles",

  // Summary
  showingOf: "Showing {filtered} of {total} bookings",
  totalRevenue: "Total Revenue:",
}

// ============================
// Spanish translations
// ============================

const PartnerNav_es = {
  dashboard: "Panel",
  fleet: "Flota",
  managedVehicles: "Vehículos Gestionados",
  bookings: "Reservas",
  newBooking: "Nueva Reserva",
  customers: "Clientes",
  calendar: "Calendario",
  reviews: "Reseñas",
  messages: "Mensajes",
  maintenance: "Mantenimiento",
  claims: "Reclamaciones",
  insurance: "Seguros",
  tracking: "Seguimiento",
  revenue: "Ingresos",
  analytics: "Análisis",
  landingPage: "Página de Inicio",
  discounts: "Descuentos",
  settings: "Configuración",
  loadingPartnerPortal: "Cargando portal de socio...",
  tierDiamond: "Diamante",
  tierPlatinum: "Platino",
  tierGold: "Oro",
  tierStandard: "Estándar",
  roleFleetPartner: "Socio de Flota",
  roleHostManager: "Anfitrión y Gestor",
  roleFleetManager: "Gestor de Flota",
  roleVehicleOwner: "Propietario de Vehículo",
  roleHost: "Anfitrión",
  rolePartner: "Socio",
  myVehicles: "Mis Vehículos",
  managed: "Gestionados",
  vehicles: "Vehículos",
  darkMode: "Modo Oscuro",
  lightMode: "Modo Claro",
  logout: "Cerrar Sesión",
  live: "Activo",
  draft: "Borrador",
  publishTooltip: "Complete los requisitos en la configuración de la Página de Inicio para publicar",
}

const PartnerDashboard_es = {
  loadingDashboard: "Cargando panel...",
  errorLoadingDashboard: "Error al Cargar el Panel",
  tryAgain: "Intentar de Nuevo",
  failedToLoadDashboard: "Error al cargar los datos del panel",
  refresh: "Actualizar",
  viewAll: "Ver Todo",
  recentBookings: "Reservas Recientes",
  viewOnly: "Solo Lectura",
  noRecentBookings: "No hay reservas recientes para sus vehículos",
  welcomeBack: "Bienvenido de nuevo",
  fleetManager: "Gestor de Flota",
  manageVehiclesGrow: "Gestiona vehículos y haz crecer tu flota",
  myAccount: "Mi Cuenta",
  managedVehiclesLabel: "Vehículos Gestionados",
  activeBookings: "Reservas Activas",
  thisMonth: "Este Mes",
  rating: "Calificación",
  quickActions: "Acciones Rápidas",
  inviteCarOwner: "Invitar Propietario",
  growManagedFleet: "Haz crecer tu flota gestionada",
  addOwnVehicle: "Añadir Vehículo Propio",
  listYourOwnCar: "Publica tu propio auto",
  accountSettings: "Configuración de Cuenta",
  profileBankDocuments: "Perfil, banco, documentos",
  myInvestments: "Mis Inversiones",
  vehicleOwner: "Propietario de Vehículo",
  trackPassiveIncome: "Rastrea tus ingresos pasivos de vehículos gestionados",
  myVehiclesLabel: "Mis Vehículos",
  activelyManaged: "{count} gestionados activamente",
  totalEarnings: "Ganancias Totales",
  yourOwnersShare: "Tu parte como propietario",
  earnedSoFar: "Ganado hasta ahora",
  pending: "Pendiente",
  inProgressBookings: "Reservas en curso",
  avgOwnerShare: "Tu participación promedio como propietario es del {percent}% de los ingresos",
  platformTakes: "La plataforma toma el 10%, el {percent}% restante es tu parte después de la comisión del gestor",
  noManagedVehiclesYet: "Aún no hay vehículos gestionados",
  noManagedVehiclesDesc: "Cuando invites a un gestor de flota a administrar tus vehículos, aparecerán aquí.",
  addAVehicle: "Añadir un Vehículo",
  managedBy: "Gestionado por",
  yourShare: "Tu Parte",
  needHelpTitle: "¿Necesitas ayuda gestionando tus inversiones?",
  needHelpDesc: "Como propietario de vehículo, tu gestor maneja las operaciones diarias. Si tienes preguntas sobre tus ganancias o quieres cambiar tu acuerdo de gestión, contacta a tu gestor o a nuestro equipo de soporte.",
  viewFullEarnings: "Ver Ganancias Completas",
  contactSupport: "Contactar Soporte",
  dashboardTitle: "Panel",
  welcomeBackFleet: "¡Bienvenido{name}! Aquí tienes tu resumen de flota.",
  fleetSize: "Tamaño de Flota",
  active: "activos",
  totalBookings: "Total de Reservas",
  activeNow: "{count} activas ahora",
  netRevenue: "Ingresos Netos",
  vsLastMonth: "vs mes anterior",
  averageRating: "Calificación Promedio",
  reviewsCount: "{count} reseñas",
  utilizationRate: "Tasa de Utilización",
  completedThisMonth: "Completadas Este Mes",
  commissionRate: "Tasa de Comisión",
  revenueOverview: "Resumen de Ingresos",
  viewDetails: "Ver Detalles",
  fleetStatus: "Estado de la Flota",
  manageFleet: "Gestionar Flota",
  statusCompleted: "COMPLETADO",
  statusActive: "ACTIVO",
}

const PartnerFleet_es = {
  fleetManagement: "Gestión de Flota",
  manageVehiclesTrack: "Gestiona tus vehículos y rastrea su rendimiento",
  addVehicle: "Añadir Vehículo",
  total: "Total",
  active: "Activos",
  available: "Disponibles",
  booked: "Reservados",
  maintenance: "Mantenimiento",
  inactive: "Inactivos",
  statusAvailable: "Disponible",
  statusBooked: "Reservado",
  statusMaintenance: "Mantenimiento",
  statusInactive: "Inactivo",
  statusUnknown: "Desconocido",
  searchPlaceholder: "Buscar por marca, modelo o placa...",
  refresh: "Actualizar",
  calendar: "Calendario",
  vehicle: "Vehículo",
  type: "Tipo",
  status: "Estado",
  rate: "Tarifa",
  trips: "Viajes",
  revenue: "Ingresos",
  ratingCol: "Calificación",
  actions: "Acciones",
  rideshare: "Viaje Compartido",
  rental: "Alquiler",
  clickToSwitch: "Clic para cambiar tipo",
  perDay: "${rate}/día",
  viewDetails: "Ver Detalles",
  editVehicle: "Editar Vehículo",
  deactivate: "Desactivar",
  activate: "Activar",
  setMaintenance: "Establecer Mantenimiento",
  noVehiclesYet: "Aún no hay vehículos en tu flota",
  noVehiclesMatch: "Ningún vehículo coincide con los filtros",
  addFirstVehicle: "Añade Tu Primer Vehículo",
}

const PartnerBookings_es = {
  bookingsTitle: "Reservas",
  manageReservations: "Gestiona las reservas de tu flota",
  refresh: "Actualizar",
  export: "Exportar",
  total: "Total",
  pending: "Pendientes",
  confirmed: "Confirmadas",
  active: "Activas",
  completed: "Completadas",
  cancelled: "Canceladas",
  statusConfirmed: "Confirmada",
  statusPending: "Pendiente",
  statusActive: "Activa",
  statusCompleted: "Completada",
  statusCancelled: "Cancelada",
  searchPlaceholder: "Buscar por huésped, vehículo o ID de reserva...",
  allTime: "Todo el Tiempo",
  today: "Hoy",
  thisWeek: "Esta Semana",
  thisMonth: "Este Mes",
  guest: "Huésped",
  vehicle: "Vehículo",
  dates: "Fechas",
  status: "Estado",
  amount: "Monto",
  actions: "Acciones",
  daysCount: "{count} día{count, plural, one {} other {s}}",
  view: "Ver",
  noBookingsYet: "Aún no hay reservas",
  noBookingsMatch: "Ninguna reserva coincide con los filtros",
  bookingsWillAppear: "Las reservas aparecerán aquí cuando los huéspedes reserven tus vehículos",
  showingOf: "Mostrando {filtered} de {total} reservas",
  totalRevenue: "Ingresos Totales:",
}

// ============================
// French translations
// ============================

const PartnerNav_fr = {
  dashboard: "Tableau de Bord",
  fleet: "Flotte",
  managedVehicles: "Véhicules Gérés",
  bookings: "Réservations",
  newBooking: "Nouvelle Réservation",
  customers: "Clients",
  calendar: "Calendrier",
  reviews: "Avis",
  messages: "Messages",
  maintenance: "Maintenance",
  claims: "Réclamations",
  insurance: "Assurances",
  tracking: "Suivi",
  revenue: "Revenus",
  analytics: "Analyses",
  landingPage: "Page d'Accueil",
  discounts: "Réductions",
  settings: "Paramètres",
  loadingPartnerPortal: "Chargement du portail partenaire...",
  tierDiamond: "Diamant",
  tierPlatinum: "Platine",
  tierGold: "Or",
  tierStandard: "Standard",
  roleFleetPartner: "Partenaire de Flotte",
  roleHostManager: "Hôte et Gestionnaire",
  roleFleetManager: "Gestionnaire de Flotte",
  roleVehicleOwner: "Propriétaire de Véhicule",
  roleHost: "Hôte",
  rolePartner: "Partenaire",
  myVehicles: "Mes Véhicules",
  managed: "Gérés",
  vehicles: "Véhicules",
  darkMode: "Mode Sombre",
  lightMode: "Mode Clair",
  logout: "Déconnexion",
  live: "En ligne",
  draft: "Brouillon",
  publishTooltip: "Complétez les exigences dans les paramètres de la Page d'Accueil pour publier",
}

const PartnerDashboard_fr = {
  loadingDashboard: "Chargement du tableau de bord...",
  errorLoadingDashboard: "Erreur de Chargement du Tableau de Bord",
  tryAgain: "Réessayer",
  failedToLoadDashboard: "Échec du chargement des données du tableau de bord",
  refresh: "Actualiser",
  viewAll: "Tout Voir",
  recentBookings: "Réservations Récentes",
  viewOnly: "Lecture Seule",
  noRecentBookings: "Aucune réservation récente pour vos véhicules",
  welcomeBack: "Bon retour",
  fleetManager: "Gestionnaire de Flotte",
  manageVehiclesGrow: "Gérez les véhicules et développez votre flotte",
  myAccount: "Mon Compte",
  managedVehiclesLabel: "Véhicules Gérés",
  activeBookings: "Réservations Actives",
  thisMonth: "Ce Mois",
  rating: "Note",
  quickActions: "Actions Rapides",
  inviteCarOwner: "Inviter un Propriétaire",
  growManagedFleet: "Développez votre flotte gérée",
  addOwnVehicle: "Ajouter un Véhicule Personnel",
  listYourOwnCar: "Publiez votre propre voiture",
  accountSettings: "Paramètres du Compte",
  profileBankDocuments: "Profil, banque, documents",
  myInvestments: "Mes Investissements",
  vehicleOwner: "Propriétaire de Véhicule",
  trackPassiveIncome: "Suivez vos revenus passifs des véhicules gérés",
  myVehiclesLabel: "Mes Véhicules",
  activelyManaged: "{count} gérés activement",
  totalEarnings: "Gains Totaux",
  yourOwnersShare: "Votre part de propriétaire",
  earnedSoFar: "Gagné jusqu'ici",
  pending: "En Attente",
  inProgressBookings: "Réservations en cours",
  avgOwnerShare: "Votre part moyenne de propriétaire est de {percent}% des revenus",
  platformTakes: "La plateforme prend 10%, les {percent}% restants sont votre part après la commission du gestionnaire",
  noManagedVehiclesYet: "Pas encore de véhicules gérés",
  noManagedVehiclesDesc: "Lorsque vous inviterez un gestionnaire de flotte à gérer vos véhicules, ils apparaîtront ici.",
  addAVehicle: "Ajouter un Véhicule",
  managedBy: "Géré par",
  yourShare: "Votre Part",
  needHelpTitle: "Besoin d'aide pour gérer vos investissements ?",
  needHelpDesc: "En tant que propriétaire de véhicule, votre gestionnaire gère les opérations quotidiennes. Si vous avez des questions sur vos gains ou souhaitez modifier votre accord de gestion, contactez votre gestionnaire ou notre équipe d'assistance.",
  viewFullEarnings: "Voir les Gains Complets",
  contactSupport: "Contacter le Support",
  dashboardTitle: "Tableau de Bord",
  welcomeBackFleet: "Bienvenue{name} ! Voici l'aperçu de votre flotte.",
  fleetSize: "Taille de la Flotte",
  active: "actifs",
  totalBookings: "Total des Réservations",
  activeNow: "{count} actives maintenant",
  netRevenue: "Revenus Nets",
  vsLastMonth: "vs mois dernier",
  averageRating: "Note Moyenne",
  reviewsCount: "{count} avis",
  utilizationRate: "Taux d'Utilisation",
  completedThisMonth: "Complétées ce Mois",
  commissionRate: "Taux de Commission",
  revenueOverview: "Aperçu des Revenus",
  viewDetails: "Voir les Détails",
  fleetStatus: "État de la Flotte",
  manageFleet: "Gérer la Flotte",
  statusCompleted: "TERMINÉ",
  statusActive: "ACTIF",
}

const PartnerFleet_fr = {
  fleetManagement: "Gestion de la Flotte",
  manageVehiclesTrack: "Gérez vos véhicules et suivez leurs performances",
  addVehicle: "Ajouter un Véhicule",
  total: "Total",
  active: "Actifs",
  available: "Disponibles",
  booked: "Réservés",
  maintenance: "Maintenance",
  inactive: "Inactifs",
  statusAvailable: "Disponible",
  statusBooked: "Réservé",
  statusMaintenance: "Maintenance",
  statusInactive: "Inactif",
  statusUnknown: "Inconnu",
  searchPlaceholder: "Rechercher par marque, modèle ou plaque...",
  refresh: "Actualiser",
  calendar: "Calendrier",
  vehicle: "Véhicule",
  type: "Type",
  status: "Statut",
  rate: "Tarif",
  trips: "Trajets",
  revenue: "Revenus",
  ratingCol: "Note",
  actions: "Actions",
  rideshare: "Covoiturage",
  rental: "Location",
  clickToSwitch: "Cliquer pour changer le type",
  perDay: "${rate}/jour",
  viewDetails: "Voir les Détails",
  editVehicle: "Modifier le Véhicule",
  deactivate: "Désactiver",
  activate: "Activer",
  setMaintenance: "Mettre en Maintenance",
  noVehiclesYet: "Pas encore de véhicules dans votre flotte",
  noVehiclesMatch: "Aucun véhicule ne correspond aux filtres",
  addFirstVehicle: "Ajoutez Votre Premier Véhicule",
}

const PartnerBookings_fr = {
  bookingsTitle: "Réservations",
  manageReservations: "Gérez les réservations de votre flotte",
  refresh: "Actualiser",
  export: "Exporter",
  total: "Total",
  pending: "En Attente",
  confirmed: "Confirmées",
  active: "Actives",
  completed: "Terminées",
  cancelled: "Annulées",
  statusConfirmed: "Confirmée",
  statusPending: "En Attente",
  statusActive: "Active",
  statusCompleted: "Terminée",
  statusCancelled: "Annulée",
  searchPlaceholder: "Rechercher par client, véhicule ou ID de réservation...",
  allTime: "Tout le Temps",
  today: "Aujourd'hui",
  thisWeek: "Cette Semaine",
  thisMonth: "Ce Mois",
  guest: "Client",
  vehicle: "Véhicule",
  dates: "Dates",
  status: "Statut",
  amount: "Montant",
  actions: "Actions",
  daysCount: "{count} jour{count, plural, one {} other {s}}",
  view: "Voir",
  noBookingsYet: "Pas encore de réservations",
  noBookingsMatch: "Aucune réservation ne correspond aux filtres",
  bookingsWillAppear: "Les réservations apparaîtront ici lorsque les clients réserveront vos véhicules",
  showingOf: "Affichage de {filtered} sur {total} réservations",
  totalRevenue: "Revenus Totaux :",
}

// ============================
// Apply to JSON files
// ============================

const localeData = {
  en: {
    PartnerNav,
    PartnerDashboard,
    PartnerFleet,
    PartnerBookings,
  },
  es: {
    PartnerNav: PartnerNav_es,
    PartnerDashboard: PartnerDashboard_es,
    PartnerFleet: PartnerFleet_es,
    PartnerBookings: PartnerBookings_es,
  },
  fr: {
    PartnerNav: PartnerNav_fr,
    PartnerDashboard: PartnerDashboard_fr,
    PartnerFleet: PartnerFleet_fr,
    PartnerBookings: PartnerBookings_fr,
  }
}

for (const [locale, namespaces] of Object.entries(localeData)) {
  const filePath = join(root, 'messages', `${locale}.json`)
  const existing = JSON.parse(readFileSync(filePath, 'utf-8'))

  for (const [ns, translations] of Object.entries(namespaces)) {
    if (existing[ns]) {
      console.log(`  WARNING: ${locale}.json already has "${ns}" — merging`)
      existing[ns] = { ...existing[ns], ...translations }
    } else {
      existing[ns] = translations
    }
  }

  writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n')
  console.log(`Updated ${locale}.json — now has ${Object.keys(existing).length} namespaces`)
}

console.log('\nDone! Added PartnerNav, PartnerDashboard, PartnerFleet, PartnerBookings to all 3 locale files.')
