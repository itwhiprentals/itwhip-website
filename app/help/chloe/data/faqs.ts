// app/help/chloe/data/faqs.ts
// Frequently asked questions about Choé AI

export interface FAQ {
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    question: 'Is Choé a real person?',
    answer: 'No. Choé is an AI-powered booking assistant created by ItWhip. Choé uses advanced language models to understand your needs and find the perfect car. While Choé feels conversational, there\'s no human on the other end — just really smart AI.'
  },
  {
    question: 'How does Choé find cars so fast?',
    answer: 'Choé searches our real-time inventory database the moment you describe what you need. There\'s no loading of separate pages or clicking through filters — Choé translates your natural language into an instant search and returns matching vehicles in seconds.'
  },
  {
    question: 'Can Choé make mistakes?',
    answer: 'Yes. While Choé is highly accurate, it\'s still AI and can occasionally misunderstand requests or provide incorrect information. Always verify booking details (dates, prices, vehicle) before confirming. If something looks wrong, just tell Choé and it will correct itself.'
  },
  {
    question: 'Is my conversation with Choé private?',
    answer: 'Yes. Your conversations are not sold to third parties. We use conversation data only to improve Choé\'s responses and provide you better service. All data is encrypted and protected by our 7-layer security system.'
  },
  {
    question: 'How do I report an issue with Choé?',
    answer: 'If Choé isn\'t working correctly or gave you wrong information, please contact support@itwhip.com with details of your conversation. You can also use the feedback button in the chat interface. We take all reports seriously and use them to improve Choé.'
  },
  {
    question: 'What is choe.cloud?',
    answer: 'choe.cloud is our developer platform where businesses can integrate Choé into their own websites and apps. If you\'re a car rental company or fleet operator, you can add Choé\'s conversational booking experience to your platform. Visit choe.cloud to learn more.'
  },
  {
    question: 'Does Choé work outside Arizona?',
    answer: 'Currently, Choé is optimized for Arizona car rentals — Phoenix, Scottsdale, Tempe, Mesa, and surrounding areas. We\'re expanding to new regions soon. Choé knows Arizona weather, traffic patterns, and local hosts like no other AI.'
  },
  {
    question: 'Can Choé help me plan my whole trip?',
    answer: 'Coming soon! Choé Trip Planner (currently in beta) will help you plan entire trips — flights, hotels, cars, restaurants, and activities — all in one conversation. Join the waitlist at choe.cloud to be notified when it launches.'
  },
  {
    question: 'How is Choé different from a chatbot?',
    answer: 'Traditional chatbots follow scripts and can only handle predefined questions. Choé understands context, remembers your preferences, calculates budgets, checks weather, and actually books cars for you. It\'s not a chatbot — it\'s a booking companion powered by advanced AI.'
  },
  {
    question: 'What happens if I have a problem during my trip?',
    answer: 'Choé handles bookings, but our human support team handles trip issues. For roadside assistance, accidents, or disputes, contact ItWhip support at support@itwhip.com or call our 24/7 hotline. Your booking confirmation includes all emergency contact details.'
  }
]
