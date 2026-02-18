// app/lib/twilio/twiml.ts
// TwiML generators for IVR phone system
// Uses Twilio VoiceResponse to build XML responses for each menu level
// Supports 3 languages: English, Spanish (Latin American), French (formal)

import twilio from 'twilio'
import { TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from './client'

const VoiceResponse = twilio.twiml.VoiceResponse

type Lang = 'en' | 'es' | 'fr'

// ─── Voice Config ──────────────────────────────────────────────────

const VOICE: Record<Lang, { voice: string; language: string }> = {
  en: { voice: 'Polly.Joanna', language: 'en-US' },
  es: { voice: 'Polly.Mia', language: 'es-MX' },
  fr: { voice: 'Polly.Lea', language: 'fr-FR' },
}

const GATHER_TIMEOUT = 8

// All TwiML action URLs point to real Next.js route handlers
function voiceUrl(path?: string): string {
  return `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice${path || ''}`
}

function menuUrl(menu: string, lang: Lang, extra?: string): string {
  return `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/menu?menu=${menu}&lang=${lang}${extra || ''}`
}

// ─── Helper: Say with voice ────────────────────────────────────────

function say(twiml: twilio.twiml.VoiceResponse | ReturnType<twilio.twiml.VoiceResponse['gather']>, text: string, lang: Lang = 'en') {
  twiml.say(VOICE[lang], text)
}

// ─── Localized text helper ─────────────────────────────────────────

function t(lang: Lang, en: string, es: string, fr: string): string {
  return lang === 'es' ? es : lang === 'fr' ? fr : en
}

// ─── 1.0: Language Selection (Entry Point) ─────────────────────────

export function generateLanguageSelection(): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: voiceUrl(),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  gather.say(VOICE.en, 'Thank you for calling ItWhip, Arizona\'s car rental marketplace.')
  gather.pause({ length: 0.5 })
  gather.say(VOICE.en, 'For English, press 1.')
  gather.pause({ length: 0.3 })
  gather.say(VOICE.es, 'Para español, oprima el 2.')
  gather.pause({ length: 0.3 })
  gather.say(VOICE.fr, 'Pour le français, appuyez sur le 3.')

  // No input → voicemail
  say(twiml, 'We didn\'t receive your selection. Please leave a message after the beep.', 'en')
  twiml.redirect(menuUrl('voicemail-prompt', 'en'))

  return twiml.toString()
}

// ─── 1.5: Active Trip Override ─────────────────────────────────────

