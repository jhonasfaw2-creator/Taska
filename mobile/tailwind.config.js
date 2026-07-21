/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          variant: 'rgb(var(--color-primary-variant) / <alpha-value>)',
        },
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        'screen-padding': '24px',
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.2' }],
        h1: ['32px', { lineHeight: '1.2' }],
        h2: ['24px', { lineHeight: '1.2' }],
        body: ['16px', { lineHeight: '1.5' }],
        caption: ['12px', { lineHeight: '1.5' }],
      },
      fontFamily: {
        sans: ['System', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};