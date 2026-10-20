/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { mint: '#F3F8F4', leaf: '#116A34', sprout: '#7CB542', soil: '#10281D', soil2: '#183827', ink: '#EAF5EE', moss: '#4E6B5A' },
    fontFamily: { display: ['"Instrument Serif"', 'Georgia', 'serif'], sans: ['Inter', 'system-ui', 'sans-serif'] }
  } },
  plugins: []
}
