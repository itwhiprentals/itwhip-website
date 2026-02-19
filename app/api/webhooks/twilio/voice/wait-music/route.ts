// app/api/webhooks/twilio/voice/wait-music/route.ts
// Hold music + promotional messages for Conference waitUrl
//
// Twilio calls this URL while a caller waits in a conference.
// When the TwiML finishes, Twilio requests this URL again (loops).
//
// Flow per iteration:
// 1. <Say> promotional message (~8-12 seconds)
// 2. <Play> classical hold music track (~30-90 seconds)
// 3. <Redirect> to self with next message index
//
// Caller hears: promo → music → promo → music → ... until host joins

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

type Lang = 'en' | 'es' | 'fr'

// ─── Voice Config ──────────────────────────────────────────────────
const VOICE: Record<Lang, { voice: string; language: string }> = {
  en: { voice: 'Polly.Danielle-Neural', language: 'en-US' },
  es: { voice: 'Polly.Mia', language: 'es-MX' },
  fr: { voice: 'Polly.Lea-Neural', language: 'fr-FR' },
}

// ─── Twilio S3 Hold Music Tracks (classical bucket) ────────────────
// These are publicly hosted by Twilio — used by the twimlet
const MUSIC_TRACKS = [
  'http://com.twilio.music.classical.s3.amazonaws.com/ClockworkWaltz.mp3',
  'http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.mp3',
  'http://com.twilio.music.classical.s3.amazonaws.com/oldDog_-_endless_summer_%28702%29.mp3',
  'http://com.twilio.music.classical.s3.amazonaws.com/Mellotroniac_-_Flight_Of_The_Bumblebee.mp3',
  'http://com.twilio.music.classical.s3.amazonaws.com/ith_chopin-702-702.mp3',
]

// ─── Promotional Messages (rotate through these) ───────────────────
const PROMO_MESSAGES: Record<Lang, string[]> = {
  en: [
    'Thank you for holding. We\'ll be with you shortly.',
    'Did you know? ItWhip offers cars starting at just 35 dollars per day across Arizona.',
    'Pro tip: Chat with Coyi, our A.I. booking assistant, on our website for instant help with bookings, directions, or any questions.',
    'Did you know? You can book a car on ItWhip without creating an account. Just pick a car, enter your details, and go.',
    'Want to earn extra income with your car? Become an ItWhip host and start earning today. Sign up on our website.',
    'Did you know? Every guest on ItWhip goes through identity verification for your safety. Verified guests, verified hosts.',
    'Pro tip: Track your trip in real time from your ItWhip trip page. Get directions, message your host, and manage everything in one place.',
    'Did you know? ItWhip offers three tiers of insurance coverage so you can drive with peace of mind. Check out our insurance guide online.',
    'Thinking about listing your car? ItWhip hosts earn an average of over 800 dollars per month. Your car could be working for you.',
    'Did you know? You can message your host directly through ItWhip before, during, and after your trip. No need to exchange personal numbers.',
  ],
  es: [
    'Gracias por esperar. Estaremos contigo en un momento.',
    'Sabias que ItWhip ofrece autos desde solo 35 dolares por dia en todo Arizona?',
    'Consejo: Habla con Coyi, nuestro asistente de inteligencia artificial, en nuestro sitio web para ayuda instantanea con reservas, direcciones o cualquier pregunta.',
    'Sabias que puedes reservar un auto en ItWhip sin crear una cuenta? Solo elige un auto, ingresa tus datos y listo.',
    'Quieres ganar dinero extra con tu auto? Conviertete en anfitrion de ItWhip y empieza a ganar hoy. Registrate en nuestro sitio web.',
    'Sabias que cada huesped en ItWhip pasa por verificacion de identidad para tu seguridad? Huespedes verificados, anfitriones verificados.',
    'Consejo: Rastrea tu viaje en tiempo real desde tu pagina de viaje en ItWhip. Obtén direcciones, envia mensajes a tu anfitrion y gestiona todo en un solo lugar.',
    'Sabias que ItWhip ofrece tres niveles de cobertura de seguro para que manejes con tranquilidad? Consulta nuestra guia de seguros en linea.',
    'Pensando en publicar tu auto? Los anfitriones de ItWhip ganan un promedio de mas de 800 dolares al mes. Tu auto podria estar trabajando para ti.',
    'Sabias que puedes enviar mensajes a tu anfitrion directamente a traves de ItWhip antes, durante y despues de tu viaje? No necesitas intercambiar numeros personales.',
  ],
  fr: [
    'Merci de patienter. Nous serons avec vous sous peu.',
    'Saviez-vous? ItWhip propose des voitures à partir de seulement 35 dollars par jour à travers l\'Arizona.',
    'Conseil: Parlez avec Coyi, notre assistant de réservation I.A., sur notre site web pour une aide instantanée avec les réservations, les directions ou toute question.',
    'Saviez-vous? Vous pouvez réserver une voiture sur ItWhip sans créer de compte. Choisissez une voiture, entrez vos coordonnées et c\'est parti.',
    'Vous voulez gagner un revenu supplémentaire avec votre voiture? Devenez hôte ItWhip et commencez à gagner dès aujourd\'hui. Inscrivez-vous sur notre site web.',
    'Saviez-vous? Chaque locataire sur ItWhip passe par une vérification d\'identité pour votre sécurité. Locataires vérifiés, hôtes vérifiés.',
    'Conseil: Suivez votre voyage en temps réel depuis votre page de voyage ItWhip. Obtenez des directions, envoyez des messages à votre hôte et gérez tout en un seul endroit.',
    'Saviez-vous? ItWhip propose trois niveaux de couverture d\'assurance pour que vous conduisiez en toute tranquillité. Consultez notre guide d\'assurance en ligne.',
    'Vous pensez à mettre votre voiture en location? Les hôtes ItWhip gagnent en moyenne plus de 800 dollars par mois. Votre voiture pourrait travailler pour vous.',
    'Saviez-vous? Vous pouvez envoyer des messages à votre hôte directement via ItWhip avant, pendant et après votre voyage. Pas besoin d\'échanger vos numéros personnels.',
  ],
}

function xml(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const lang = (url.searchParams.get('lang') || 'en') as Lang
  const msgIndex = parseInt(url.searchParams.get('n') || '0', 10)

  const messages = PROMO_MESSAGES[lang] || PROMO_MESSAGES.en
  const currentMsg = messages[msgIndex % messages.length]
  const nextIndex = (msgIndex + 1) % messages.length

  // Pick a music track (cycle through them)
  const track = MUSIC_TRACKS[msgIndex % MUSIC_TRACKS.length]

  const twiml = new VoiceResponse()

  // Promotional message
  twiml.say(VOICE[lang], currentMsg)

  // Hold music between messages (full track plays ~30-90 seconds)
  twiml.play(track)

  // Redirect to self with next message index
  twiml.redirect({
    method: 'POST',
  }, `${url.pathname}?lang=${lang}&n=${nextIndex}`)

  return xml(twiml.toString())
}
