/**
 * Taska Tailwind Configuration
 *
 * Design tokens mapped to Tailwind utilities.
 * Matches the design-tokens package for consistency.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────
      colors: {
        // Primary — Blue #2563EB
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          DEFAULT: '#2563EB',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          hover: '#1D4ED8',
          active: '#1E40AF',
          light: '#EFF6FF',
          'light-hover': '#DBEAFE',
          'on-light': '#1E40AF',
        },

        // Success — Green #22C55E
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          DEFAULT: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          hover: '#16A34A',
          light: '#F0FDF4',
          'on-success': '#FFFFFF',
        },

        // Warning — Amber #F59E0B
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          DEFAULT: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          hover: '#D97706',
          light: '#FFFBEB',
          'on-warning': '#78350F',
        },

        // Error — Red #EF4444
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          DEFAULT: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          hover: '#DC2626',
          light: '#FEF2F2',
          'on-error': '#FFFFFF',
        },

        // Neutral — Slate
        neutral: {
          0: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#6B7280',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },

        // Semantic (CSS variable based for dark mode)
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          secondary: 'rgb(var(--color-background-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-background-tertiary) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          secondary: 'rgb(var(--color-surface-secondary) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          secondary: 'rgb(var(--color-border-secondary) / <alpha-value>)',
          focus: 'rgb(var(--color-border-focus) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
          inverse: 'rgb(var(--color-text-inverse) / <alpha-value>)',
          disabled: 'rgb(var(--color-text-disabled) / <alpha-value>)',
          link: 'rgb(var(--color-text-link) / <alpha-value>)',
        },
        overlay: {
          DEFAULT: 'rgb(var(--color-overlay) / <alpha-value>)',
          modal: 'rgb(var(--color-overlay-modal) / <alpha-value>)',
        },
      },

      // ── Border Radius ───────────────────────────────────────
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        full: '9999px',
      },

      // ── Spacing ─────────────────────────────────────────────
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',

        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        'screen-padding': '24px',
      },

      // ── Typography ──────────────────────────────────────────
      fontSize: {
        // Display
        'display-2xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-xl': ['60px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-lg': ['48px', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        'display-md': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['30px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'display-xs': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],

        // Headings
        h1: ['30px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        h2: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h3: ['20px', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        h4: ['18px', { lineHeight: '1.4', letterSpacing: '0em' }],
        h5: ['16px', { lineHeight: '1.45', letterSpacing: '0em' }],
        h6: ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],

        // Body
        'body-xl': ['20px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body-lg': ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body-md': ['16px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'body-xs': ['12px', { lineHeight: '1.5', letterSpacing: '0.01em' }],

        // Labels
        'label-lg': ['16px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'label-md': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'label-xs': ['11px', { lineHeight: '1.5', letterSpacing: '0.02em' }],

        // Legacy (backward compatibility)
        body: ['16px', { lineHeight: '1.625', letterSpacing: '0em' }],
        caption: ['12px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        button: ['16px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'Monaco', 'monospace'],
      },

      // ── Shadows ─────────────────────────────────────────────
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        md: '0 2px 4px 0 rgba(15, 23, 42, 0.06)',
        lg: '0 4px 8px 0 rgba(15, 23, 42, 0.08)',
        xl: '0 8px 16px 0 rgba(15, 23, 42, 0.10)',
        '2xl': '0 16px 24px 0 rgba(15, 23, 42, 0.12)',
      },

      // ── Animation ───────────────────────────────────────────
      transitionDuration: {
        instant: '0ms',
        fastest: '50ms',
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
        slower: '400ms',
        slowest: '500ms',
      },

      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      // ── Opacity ─────────────────────────────────────────────
      opacity: {
        transparent: 0,
        disabled: 0.4,
        pressed: 0.8,
        hover: 0.9,
        skeleton: 0.6,
        overlay: 0.5,
      },
    },
  },
  plugins: [],
};
