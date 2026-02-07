// app/help/choe/components/ChoeStyles.tsx
'use client'

export function ChoeStyles() {
  return (
    <style jsx global>{`
      @import url('https://fonts.cdnfonts.com/css/cabinet-grotesk');
      @import url('https://fonts.cdnfonts.com/css/satoshi');
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

      /* Light mode (default) */
      :root {
        --choe-bg-deep: #ffffff;
        --choe-bg-card: #f8f8f8;
        --choe-bg-elevated: #f0f0f0;
        --choe-accent-primary: #e87040;
        --choe-accent-warm: #ff7f50;
        --choe-accent-terracotta: #c94c24;
        --choe-accent-gold: #d4a574;
        --choe-text-primary: #1a1a1a;
        --choe-text-secondary: #666666;
        --choe-text-muted: #999999;
        --choe-border-subtle: #e5e5e5;
        --choe-border-accent: rgba(232, 112, 64, 0.3);
      }

      /* Dark mode */
      .dark {
        --choe-bg-deep: #0f0f0f;
        --choe-bg-card: #1a1a1a;
        --choe-bg-elevated: #252525;
        --choe-accent-primary: #e87040;
        --choe-accent-warm: #ff7f50;
        --choe-accent-terracotta: #c94c24;
        --choe-accent-gold: #d4a574;
        --choe-text-primary: #ffffff;
        --choe-text-secondary: #a8a8a8;
        --choe-text-muted: #666666;
        --choe-border-subtle: #333333;
        --choe-border-accent: rgba(232, 112, 64, 0.3);
      }

      .choe-page {
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .choe-page h1, .choe-page h2, .choe-page h3, .choe-page h4 {
        font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .choe-page code, .choe-page pre {
        font-family: 'JetBrains Mono', monospace;
      }

      @keyframes choe-fadeSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes choe-pulse-glow {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
      }

      @keyframes choe-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .choe-animate-in {
        animation: choe-fadeSlideUp 0.6s ease-out forwards;
      }

      .choe-delay-1 { animation-delay: 100ms; }
      .choe-delay-2 { animation-delay: 200ms; }
      .choe-delay-3 { animation-delay: 300ms; }
      .choe-delay-4 { animation-delay: 400ms; }

      .choe-glow-orb {
        animation: choe-pulse-glow 4s ease-in-out infinite;
      }

      .choe-float {
        animation: choe-float 6s ease-in-out infinite;
      }

      /* iOS Safari bottom bar picks up body background — match Choé theme */
      body:has(.choe-page) {
        background-color: #ffffff !important;
      }
      html.dark body:has(.choe-page) {
        background-color: #0f0f0f !important;
      }

      /* Header blends seamlessly with Choé page theme */
      .choe-page > nav {
        background-color: #ffffff !important;
        border-bottom-color: var(--choe-border-subtle) !important;
      }

      .dark .choe-page > nav {
        background-color: #0f0f0f !important;
        border-bottom-color: #222222 !important;
      }

      /* Header dropdown menus match Choé theme */
      .choe-page .nav-dropdown > div {
        background-color: #ffffff !important;
        border-color: var(--choe-border-subtle) !important;
      }

      .dark .choe-page .nav-dropdown > div {
        background-color: #1a1a1a !important;
        border-color: #333333 !important;
      }

      /* Nav hover states match Choé palette */
      .dark .choe-page > nav button:hover,
      .dark .choe-page > nav a:hover {
        background-color: #1a1a1a !important;
      }

      /* Dropdown item hover */
      .dark .choe-page .nav-dropdown a:hover {
        background-color: #252525 !important;
      }

      /* Smooth transitions for theme switching */
      .choe-page * {
        transition-property: background-color, border-color, color;
        transition-duration: 200ms;
        transition-timing-function: ease-out;
      }
    `}</style>
  )
}
