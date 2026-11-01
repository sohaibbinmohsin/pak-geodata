/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ],
        nastaliq: [
          '"Noto Nastaliq Urdu"',
          '"Jameel Noori Nastaleeq"',
          '"Urdu Typesetting"',
          'serif'
        ]
      },
      colors: {
        pak: {
          green: '#01411C',
          light: '#02682C',
          accent: '#10B981',
          gold: '#F59E0B'
        }
      },
      boxShadow: {
        'glass': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        'glass-sm': '0 8px 16px -4px rgba(0, 0, 0, 0.3)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)'
      }
    },
  },
  plugins: [],
};
