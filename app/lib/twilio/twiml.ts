// app/lib/twilio/twiml.ts
// TwiML generators for IVR phone system
// Supports 3 languages: English, Spanish (Latin American), French (formal)
//
// Retry policy: Every menu repeats MAX 2 times. After 2nd timeout → goodbye + hangup.
// Emergency exception: after retries → voicemail instead of hangup.

import twilio from 'twilio'
import { TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from './client'

const VoiceResponse = twilio.twiml.VoiceResponse

type Lang = 'en' | 'es' | 'fr'

// ─── Voice Config ──────────────────────────────────────────────────

const VOICE: Record<Lang, { voice: string; language: string }> = {
  en: { voice: 'Polly.Danielle-Neural', language: 'en-US' },
  es: { voice: 'Polly.Mia', language: 'es-MX' },
  fr: { voice: 'Polly.Lea-Neural', language: 'fr-FR' },
}

const GATHER_TIMEOUT = 8
const MAX_RETRIES = 2

// ─── URL Helpers ───────────────────────────────────────────────────

function voiceUrl(path?: string): string {
  return `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice${path || ''}`
}

function menuUrl(menu: string, lang: Lang, extra?: string): string {
  return `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/menu?menu=${menu}&lang=${lang}${extra || ''}`
}

// ─── Say / Localize Helpers ────────────────────────────────────────

function say(twiml: twilio.twiml.VoiceResponse | ReturnType<twilio.twiml.VoiceResponse['gather']>, text: string, lang: Lang = 'en') {
  twiml.say(VOICE[lang], text)
}

function t(lang: Lang, en: string, es: string, fr: string): string {
  return lang === 'es' ? es : lang === 'fr' ? fr : en
}

// ─── Goodbye + Hangup (shared) ────────────────────────────────────

function goodbye(twiml: twilio.twiml.VoiceResponse, lang: Lang) {
  say(twiml, t(lang,
    'Thank you for calling ItWhip. For help anytime, visit itwhip.com. Goodbye.',
    'Gracias por llamar a ItWhip. Para ayuda en cualquier momento, visita itwhip.com. Hasta luego.',
    'Merci d\'avoir appelé ItWhip. Pour de l\'aide à tout moment, visitez itwhip.com. Au revoir.'
  ), lang)
  twiml.hangup()
}

// ════════════════════════════════════════════════════════════════════
// 1.0: LANGUAGE SELECTION (Entry Point — everyone hears this first)
// ════════════════════════════════════════════════════════════════════

export function generateLanguageSelection(): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: voiceUrl(),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  gather.say(VOICE.en, 'Thank you for calling ItWhip, Arizona\'s car rental marketplace. For faster service anytime, chat with coyee, our A.I. assistant, at itwhip.com.')
  gather.pause({ length: 0.5 })
  gather.say(VOICE.en, 'For English, press 1.')
  gather.pause({ length: 0.3 })
  gather.say(VOICE.es, 'Para español, oprima el 2.')
  gather.pause({ length: 0.3 })
  gather.say(VOICE.fr, 'Pour le français, appuyez sur le 3.')

  // No input → goodbye
  goodbye(twiml, 'en')
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 1.5: ACTIVE TRIP OVERRIDE (caller with active rental)
// ════════════════════════════════════════════════════════════════════
// "Hi {name}, I see you have an active rental of a {car}.
//  Is this an emergency? Press 1 yes, 2 other assistance."

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

  // No input → voicemail (active trip callers likely need help)
  twiml.redirect(menuUrl('voicemail-prompt', lang))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 2.0: VISITOR MAIN MENU (default — unknown callers)
// ════════════════════════════════════════════════════════════════════
// "To learn about renting with ItWhip, press 1.
//  If you have a booking code, press 2.
//  To speak with someone, press 3."

export function generateVisitorMenu(lang: Lang = 'en', tries: number = 0): string {
  const twiml = new VoiceResponse()

  if (tries >= MAX_RETRIES) {
    goodbye(twiml, lang)
    return twiml.toString()
  }

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('visitor', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'To learn about renting with ItWhip, press 1. If you have a booking code, press 2. To speak with someone, press 3.',
    'Para conocer como rentar con ItWhip, oprima 1. Si tienes un codigo de reserva, oprima 2. Para hablar con alguien, oprima 3.',
    'Pour en savoir plus sur la location avec ItWhip, appuyez sur 1. Si vous avez un code de réservation, appuyez sur 2. Pour parler à quelqu\'un, appuyez sur 3.'
  ), lang)

  // No input → repeat with tries+1
  twiml.redirect(menuUrl('visitor', lang, `&tries=${tries + 1}`))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 2.1: ABOUT ITWHIP (visitor → press 1)
// ════════════════════════════════════════════════════════════════════
// "ItWhip connects you with local car owners in Phoenix for affordable rentals.
//  Browse cars and book at itwhip.com or chat with coyee."

export function generateAboutItWhip(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('about-action', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'ItWhip connects you with local car owners in Phoenix for affordable, flexible rentals. Browse cars, compare prices, and book instantly at itwhip.com. Or chat with coyee, our A.I. assistant, anytime for help finding the perfect car. We\'ve texted you the link. To speak with someone, press 1. To hear this again, press 2.',
    'ItWhip te conecta con dueños de autos locales en Phoenix para rentas accesibles y flexibles. Busca autos, compara precios y reserva al instante en itwhip.com. O habla con coyee, nuestro asistente de inteligencia artificial, para ayuda encontrando el auto perfecto. Te enviamos el enlace por mensaje de texto. Para hablar con alguien, oprima 1. Para escuchar esto de nuevo, oprima 2.',
    'ItWhip vous connecte avec des propriétaires de voitures locaux à Phoenix pour des locations abordables et flexibles. Parcourez les voitures, comparez les prix et réservez instantanément sur itwhip.com. Ou parlez avec coyee, notre assistant I.A., pour trouver la voiture parfaite. Nous vous avons envoyé le lien par SMS. Pour parler à quelqu\'un, appuyez sur 1. Pour réécouter, appuyez sur 2.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 3.0: CUSTOMER MAIN MENU (identified callers only)
// ════════════════════════════════════════════════════════════════════
// "Welcome back. For booking support, press 1.
//  For insurance and claims, press 2. To speak with someone, press 3."

export function generateCustomerMenu(lang: Lang = 'en', tries: number = 0): string {
  const twiml = new VoiceResponse()

  if (tries >= MAX_RETRIES) {
    goodbye(twiml, lang)
    return twiml.toString()
  }

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('customer', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'Welcome back. For booking support, press 1. For insurance and claims, press 2. To speak with someone, press 3.',
    'Bienvenido de vuelta. Para soporte de reservas, oprima 1. Para seguros y reclamos, oprima 2. Para hablar con alguien, oprima 3.',
    'Bon retour. Pour le support de réservation, appuyez sur 1. Pour les assurances et réclamations, appuyez sur 2. Pour parler à quelqu\'un, appuyez sur 3.'
  ), lang)

  // No input → repeat with tries+1
  twiml.redirect(menuUrl('customer', lang, `&tries=${tries + 1}`))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.0: BOOKING CODE ENTRY
// ════════════════════════════════════════════════════════════════════
// "Enter your 6-digit booking code followed by pound. Or press star to skip."

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

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.1: BOOKING FOUND
// ════════════════════════════════════════════════════════════════════
// "I found your booking. {car} reserved for {dates} with {host}."
// "Connect to host press 1. Pickup details press 2. Main menu press 3."

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

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.2: CONNECT TO HOST
// ════════════════════════════════════════════════════════════════════

export function generateConnectToHost(hostPhone: string, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  // Promo message while connecting
  say(twiml, t(lang,
    'Connecting you to your host now. Quick tip: you can also message your host anytime through your ItWhip trip page at itwhip.com.',
    'Conectandote con tu anfitrion. Consejo: tambien puedes enviar mensajes a tu anfitrion en cualquier momento a traves de tu pagina de viaje en itwhip.com.',
    'Nous vous connectons à votre hôte. Conseil: vous pouvez aussi envoyer des messages à votre hôte via votre page de trajet sur itwhip.com.'
  ), lang)

  // Hold music while phone rings
  twiml.play('http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient')

  const dial = twiml.dial({
    callerId: TWILIO_LOCAL_NUMBER,
    timeout: 30,
    answerOnBridge: true,
    action: menuUrl('voicemail-prompt', lang),
  })
  dial.number(hostPhone)

  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.3: PICKUP DETAILS
// ════════════════════════════════════════════════════════════════════

export function generatePickupDetails(booking: {
  address: string
  date: string
  time: string
}, lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('customer', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    `Your pickup is at ${booking.address} on ${booking.date} at ${booking.time}. We've also texted you these details. To return to the main menu, press 1.`,
    `Tu recogida es en ${booking.address} el ${booking.date} a las ${booking.time}. Tambien te enviamos estos detalles por mensaje de texto. Para volver al menu principal, oprima 1.`,
    `Votre prise en charge est au ${booking.address} le ${booking.date} à ${booking.time}. Nous vous avons aussi envoyé ces détails par SMS. Pour revenir au menu principal, appuyez sur 1.`
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.4: BOOKING NOT FOUND
// ════════════════════════════════════════════════════════════════════

export function generateBookingNotFound(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('booking-not-found', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'I couldn\'t find that booking code. To try again, press 1. To return to the main menu, press 2.',
    'No encontre ese codigo de reserva. Para intentar de nuevo, oprima 1. Para volver al menu principal, oprima 2.',
    'Je n\'ai pas trouvé ce code de réservation. Pour réessayer, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 4.5: BOOKING SKIP (pressed * to skip code)
// ════════════════════════════════════════════════════════════════════

export function generateBookingSkip(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'For help with a new booking, visit itwhip.com or chat with coyee, our A.I. assistant. To leave a voicemail for our team, press 1. To return to the main menu, press 2.',
    'Para ayuda con una nueva reserva, visita itwhip.com o habla con coyee, nuestro asistente de inteligencia artificial. Para dejar un mensaje de voz, oprima 1. Para volver al menu principal, oprima 2.',
    'Pour de l\'aide avec une nouvelle réservation, visitez itwhip.com ou parlez avec coyee, notre assistant I.A. Pour laisser un message vocal, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 5.0: INSURANCE & CLAIMS MENU
// ════════════════════════════════════════════════════════════════════
// "Insurance coverage press 1. Report damage press 2. Claim status press 3. Main menu press 4."

export function generateInsuranceMenu(lang: Lang = 'en', tries: number = 0): string {
  const twiml = new VoiceResponse()

  if (tries >= MAX_RETRIES) {
    goodbye(twiml, lang)
    return twiml.toString()
  }

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

  // No input → repeat with tries+1
  twiml.redirect(menuUrl('insurance', lang, `&tries=${tries + 1}`))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 5.1: INSURANCE INFO
// ════════════════════════════════════════════════════════════════════

export function generateInsuranceInfo(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('customer', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'ItWhip offers three tiers of insurance coverage: Basic at 40 percent, Standard at 75 percent, and Premium at 90 percent. For full details, visit itwhip.com slash insurance guide. We\'ve also texted you the link. To return to the main menu, press 1.',
    'ItWhip ofrece tres niveles de cobertura de seguro: Basico al 40 por ciento, Estandar al 75 por ciento y Premium al 90 por ciento. Para detalles completos, visita itwhip.com slash insurance guide. Tambien te enviamos el enlace por mensaje de texto. Para volver al menu principal, oprima 1.',
    'ItWhip propose trois niveaux de couverture d\'assurance: Basique à 40 pour cent, Standard à 75 pour cent et Premium à 90 pour cent. Pour tous les détails, visitez itwhip.com slash insurance guide. Nous vous avons aussi envoyé le lien par SMS. Pour revenir au menu principal, appuyez sur 1.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 5.2: REPORT DAMAGE
// ════════════════════════════════════════════════════════════════════

export function generateReportDamage(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'To report vehicle damage, please use your ItWhip account online or chat with coyee at itwhip.com. This allows you to upload photos and documentation. We\'ve texted you the link. To leave a voicemail about damage instead, press 1. To return to the main menu, press 2.',
    'Para reportar danos al vehiculo, por favor usa tu cuenta de ItWhip en linea o habla con coyee en itwhip.com. Esto te permite subir fotos y documentacion. Te enviamos el enlace por mensaje de texto. Para dejar un mensaje de voz sobre el dano, oprima 1. Para volver al menu principal, oprima 2.',
    'Pour signaler des dommages au véhicule, veuillez utiliser votre compte ItWhip en ligne ou parler avec coyee sur itwhip.com. Cela vous permet de télécharger des photos et documents. Nous vous avons envoyé le lien par SMS. Pour laisser un message vocal, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 6.0: SPEAK WITH SOMEONE / VOICEMAIL
// ════════════════════════════════════════════════════════════════════

export function generateSpeakWithSomeone(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  if (isBusinessHours()) {
    // Promo message + hold music while connecting
    say(twiml, t(lang,
      'Connecting you to our team now. While you wait, did you know ItWhip offers three tiers of insurance coverage? Visit itwhip.com slash insurance guide for details.',
      'Conectandote con nuestro equipo. Mientras esperas, sabias que ItWhip ofrece tres niveles de cobertura de seguro? Visita itwhip.com para detalles.',
      'Nous vous connectons à notre équipe. En attendant, saviez-vous qu\'ItWhip propose trois niveaux de couverture d\'assurance? Visitez itwhip.com pour les détails.'
    ), lang)

    // Hold music while phone rings
    twiml.play('http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient')

    const dial = twiml.dial({
      callerId: TWILIO_LOCAL_NUMBER,
      timeout: 30,
      answerOnBridge: true,
      action: menuUrl('voicemail-prompt', lang),
    })
    dial.number(process.env.SUPPORT_PHONE_NUMBER || '+16026092577')
  } else {
    twiml.redirect(menuUrl('voicemail-prompt', lang))
  }

  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 6.1: VOICEMAIL PROMPT
// ════════════════════════════════════════════════════════════════════

export function generateVoicemailPrompt(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  say(twiml, t(lang,
    'Our office is currently closed. Our hours are Monday through Friday, 8 A.M. to 8 P.M. Arizona time. Please leave your name, phone number, and a brief message after the beep, and we\'ll return your call on the next business day. For instant help anytime, visit itwhip.com and chat with coyee.',
    'Nuestra oficina esta cerrada. Nuestro horario es de lunes a viernes, de 8 de la manana a 8 de la noche, hora de Arizona. Por favor deja tu nombre, numero de telefono y un breve mensaje despues del tono, y te llamaremos el siguiente dia habil. Para ayuda instantanea, visita itwhip.com y habla con coyee.',
    'Notre bureau est actuellement fermé. Nos heures sont du lundi au vendredi, de 8 heures à 20 heures, heure de l\'Arizona. Veuillez laisser votre nom, numéro de téléphone et un bref message après le bip, et nous vous rappellerons le prochain jour ouvrable. Pour de l\'aide instantanée, visitez itwhip.com et parlez avec coyee.'
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

// ════════════════════════════════════════════════════════════════════
// 7.0: EMERGENCY FLOW (active trip → press 1)
// ════════════════════════════════════════════════════════════════════

export function generateEmergencyMenu(lang: Lang = 'en', tries: number = 0): string {
  const twiml = new VoiceResponse()

  // Emergency callers → voicemail instead of hangup (they need help)
  if (tries >= MAX_RETRIES) {
    say(twiml, t(lang,
      'Let me connect you to our voicemail so we can help you.',
      'Permiteme conectarte con nuestro buzon de voz para que podamos ayudarte.',
      'Permettez-moi de vous connecter à notre messagerie vocale pour que nous puissions vous aider.'
    ), lang)
    twiml.redirect(menuUrl('voicemail-prompt', lang))
    return twiml.toString()
  }

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

  // No input → repeat with tries+1
  twiml.redirect(menuUrl('emergency', lang, `&tries=${tries + 1}`))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 7.1: ROADSIDE INFO
// ════════════════════════════════════════════════════════════════════

export function generateRoadsideInfo(lang: Lang = 'en'): string {
  const twiml = new VoiceResponse()

  const gather = twiml.gather({
    numDigits: 1,
    action: menuUrl('speak', lang),
    method: 'POST',
    timeout: GATHER_TIMEOUT,
  })

  say(gather, t(lang,
    'We\'ve texted you our roadside assistance guide with emergency steps. A team member will also be notified. To leave a voicemail with details, press 1. To return to the main menu, press 2.',
    'Te enviamos por mensaje de texto nuestra guia de asistencia en carretera con los pasos de emergencia. Un miembro del equipo tambien sera notificado. Para dejar un mensaje de voz con detalles, oprima 1. Para volver al menu principal, oprima 2.',
    'Nous vous avons envoyé par SMS notre guide d\'assistance routière avec les étapes d\'urgence. Un membre de l\'équipe sera également notifié. Pour laisser un message vocal avec les détails, appuyez sur 1. Pour revenir au menu principal, appuyez sur 2.'
  ), lang)

  // No input → goodbye
  goodbye(twiml, lang)
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// 9.0: INVALID INPUT
// ════════════════════════════════════════════════════════════════════

export function generateInvalidInput(lang: Lang = 'en', returnMenu: string = 'visitor'): string {
  const twiml = new VoiceResponse()

  say(twiml, t(lang,
    'That\'s not a valid option. Please try again.',
    'Esa no es una opcion valida. Por favor intenta de nuevo.',
    'Ce n\'est pas une option valide. Veuillez réessayer.'
  ), lang)

  twiml.redirect(menuUrl(returnMenu, lang))
  return twiml.toString()
}

// ════════════════════════════════════════════════════════════════════
// BUSINESS HOURS CHECK
// ════════════════════════════════════════════════════════════════════

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
