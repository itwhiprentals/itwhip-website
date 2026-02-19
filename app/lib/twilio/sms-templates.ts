// app/lib/twilio/sms-templates.ts
// SMS message templates for all trigger types in en/es/fr
// Keep messages concise: Spanish/French use UCS-2 encoding (accents), 70 chars/segment vs 160 for ASCII
// Target: under 280 chars total including Choe footer (~2 segments)

type Locale = 'en' | 'es' | 'fr'

// Choe promotional footer appended to every SMS
export const CHOE_FOOTER: Record<Locale, string> = {
  en: '\n\nNeed help? Chat with Choe 24/7: itwhip.com/choe',
  es: '\n\nAyuda? Chatea con Choe 24/7: itwhip.com/choe',
  fr: '\n\nBesoin d\'aide? Chattez avec Choe: itwhip.com/choe',
}

// ─── Booking Confirmed (guest) ─────────────────────────────────────

export function bookingConfirmedGuest(data: {
  carName: string
  dates: string
  hostName: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Your ${data.carName} is confirmed for ${data.dates}. Host: ${data.hostName}. Details: itwhip.com/trip/${data.bookingCode}`,
    es: `Tu ${data.carName} esta confirmado para ${data.dates}. Anfitrion: ${data.hostName}. Detalles: itwhip.com/trip/${data.bookingCode}`,
    fr: `Votre ${data.carName} est confirme pour ${data.dates}. Hote: ${data.hostName}. Details: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Booking Confirmed (host) ──────────────────────────────────────

export function bookingConfirmedHost(data: {
  guestName: string
  carName: string
  dates: string
  bookingCode: string
}): string {
  // Hosts always get English
  return `New booking: ${data.guestName} reserved your ${data.carName} for ${data.dates}. Code: ${data.bookingCode}. View: itwhip.com/partner/bookings` + CHOE_FOOTER.en
}

// ─── Trip Started (guest) ──────────────────────────────────────────

export function tripStartedGuest(data: {
  carName: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Trip started! Your ${data.carName} rental is active. Emergency? Call (855) 703-0806. Trip: itwhip.com/trip/${data.bookingCode}`,
    es: `Viaje iniciado! Tu renta del ${data.carName} esta activa. Emergencia? Llama al (855) 703-0806. Viaje: itwhip.com/trip/${data.bookingCode}`,
    fr: `Trajet demarre! Votre location du ${data.carName} est active. Urgence? Appelez le (855) 703-0806. Trajet: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Trip Started (host) ───────────────────────────────────────────

export function tripStartedHost(data: {
  guestName: string
  carName: string
  bookingCode: string
}): string {
  return `Trip started: ${data.guestName} is now driving your ${data.carName}. Code: ${data.bookingCode}` + CHOE_FOOTER.en
}

// ─── Trip Ended (guest) ────────────────────────────────────────────

export function tripEndedGuest(data: {
  carName: string
  totalAmount: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Trip complete! ${data.carName} total: $${data.totalAmount}. Leave a review: itwhip.com/trip/${data.bookingCode}`,
    es: `Viaje completado! ${data.carName} total: $${data.totalAmount}. Deja una resena: itwhip.com/trip/${data.bookingCode}`,
    fr: `Trajet termine! ${data.carName} total: $${data.totalAmount}. Laissez un avis: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Trip Ended (host) ─────────────────────────────────────────────

export function tripEndedHost(data: {
  guestName: string
  carName: string
  bookingCode: string
}): string {
  return `Trip ended: ${data.guestName} returned your ${data.carName}. You have 24h to review. View: itwhip.com/partner/bookings` + CHOE_FOOTER.en
}

// ─── Guest Approaching (host) ──────────────────────────────────────

export function guestApproachingHost(data: {
  guestName: string
  etaMinutes: number
  carName: string
}): string {
  return `${data.guestName} is ~${data.etaMinutes} min away to pick up your ${data.carName}. Get ready for handoff!` + CHOE_FOOTER.en
}

// ─── Booking Cancelled (guest) ─────────────────────────────────────

export function bookingCancelledGuest(data: {
  carName: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Booking ${data.bookingCode} for ${data.carName} has been cancelled. Questions? Reply to this text or visit itwhip.com`,
    es: `Reserva ${data.bookingCode} para ${data.carName} fue cancelada. Preguntas? Responde a este texto o visita itwhip.com`,
    fr: `Reservation ${data.bookingCode} pour ${data.carName} a ete annulee. Questions? Repondez ou visitez itwhip.com`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Booking Cancelled (host) ──────────────────────────────────────

export function bookingCancelledHost(data: {
  guestName: string
  carName: string
  bookingCode: string
}): string {
  return `Booking cancelled: ${data.guestName} cancelled their ${data.carName} reservation (${data.bookingCode}). View: itwhip.com/partner/bookings` + CHOE_FOOTER.en
}

// ─── Claim Filed (guest) ───────────────────────────────────────────

export function claimFiledGuest(data: {
  bookingCode: string
  claimType: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `A ${data.claimType.toLowerCase()} claim has been filed for booking ${data.bookingCode}. Details: itwhip.com/trip/${data.bookingCode}`,
    es: `Se presento un reclamo de ${data.claimType.toLowerCase()} para la reserva ${data.bookingCode}. Detalles: itwhip.com/trip/${data.bookingCode}`,
    fr: `Une reclamation ${data.claimType.toLowerCase()} a ete deposee pour la reservation ${data.bookingCode}. Details: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Missed Message (recipient) ────────────────────────────────────

export function missedMessage(data: {
  senderName: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `${data.senderName} sent you a message about your ItWhip rental. View: itwhip.com/trip/${data.bookingCode}`,
    es: `${data.senderName} te envio un mensaje sobre tu renta ItWhip. Ver: itwhip.com/trip/${data.bookingCode}`,
    fr: `${data.senderName} vous a envoye un message concernant votre location ItWhip. Voir: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale] + CHOE_FOOTER[locale]
}

// ─── Inbound SMS Auto-Reply ────────────────────────────────────────

export function inboundAutoReplyWithBooking(data: {
  recipientType: 'host' | 'guest'
  bookingCode: string
}, locale: Locale = 'en'): string {
  const other = data.recipientType === 'host' ? 'guest' : 'host'
  const templates: Record<Locale, string> = {
    en: `Message delivered to your ${other}. View conversation: itwhip.com/trip/${data.bookingCode}`,
    es: `Mensaje entregado a tu ${other === 'host' ? 'anfitrion' : 'huesped'}. Ver conversacion: itwhip.com/trip/${data.bookingCode}`,
    fr: `Message transmis a votre ${other === 'host' ? 'hote' : 'locataire'}. Voir: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale]
}

export function inboundAutoReplyNoBooking(locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: 'Thanks for texting ItWhip! For bookings, visit itwhip.com or chat with Choe: itwhip.com/choe',
    es: 'Gracias por escribir a ItWhip! Para reservas, visita itwhip.com o habla con Choe: itwhip.com/choe',
    fr: 'Merci de contacter ItWhip! Pour reserver, visitez itwhip.com ou chattez avec Choe: itwhip.com/choe',
  }
  return templates[locale]
}

// ─── Emergency SMS (sent during IVR) ──────────────────────────────

export function emergencyRoadsideInfo(data: {
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `ItWhip Emergency Guide - Booking ${data.bookingCode}:\n1. If danger, call 911\n2. Move to safe location\n3. Take photos of any damage\n4. Contact your host via the app\nFull guide: itwhip.com/support/roadside\nSupport: (855) 703-0806`,
    es: `Guia de Emergencia ItWhip - Reserva ${data.bookingCode}:\n1. Si hay peligro, llama al 911\n2. Ve a un lugar seguro\n3. Toma fotos de cualquier dano\n4. Contacta a tu anfitrion por la app\nGuia completa: itwhip.com/es/support/roadside\nSoporte: (855) 703-0806`,
    fr: `Guide d'urgence ItWhip - Reservation ${data.bookingCode}:\n1. En cas de danger, appelez le 911\n2. Placez-vous en securite\n3. Prenez des photos des dommages\n4. Contactez votre hote via l'app\nGuide complet: itwhip.com/fr/support/roadside\nSupport: (855) 703-0806`,
  }
  return templates[locale]
}

// ─── IVR: About ItWhip (visitor signup link) ────────────────────

export function ivrAboutItWhip(locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Welcome to ItWhip! Phoenix's car rental marketplace.\n\nRent a car: itwhip.com/rentals/search\nList your car: itwhip.com/partner\nChat with Choe (AI): itwhip.com/choe`,
    es: `Bienvenido a ItWhip! El mercado de renta de autos de Phoenix.\n\nRenta un auto: itwhip.com/es/rentals/search\nPublica tu auto: itwhip.com/partner\nChatea con Choe (IA): itwhip.com/es/choe`,
    fr: `Bienvenue sur ItWhip! Le marche de location de voitures de Phoenix.\n\nLouez une voiture: itwhip.com/fr/rentals/search\nInscrivez votre voiture: itwhip.com/partner\nParlez avec Choe (IA): itwhip.com/fr/choe`,
  }
  return templates[locale]
}

// ─── IVR: Insurance Info Link ───────────────────────────────────

export function ivrInsuranceInfo(locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `ItWhip Insurance Guide:\n- Basic: 40% coverage\n- Standard: 75% coverage\n- Premium: 90% coverage\nFull details: itwhip.com/support/insurance-guide`,
    es: `Guia de Seguros ItWhip:\n- Basico: 40% cobertura\n- Estandar: 75% cobertura\n- Premium: 90% cobertura\nDetalles: itwhip.com/es/support/insurance-guide`,
    fr: `Guide Assurance ItWhip:\n- Basique: 40% couverture\n- Standard: 75% couverture\n- Premium: 90% couverture\nDetails: itwhip.com/fr/support/insurance-guide`,
  }
  return templates[locale]
}

// ─── IVR: Report Damage Link ────────────────────────────────────

export function ivrReportDamage(locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Report vehicle damage on ItWhip:\n1. Log into your account\n2. Go to your trip page\n3. Use the "Report Issue" button\n\nThis lets you upload photos & docs.\nitwhip.com`,
    es: `Reporta danos al vehiculo en ItWhip:\n1. Inicia sesion en tu cuenta\n2. Ve a tu pagina de viaje\n3. Usa el boton "Reportar Problema"\n\nEsto te permite subir fotos y documentos.\nitwhip.com`,
    fr: `Signalez des dommages sur ItWhip:\n1. Connectez-vous a votre compte\n2. Allez sur votre page de trajet\n3. Utilisez le bouton "Signaler un probleme"\n\nCela vous permet d'envoyer photos et documents.\nitwhip.com`,
  }
  return templates[locale]
}

// ─── IVR: Pickup Details ────────────────────────────────────────

export function ivrPickupDetails(data: {
  address: string
  date: string
  time: string
  bookingCode: string
}, locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `Your ItWhip Pickup Details:\nDate: ${data.date}\nTime: ${data.time}\nLocation: ${data.address}\n\nTrip page: itwhip.com/trip/${data.bookingCode}`,
    es: `Detalles de tu Recogida ItWhip:\nFecha: ${data.date}\nHora: ${data.time}\nUbicacion: ${data.address}\n\nPagina del viaje: itwhip.com/trip/${data.bookingCode}`,
    fr: `Details de Prise en Charge ItWhip:\nDate: ${data.date}\nHeure: ${data.time}\nLieu: ${data.address}\n\nPage du trajet: itwhip.com/trip/${data.bookingCode}`,
  }
  return templates[locale]
}

// ─── Vehicle Listing Issues (host) ────────────────────────────────

export function vehicleIssuesHost(data: {
  carName: string
  issueCount: number
  vehicleId: string
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
  return `ItWhip: Your ${data.carName} has ${data.issueCount} listing issue${data.issueCount !== 1 ? 's' : ''} preventing it from being listed. Check your email for details and fix them here: ${baseUrl}/partner/fleet/${data.vehicleId}`
}

// ─── IVR: Roadside Assistance (no booking code) ────────────────

export function ivrRoadsideGeneral(locale: Locale = 'en'): string {
  const templates: Record<Locale, string> = {
    en: `ItWhip Roadside Assistance:\n1. If in danger, call 911\n2. Move to a safe location\n3. Take photos of any damage\n4. Contact your host via the app\n\nFull guide: itwhip.com/support/roadside\nEmergency: (855) 703-0806`,
    es: `Asistencia en Carretera ItWhip:\n1. Si hay peligro, llama al 911\n2. Ve a un lugar seguro\n3. Toma fotos de cualquier dano\n4. Contacta a tu anfitrion por la app\n\nGuia: itwhip.com/es/support/roadside\nEmergencia: (855) 703-0806`,
    fr: `Assistance Routiere ItWhip:\n1. En cas de danger, appelez le 911\n2. Placez-vous en securite\n3. Prenez des photos des dommages\n4. Contactez votre hote via l'app\n\nGuide: itwhip.com/fr/support/roadside\nUrgence: (855) 703-0806`,
  }
  return templates[locale]
}
