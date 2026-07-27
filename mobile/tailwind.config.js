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
        /* ── Uber Base Semantic Colors ── */
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-variant) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          onLight: 'rgb(var(--color-text-primary) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          light: 'rgb(var(--color-success-light) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          light: 'rgb(var(--color-warning-light) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          light: 'rgb(var(--color-error-light) / <alpha-value>)',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F6F6F6',
          100: '#F0F0F0',
          200: '#E2E2E2',
          300: '#CCCCCC',
          400: '#A0A0A0',
          500: '#545454',
          600: '#383838',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#0A0A0A',
          950: '#000000',
        },
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
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
        display: ['72px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        headline: ['32px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        title: ['24px', { lineHeight: '1.375', letterSpacing: '0em' }],
        subtitle: ['18px', { lineHeight: '1.5', letterSpacing: '0em' }],
        body: ['16px', { lineHeight: '1.625', letterSpacing: '0em' }],
        caption: ['12px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        button: ['16px', { lineHeight: '1.5', letterSpacing: '0em' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};