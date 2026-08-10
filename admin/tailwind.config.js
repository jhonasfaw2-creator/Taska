/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Uber Base Semantic Colors ── */
        primary: {
          DEFAULT: '#000000',
          hover: '#1F1F1F',
          active: '#333333',
          light: '#F3F3F3',
          lightHover: '#E8E8E8',
        },
        success: {
          DEFAULT: '#05A357',
          hover: '#048A4A',
          light: '#E8F8EF',
          lightHover: '#D4F0E0',
        },
        warning: {
          DEFAULT: '#FFC043',
          hover: '#E6A830',
          light: '#FFF8E8',
          lightHover: '#FFF0CC',
        },
        error: {
          DEFAULT: '#E11900',
          hover: '#C71700',
          light: '#FFF0EB',
          lightHover: '#FFE0D6',
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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        display: ['72px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        headline: ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        title: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        subtitle: ['18px', { lineHeight: '1.5', letterSpacing: '0em' }],
        body: ['16px', { lineHeight: '1.625', letterSpacing: '0em' }],
        caption: ['12px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        button: ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
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
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        md: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        xl: '0 8px 16px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};