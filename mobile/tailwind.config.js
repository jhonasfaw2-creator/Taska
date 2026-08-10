/**
 * Taska Tailwind Configuration
 *
 * Tailwind v4 is CSS-first: all design tokens live in `global.css`
 * under `@theme` (single source of truth). This file only declares
 * the content sources scanned for utility class usage.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
};
