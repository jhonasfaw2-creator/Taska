/**
 * Generates a CSS custom-properties file from the design tokens.
 * Run with: `npm run generate:css`
 * Produces: dist/css/tokens.css
 *
 * This file is consumed by the admin dashboard (Vite) and any future
 * browser-rendered surfaces so they share a single source of truth.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { color, semanticColor, spacing, borderRadius, shadow, animation, opacity, zIndex, fontSize, fontWeight, fontFamily } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'dist', 'css', 'tokens.css');

const lines: string[] = [
  '/*',
  ' * Taska Design Tokens — Auto-generated. Do not edit directly.',
  ' * Source: design-tokens/src/',
  ' */',
  '',
  ':root {',
];

/* ── Color scales ─────────────────────────────────────────── */
const colorNames = ['primary', 'success', 'warning', 'error'] as const;
for (const name of colorNames) {
  for (const [scale, hex] of Object.entries(color[name])) {
    lines.push(`  --color-${name}-${scale}: ${hex};`);
  }
}

for (const [scale, hex] of Object.entries(color.neutral)) {
  const label = scale === '0' ? 'white' : scale;
  lines.push(`  --color-neutral-${label}: ${hex};`);
}

/* ── Semantic colors (light) ──────────────────────────────── */
const flatten = (obj: Record<string, unknown>, prefix: string): void => {
  for (const [key, val] of Object.entries(obj)) {
    const k = `${prefix}-${key}`;
    if (typeof val === 'string') {
      lines.push(`  ${k}: ${val};`);
    } else if (typeof val === 'object' && val !== null) {
      flatten(val as Record<string, unknown>, k);
    }
  }
};

flatten(semanticColor.light, '--');

lines.push('');

/* ── Dark overrides ────────────────────────────────────────── */
lines.push('  /* ── Dark mode ── */');
for (const [key, val] of Object.entries(Object(semanticColor).dark)) {
  // Generate dark-specific overrides as separate selectors below
}

lines.push('}');
lines.push('');

/* Dark mode */
lines.push('.dark {');
flatten(semanticColor.dark, '--');
lines.push('}');
lines.push('');

/* ── Spacing ───────────────────────────────────────────────── */
lines.push(':root {');
for (const [key, val] of Object.entries(spacing)) {
  lines.push(`  --spacing-${key}: ${val}px;`);
}
lines.push('}');
lines.push('');

/* ── Border radius ─────────────────────────────────────────── */
lines.push(':root {');
for (const [key, val] of Object.entries(borderRadius)) {
  lines.push(`  --radius-${key}: ${val}px;`);
}
lines.push('}');
lines.push('');

/* ── Typography ────────────────────────────────────────────── */
lines.push(':root {');
lines.push(`  --font-sans: ${fontFamily.sans.join(', ')};`);
lines.push(`  --font-mono: ${fontFamily.mono.join(', ')};`);
for (const [key, val] of Object.entries(fontSize)) {
  const f = val as { size: number; lineHeight: number; letterSpacing: string };
  lines.push(`  --font-size-${key}: ${f.size}px;`);
  lines.push(`  --line-height-${key}: ${f.lineHeight};`);
  lines.push(`  --letter-spacing-${key}: ${f.letterSpacing};`);
}
for (const [key, val] of Object.entries(fontWeight)) {
  lines.push(`  --font-weight-${key}: ${val};`);
}
lines.push('}');
lines.push('');

/* ── Shadows & Elevation ──────────────────────────────────── */
lines.push(':root {');
for (const [key, val] of Object.entries(shadow)) {
  const s = val as { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
  lines.push(`  --shadow-${key}-color: ${s.shadowColor};`);
  lines.push(`  --shadow-${key}-offset-x: ${s.shadowOffset.width}px;`);
  lines.push(`  --shadow-${key}-offset-y: ${s.shadowOffset.height}px;`);
  lines.push(`  --shadow-${key}-opacity: ${s.shadowOpacity};`);
  lines.push(`  --shadow-${key}-radius: ${s.shadowRadius}px;`);
  lines.push(`  --shadow-${key}-elevation: ${s.elevation};`);
}
lines.push('}');
lines.push('');

/* ── Motion ───────────────────────────────────────────────── */
lines.push(':root {');
for (const [key, val] of Object.entries(animation.duration)) {
  lines.push(`  --duration-${key}: ${val}ms;`);
}
for (const [key, val] of Object.entries(animation.easing)) {
  lines.push(`  --easing-${key}: ${val};`);
}
for (const [key, val] of Object.entries(opacity)) {
  lines.push(`  --opacity-${key}: ${val};`);
}
for (const [key, val] of Object.entries(zIndex)) {
  lines.push(`  --z-${key}: ${val};`);
}
lines.push('}');

/* ── Write ─────────────────────────────────────────────────── */
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, lines.join('\n'), 'utf-8');
console.log(`✓ CSS tokens written to ${OUT}`);
