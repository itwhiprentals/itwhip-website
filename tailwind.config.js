/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5D3FD3',
        secondary: '#FF6B35',
        success: '#00D46A',
        dark: '#1A1A2E',
      },
      borderRadius: {
        'custom': '8px',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
