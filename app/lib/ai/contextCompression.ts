// app/lib/ai/contextCompression.ts
// Compress long Choé conversations to save tokens and prevent context loss
// Keeps: first message (original intent) + last 5 messages (recent context)
// Summarizes: everything in the middle

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MAX_UNCOMPRESSED = 10 // messages before compression kicks in
const RECENT_TO_KEEP = 5    // most recent messages always kept

export function compressConversation(messages: Message[]): Message[] {
  if (messages.length <= MAX_UNCOMPRESSED) return messages

  const first = messages[0]
  const recent = messages.slice(-RECENT_TO_KEEP)
  const middle = messages.slice(1, -RECENT_TO_KEEP)

  const summary: Message = {
    role: 'user',
    content: `[Previous conversation summary: ${extractSummary(middle)}]`,
  }

  return [first, summary, ...recent]
}

function extractSummary(messages: Message[]): string {
  const parts: string[] = []

  // Extract search terms
  const searches = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .filter(c => c.length > 0)

  if (searches.length > 0) {
    const keywords = searches
      .join(' ')
      .match(/\b(suv|sedan|truck|convertible|electric|luxury|sports|exotic|cheap|budget|tesla|bmw|porsche|lamborghini|ferrari|mclaren|bentley|rideshare|phoenix|scottsdale|tempe|mesa|tucson)\b/gi)
    if (keywords) {
      parts.push(`Guest searched for: ${[...new Set(keywords.map(k => k.toLowerCase()))].join(', ')}`)
    }
  }

  // Count cars shown
  const carMentions = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
  const carCount = carMentions.reduce((sum, c) => {
    const match = c.match(/(\d+)\s*(cars?|vehicles?|options?|results?)/i)
    return match ? Math.max(sum, parseInt(match[1])) : sum
  }, 0)
  if (carCount > 0) parts.push(`showed ${carCount} cars`)

  // Detect topics discussed
  const allText = messages.map(m => m.content).join(' ').toLowerCase()
  const topics: string[] = []
  if (/cancel|refund/.test(allText)) topics.push('cancellation policy')
  if (/insurance|coverage|protection/.test(allText)) topics.push('insurance')
  if (/deposit/.test(allText)) topics.push('deposits')
  if (/delivery|pickup|airport/.test(allText)) topics.push('delivery/pickup')
  if (/price|rate|cost|budget/.test(allText)) topics.push('pricing')
  if (/review|rating|star/.test(allText)) topics.push('reviews')
  if (/book|reserve/.test(allText)) topics.push('booking')
  if (topics.length > 0) parts.push(`discussed: ${topics.join(', ')}`)

  // Extract current preference
  const lastUserMessages = messages.filter(m => m.role === 'user').slice(-2)
  if (lastUserMessages.length > 0) {
    const lastIntent = lastUserMessages.map(m => m.content).join('. ')
    if (lastIntent.length > 10) {
      parts.push(`recent intent: "${lastIntent.slice(0, 100)}"`)
    }
  }

  return parts.join('. ') || 'general car rental conversation'
}
