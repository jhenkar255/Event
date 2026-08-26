/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../shared/**/*.{js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Indian Cultural Design System Palette
        utsav: {
          maroon: {
            DEFAULT: '#7A1F2B',
            50: '#FDF2F4',
            100: '#FBE6E9',
            200: '#F6CED4',
            300: '#EEA1AC',
            400: '#E16C7F',
            500: '#CF3E55',
            600: '#B2273D',
            700: '#8E1D2E',
            800: '#7A1F2B', // Primary Brand Deep Maroon
            900: '#5C141F',
            950: '#38070E',
          },
          saffron: {
            DEFAULT: '#F4A340', // Royal Saffron
            50: '#FFF9ED',
            100: '#FEF2D5',
            200: '#FDE3A9',
            300: '#FBCE73',
            400: '#F7B442',
            500: '#F4A340',
            600: '#D97E1B',
            700: '#B45E13',
            800: '#904915',
            900: '#763C15',
          },
          gold: {
            DEFAULT: '#C9A227', // Antique Gold
            50: '#FAF7EA',
            100: '#F3EDC9',
            200: '#E8DC96',
            300: '#DAC662',
            400: '#C9A227',
            500: '#A98418',
            600: '#866412',
            700: '#644810',
            800: '#4D3610',
            900: '#3D2A10',
          },
          ivory: {
            DEFAULT: '#FFF8EC', // Warm Ivory Background
            50: '#FFFFFF',
            100: '#FFFDF9',
            200: '#FFF8EC',
            300: '#FDF2DD',
            400: '#FCEBCB',
            500: '#F5EBDD', // Light Beige
          },
          beige: {
            DEFAULT: '#F5EBDD',
            50: '#FCF9F5',
            100: '#FAF5EE',
            200: '#F5EBDD',
            300: '#EBDBC5',
            400: '#DEC6A6',
          },
          brown: {
            DEFAULT: '#2B2118', // Dark Brown Text
            50: '#F6F5F4',
            100: '#E8E5E2',
            200: '#D2CCC6',
            300: '#B4ABA2',
            400: '#7B7166',
            500: '#5A5046',
            600: '#443A31',
            700: '#372E26',
            800: '#2B2118',
            900: '#1F1710',
            950: '#120C07',
          },
        },
      },
      fontFamily: {
        heading: ['"Cinzel Decorative"', '"Rozha One"', '"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['"Rozha One"', '"Cinzel Decorative"', 'serif'],
      },
      backgroundImage: {
        'mandala-pattern': "radial-gradient(circle at center, rgba(201, 162, 39, 0.08) 0, rgba(201, 162, 39, 0) 70%)",
        'diya-glow': 'radial-gradient(ellipse at top, rgba(244, 163, 64, 0.15), transparent 70%)',
      },
      animation: {
        'diya-flicker': 'diyaFlicker 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        diyaFlicker: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        pulseGold: {
          '0%, 100%': { borderColor: 'rgba(201, 162, 39, 0.4)', boxShadow: '0 0 15px rgba(201, 162, 39, 0.2)' },
          '50%': { borderColor: 'rgba(201, 162, 39, 0.8)', boxShadow: '0 0 25px rgba(201, 162, 39, 0.4)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