export function generateActiveTripMenu(name: string, carName: string, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('active-trip', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    `Hi ${name}, I see you have an active rental of a ${carName}. Is this an emergency? For yes, press 1. For other assistance, press 2.`,
    `Hola ${name}, veo que tienes una renta activa de un ${carName}. Es una emergencia? Para si, oprima 1. Para otra asistencia, oprima 2.`,
    `Bonjour ${name}, je vois que vous avez une location active d'un ${carName}. Est-ce une urgence? Pour oui, appuyez sur 1. Pour autre assistance, appuyez sur 2.`
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 2.0: Main Menu ───────────────────────────────────────────────

export function generateMainMenu(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('main', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'For faster service, try Cho-ay, our A.I. assistant, at itwhip.com.',
    'Para servicio mas rapido, prueba Cho-ay, nuestro asistente de inteligencia artificial, en itwhip.com.',
    'Pour un service plus rapide, essayez Cho-ay, notre assistant I.A., sur itwhip.com.'
  ), lang)
  gather.pause({ length: 0.3 })
  say(gather, t(lang,
    'For booking support, press 1. For insurance and claims, press 2. To speak with someone, press 3.',
    'Para soporte de reservas, oprima 1. Para seguros y reclamos, oprima 2. Para hablar con alguien, oprima 3.',
    'Pour le support de réservation, appuyez sur 1. Pour les assurances et réclamations, appuyez sur 2. Pour parler à quelqu\'un, appuyez sur 3.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 3.0: Booking Code Entry ──────────────────────────────────────

export function generateBookingCodeEntry(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    finishOnKey: '#',
    action: menuUrl('booking-code', lang),
    method: 'POST',
    timeout: 10,
  })

  say(gather, t(lang,
    'Please enter your 6-digit booking code followed by the pound sign. Or press star to skip.',
    'Por favor ingresa tu codigo de reserva de 6 digitos seguido de la tecla de gato. O presiona asterisco para saltar.',
    'Veuillez entrer votre code de réservation à 6 chiffres suivi du signe dièse. Ou appuyez sur étoile pour passer.'
  ), lang)

  twiml.redirect(menuUrl('booking-code', lang))
  return twiml.toString()
}

// ─── 3.1: Booking Found ───────────────────────────────────────────

export function generateBookingFound(booking: {
  bookingCode: string
  carName: string
  dates: string
  hostName: string
}, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('booking-found', lang, `&code=${booking.bookingCode}`),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    `I found your booking. You have a ${booking.carName} reserved for ${booking.dates} with ${booking.hostName}.`,
    `Encontre tu reserva. Tienes un ${booking.carName} reservado para ${booking.dates} con ${booking.hostName}.`,
    `J'ai trouvé votre réservation. Vous avez un ${booking.carName} réservé pour ${booking.dates} avec ${booking.hostName}.`
  ), lang)
  gather.pause({ length: 0.3 })
  say(gather, t(lang,
    'To connect with your host, press 1. To hear pickup details, press 2. To return to the main menu, press 3.',
    'Para conectar con tu anfitrion, oprima 1. Para escuchar detalles de recogida, oprima 2. Para volver al menu principal, oprima 3.',
    'Pour contacter votre hôte, appuyez sur 1. Pour les détails de prise en charge, appuyez sur 2. Pour revenir au menu principal, appuyez sur 3.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 3.2: Connect to Host ─────────────────────────────────────────

export function generateConnectToHost(hostPhone: string, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  say(twiml, t(lang,
    'Connecting you to your host now. Please hold.',
    'Conectandote con tu anfitrion. Por favor espera.',
    'Nous vous connectons à votre hôte. Veuillez patienter.'
  ), lang)

  const dial = twiml.dial({ callerId: TWILIO_LOCAL_NUMBER, timeout: 30 })
  dial.number(hostPhone)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 3.3: Pickup Details ──────────────────────────────────────────

export function generatePickupDetails(booking: {
  address: string
  date: string
  time: string
}, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('main', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    `Your pickup is at ${booking.address} on ${booking.date} at ${booking.time}. We've also texted you these details. To return to the main menu, press 1.`,
    `Tu recogida es en ${booking.address} el ${booking.date} a las ${booking.time}. Tambien te enviamos estos detalles por mensaje de texto. Para volver al menu principal, oprima 1.`,
    `Votre prise en charge est au ${booking.address} le ${booking.date} à ${booking.time}. Nous vous avons aussi envoyé ces détails par SMS. Pour revenir au menu principal, appuyez sur 1.`
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 3.4: Booking Not Found ──────────────────────────────────────

export function generateBookingNotFound(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('booking-not-found', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'I couldn\'t find that booking code. I\'ve texted you a link to manage your bookings online. To try again, press 1. To return to the main menu, press 2.',
    'No encontre ese codigo de reserva. Te enviamos un enlace por mensaje de texto para administrar tus reservas en linea. Para intentar de nuevo, oprima 1. Para volver al menu principal, oprima 2.',
    'Je n\'ai pas trouvé ce code de réservation. Nous vous avons envoyé un lien par SMS pour gérer vos réservations en ligne. Pour réessayer, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 3.5: Booking Skip (General Help) ─────────────────────────────

export function generateBookingSkip(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'For help with a new booking, visit itwhip.com or chat with Cho-ay, our A.I. assistant. To leave a voicemail for our team, press 1. To return to the main menu, press 2.',
    'Para ayuda con una nueva reserva, visita itwhip.com o habla con Cho-ay, nuestro asistente de inteligencia artificial. Para dejar un mensaje de voz, oprima 1. Para volver al menu principal, oprima 2.',
    'Pour de l\'aide avec une nouvelle réservation, visitez itwhip.com ou parlez avec Cho-ay, notre assistant I.A. Pour laisser un message vocal, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 4.0: Insurance & Claims Menu ─────────────────────────────────

export function generateInsuranceMenu(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('insurance', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'For questions about insurance coverage, press 1. To report vehicle damage, press 2. To check the status of an existing claim, press 3. To return to the main menu, press 4.',
    'Para preguntas sobre cobertura de seguro, oprima 1. Para reportar danos al vehiculo, oprima 2. Para verificar el estado de un reclamo existente, oprima 3. Para volver al menu principal, oprima 4.',
    'Pour des questions sur la couverture d\'assurance, appuyez sur 1. Pour signaler des dommages au véhicule, appuyez sur 2. Pour vérifier l\'état d\'une réclamation, appuyez sur 3. Pour revenir au menu principal, appuyez sur 4.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 4.1: Insurance Info ──────────────────────────────────────────

export function generateInsuranceInfo(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('main', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'ItWhip offers three tiers of insurance coverage: Basic at 40 percent, Standard at 75 percent, and Premium at 90 percent. For full details, visit itwhip.com slash insurance guide. I\'ve also texted you the link. To return to the main menu, press 1.',
    'ItWhip ofrece tres niveles de cobertura de seguro: Basico al 40 por ciento, Estandar al 75 por ciento y Premium al 90 por ciento. Para detalles completos, visita itwhip.com slash insurance guide. Tambien te enviamos el enlace por mensaje de texto. Para volver al menu principal, oprima 1.',
    'ItWhip propose trois niveaux de couverture d\'assurance: Basique à 40 pour cent, Standard à 75 pour cent et Premium à 90 pour cent. Pour tous les détails, visitez itwhip.com slash insurance guide. Nous vous avons aussi envoyé le lien par SMS. Pour revenir au menu principal, appuyez sur 1.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 4.2: Report Damage ──────────────────────────────────────────

export function generateReportDamage(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'To report vehicle damage, please use your ItWhip account online or chat with Cho-ay at itwhip.com. This allows you to upload photos and documentation. I\'ve texted you the link. To leave a voicemail about damage instead, press 1. To return to the main menu, press 2.',
    'Para reportar danos al vehiculo, por favor usa tu cuenta de ItWhip en linea o habla con Cho-ay en itwhip.com. Esto te permite subir fotos y documentacion. Te enviamos el enlace por mensaje de texto. Para dejar un mensaje de voz sobre el dano, oprima 1. Para volver al menu principal, oprima 2.',
    'Pour signaler des dommages au véhicule, veuillez utiliser votre compte ItWhip en ligne ou parler avec Cho-ay sur itwhip.com. Cela vous permet de télécharger des photos et documents. Nous vous avons envoyé le lien par SMS. Pour laisser un message vocal, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 5.0: Speak With Someone / Voicemail ──────────────────────────

export function generateSpeakWithSomeone(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  if (isBusinessHours()) {
    say(twiml, t(lang,
      'Connecting you now. Please hold.',
      'Conectandote ahora. Por favor espera.',
      'Nous vous connectons maintenant. Veuillez patienter.'
    ), lang)
    const dial = twiml.dial({ callerId: TWILIO_LOCAL_NUMBER, timeout: 30 })
    dial.number(process.env.SUPPORT_PHONE_NUMBER || '+16026092577')
    twiml.redirect(menuUrl('voicemail-prompt', lang))
  } else {
    twiml.redirect(menuUrl('voicemail-prompt', lang))
  }

  return twiml.toString()
}

export function generateVoicemailPrompt(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  say(twiml, t(lang,
    'Our office is currently closed. Our hours are Monday through Friday, 8 A.M. to 8 P.M. Arizona time. Please leave your name, phone number, and a brief message after the beep, and we\'ll return your call on the next business day. For instant help anytime, visit itwhip.com slash Cho-ay.',
    'Nuestra oficina esta cerrada. Nuestro horario es de lunes a viernes, de 8 de la manana a 8 de la noche, hora de Arizona. Por favor deja tu nombre, numero de telefono y un breve mensaje despues del tono, y te llamaremos el siguiente dia habil. Para ayuda instantanea, visita itwhip.com slash Cho-ay.',
    'Notre bureau est actuellement fermé. Nos heures sont du lundi au vendredi, de 8 heures à 20 heures, heure de l\'Arizona. Veuillez laisser votre nom, numéro de téléphone et un bref message après le bip, et nous vous rappellerons le prochain jour ouvrable. Pour de l\'aide instantanée, visitez itwhip.com slash Cho-ay.'
  ), lang)

  twiml.record({
    action: voiceUrl('/voicemail') + `?lang=${lang}`,
    method: 'POST',
    maxLength: 120,
    transcribe: true,
    transcribeCallback: voiceUrl('/transcription'),
    playBeep: true,
    trim: 'trim-silence',
  })

  say(twiml, t(lang,
    'Thank you. Your message has been received. Goodbye.',
    'Gracias. Tu mensaje fue recibido. Hasta luego.',
    'Merci. Votre message a été reçu. Au revoir.'
  ), lang)

  twiml.hangup()
  return twiml.toString()
}

// ─── 6.0: Emergency Flow ──────────────────────────────────────────

export function generateEmergencyMenu(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('emergency', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'If you are in immediate danger, please hang up and call 9 1 1. For roadside assistance or a vehicle issue, press 1. To speak with someone immediately, press 2.',
    'Si estas en peligro inmediato, por favor cuelga y llama al 9 1 1. Para asistencia en carretera o un problema con el vehiculo, oprima 1. Para hablar con alguien inmediatamente, oprima 2.',
    'Si vous êtes en danger immédiat, veuillez raccrocher et appeler le 9 1 1. Pour l\'assistance routière ou un problème de véhicule, appuyez sur 1. Pour parler à quelqu\'un immédiatement, appuyez sur 2.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

export function generateRoadsideInfo(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'I\'ve texted you our roadside assistance guide with emergency steps. A team member will also be notified. To leave a voicemail with details, press 1. To return to the main menu, press 2.',
    'Te enviamos por mensaje de texto nuestra guia de asistencia en carretera con los pasos de emergencia. Un miembro del equipo tambien sera notificado. Para dejar un mensaje de voz con detalles, oprima 1. Para volver al menu principal, oprima 2.',
    'Nous vous avons envoyé par SMS notre guide d\'assistance routière avec les étapes d\'urgence. Un membre de l\'équipe sera également notifié. Pour laisser un message vocal avec les détails, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── 9.0: No Input / Invalid ──────────────────────────────────────

export function generateNoInput(retries: number, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  if (retries >= 3) {
    say(twiml, t(lang,
      'Let me connect you to our voicemail so we can help you.',
      'Permiteme conectarte con nuestro buzon de voz para que podamos ayudarte.',
      'Permettez-moi de vous connecter à notre messagerie vocale pour que nous puissions vous aider.'
    ), lang)
    twiml.redirect(menuUrl('voicemail-prompt', lang))
  } else {
    say(twiml, t(lang,
      'I didn\'t receive your selection. Let\'s try again.',
      'No recibi tu seleccion. Intentemos de nuevo.',
      'Je n\'ai pas reçu votre sélection. Réessayons.'
    ), lang)
    twiml.redirect(menuUrl('main', lang))
  }

  return twiml.toString()
}

export function generateInvalidInput(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  say(twiml, t(lang,
    'That\'s not a valid option. Please try again.',
    'Esa no es una opcion valida. Por favor intenta de nuevo.',
    'Ce n\'est pas une option valide. Veuillez réessayer.'
  ), lang)

  twiml.redirect(menuUrl('main', lang))
  return twiml.toString()
}

// ─── Business Hours Check ──────────────────────────────────────────

export function isBusinessHours(): boolean {
  // Arizona doesn't observe DST — always UTC-7 (MST)
  const now = new Date()
  const arizonaOffset = -7
  const utcHours = now.getUTCHours()
  const arizonaHours = (utcHours + arizonaOffset + 24) % 24
  const day = now.getUTCDay() // 0=Sun, 6=Sat

  // M-F 8am-8pm MST
  return day >= 1 && day <= 5 && arizonaHours >= 8 && arizonaHours < 20
}
