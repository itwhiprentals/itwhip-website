// app/api/webhooks/twilio/voice/wait-music/route.ts
// Hold music + promotional messages for Conference waitUrl
//
// Twilio calls this URL while a caller waits in a conference.
// When the TwiML finishes, Twilio requests this URL again (loops).
// Messages: ItWhip promos, tips, and "did you know" facts
// Between messages: pauses (can swap for custom MP3 URL later)

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

// ─── Promotional Messages (rotate through these) ───────────────────
const PROMO_MESSAGES: Record<Lang, string[]> = {
  en: [
    'Thank you for holding. We\'ll be with you shortly.',
    'Did you know? ItWhip offers cars starting at just 35 dollars per day right here in Phoenix.',
    'Pro tip: For instant help with bookings, directions, or any questions, chat with Coyi, our A.I. booking assistant, on our website.',
    'Did you know? ItWhip offers three tiers of insurance coverage: liability, standard, and premium. Visit our insurance guide on the website for details.',
    'Want to earn extra income with your car? List it on ItWhip and start earning today. Visit our partner page on the website to get started.',
    'Did you know? You can manage your entire trip, message your host, and get directions all from your ItWhip trip page.',
    'Fun fact: ItWhip is Phoenix\'s own car rental marketplace. Book local, support local.',
  ],
  es: [
    'Gracias por esperar. Estaremos contigo en un momento.',
    'Sabias que ItWhip ofrece autos desde solo 35 dolares por dia aqui en Phoenix?',
    'Consejo: Para ayuda instantanea con reservas, direcciones o cualquier pregunta, habla con Coyi, nuestro asistente de inteligencia artificial, en nuestro sitio web.',
    'Sabias que ItWhip ofrece tres niveles de cobertura de seguro: responsabilidad civil, estandar y premium? Visita nuestra guia de seguros en el sitio web para detalles.',
    'Quieres ganar dinero extra con tu auto? Publicalo en ItWhip y empieza a ganar hoy. Visita nuestra pagina de socios en el sitio web para comenzar.',
    'Sabias que puedes gestionar todo tu viaje, enviar mensajes a tu anfitrion y obtener direcciones desde tu pagina de viaje en ItWhip?',
    'Dato curioso: ItWhip es el mercado de alquiler de autos de Phoenix. Reserva local, apoya lo local.',
  ],
  fr: [
    'Merci de patienter. Nous serons avec vous sous peu.',
    'Saviez-vous? ItWhip propose des voitures à partir de seulement 35 dollars par jour ici à Phoenix.',
    'Conseil: Pour une aide instantanée avec les réservations, les directions ou toute question, parlez avec Coyi, notre assistant de réservation I.A., sur notre site web.',
    'Saviez-vous? ItWhip propose trois niveaux de couverture d\'assurance: responsabilité civile, standard et premium. Consultez notre guide d\'assurance sur le site web pour les détails.',
    'Vous voulez gagner un revenu supplémentaire avec votre voiture? Publiez-la sur ItWhip et commencez à gagner dès aujourd\'hui. Visitez notre page partenaires sur le site web pour commencer.',
    'Saviez-vous? Vous pouvez gérer tout votre voyage, envoyer des messages à votre hôte et obtenir des directions depuis votre page de voyage ItWhip.',
    'Fait amusant: ItWhip est le marché de location de voitures de Phoenix. Réservez local, soutenez local.',
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

  const twiml = new VoiceResponse()

  // Promotional message
  twiml.say(VOICE[lang], currentMsg)

  // Pause between messages (caller hears silence — swap for <Play> MP3 URL for music)
  twiml.pause({ length: 10 })

  // Redirect to self with next message index
  twiml.redirect({
    method: 'POST',
  }, `${url.pathname}?lang=${lang}&n=${nextIndex}`)

  return xml(twiml.toString())
}
