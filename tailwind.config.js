/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          primary: '#0D0D0D',
          secondary: '#1A1A1A',
          tertiary: '#252525',
        },
        // Border colors
        border: {
          DEFAULT: '#2A2A2A',
          light: '#333333',
        },
        // Accent colors
        accent: {
          primary: '#00D166',
          gold: '#F59E0B',
          red: '#EF4444',
        },
        // Text colors
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF',
          tertiary: '#6B7280',
          muted: '#4B5563',
        },
        // Status colors
        success: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        // Gradient colors
        gradient: {
          purple: '#A855F7',
          pink: '#EC4899',
          orange: '#F97316',
          yellow: '#FACC15',
          cyan: '#22D3EE',
          emerald: '#10B981',
          violet: '#8B5CF6',
        },
        // AI colors (Apple Intelligence style)
        ai: {
          cyan: '#67E8F9',
          blue: '#60A5FA',
          violet: '#A78BFA',
          purple: '#C084FC',
          pink: '#F472B6',
          orange: '#FB923C',
        },
        // Special colors
        live: '#FF4757',
        premium: '#FFD700',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        // Display sizes
        'display-lg': ['32px', { lineHeight: '40px', fontWeight: '800', letterSpacing: '-0.5px' }],
        'display-md': ['28px', { lineHeight: '36px', fontWeight: '800', letterSpacing: '-0.5px' }],
        'display-sm': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.25px' }],
        // Headline sizes
        'headline-lg': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '26px', fontWeight: '700' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        // Title sizes
        'title-lg': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'title-md': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'title-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        // Body sizes
        'body-lg': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        // Label sizes
        'label-lg': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.5px' }],
        'label-md': ['11px', { lineHeight: '14px', fontWeight: '500', letterSpacing: '0.5px' }],
        'label-sm': ['10px', { lineHeight: '12px', fontWeight: '500', letterSpacing: '0.5px' }],
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      minHeight: {
        'touch': '44px',
        'button-sm': '32px',
        'button-md': '40px',
        'button-lg': '48px',
        'button-xl': '56px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
