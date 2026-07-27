/**
 * Generates a complete CSS custom-properties string from all design tokens.
 * Used by both the CLI script and any runtime CSS-in-JS solutions.
 */

import { color, semanticColor, spacing, borderRadius, shadow, animation, opacity, zIndex, fontSize, fontWeight, fontFamily } from '../index.js';

type NestedRecord = Record<string, string | number | NestedRecord>;

function flatten(obj: NestedRecord, prefix: string): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [key, val] of Object.entries(obj)) {
    const k = `${prefix}-${key}`;
    if (typeof val === 'string' || typeof val === 'number') {
      pairs.push([k, String(val)]);
    } else if (typeof val === 'object' && val !== null) {
      pairs.push(...flatten(val as NestedRecord, k));
    }
  }
  return pairs;
}

export function generateCssVariables(): string {
  const lines: string[] = [
    '/*',
    ' * Taska Design Tokens — Auto-generated.',
    ' * Source: design-tokens/src/',
    ' */',
    '',
  ];

  /* ── Color raw scales ────────────────────────────────── */
  const colorScales = ['primary', 'success', 'warning', 'error'] as const;
  for (const name of colorScales) {
    for (const [scale, hex] of Object.entries(color[name])) {
      lines.push(`--color-${name}-${scale}: ${hex};`);
    }
  }
  for (const [scale, hex] of Object.entries(color.neutral)) {
    const label = scale === '0' ? 'white' : scale;
    lines.push(`--color-neutral-${label}: ${hex};`);
  }

  /* ── Semantic (light) ────────────────────────────────── */
  lines.push('');
  lines.push('/* Light mode semantic colors */');
  for (const [key, val] of flatten(semanticColor.light as unknown as NestedRecord, '--semantic')) {
    lines.push(`${key}: ${val};`);
  }

  lines.push('');
  lines.push('/* Dark mode semantic colors */');
  for (const [key, val] of flatten(semanticColor.dark as unknown as NestedRecord, '--semantic')) {
    lines.push(`@media (prefers-color-scheme: dark) { ${key}: ${val}; }`);
  }

  /* ── Spacing ─────────────────────────────────────────── */
  lines.push('');
  lines.push('/* Spacing */');
  for (const [key, val] of Object.entries(spacing)) {
    lines.push(`--spacing-${key}: ${val}px;`);
  }

  /* ── Border radius ───────────────────────────────────── */
  lines.push('');
  lines.push('/* Border radius */');
  for (const [key, val] of Object.entries(borderRadius)) {
    const k = key === 'none' ? null : key;
    lines.push(`--radius-${key}: ${val}px;`);
  }

  /* ── Typography ──────────────────────────────────────── */
  lines.push('');
  lines.push('/* Typography */');
  lines.push(`--font-sans: ${fontFamily.sans.join(', ')};`);
  lines.push(`--font-mono: ${fontFamily.mono.join(', ')};`);
  for (const [key, val] of Object.entries(fontSize)) {
    const f = val as { size: number; lineHeight: number; letterSpacing: string };
    lines.push(`--font-size-${key}: ${f.size}px;`);
    lines.push(`--line-height-${key}: ${f.lineHeight};`);
    lines.push(`--letter-spacing-${key}: ${f.letterSpacing};`);
  }
  for (const [key, val] of Object.entries(fontWeight)) {
    lines.push(`--font-weight-${key}: ${val};`);
  }

  /* ── Shadows ─────────────────────────────────────────── */
  lines.push('');
  lines.push('/* Shadows & Elevation */');
  for (const [key, val] of Object.entries(shadow)) {
    const s = val as { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
    lines.push(`--shadow-${key}-color: ${s.shadowColor};`);
    lines.push(`--shadow-${key}-offset-x: ${s.shadowOffset.width}px;`);
    lines.push(`--shadow-${key}-offset-y: ${s.shadowOffset.height}px;`);
    lines.push(`--shadow-${key}-opacity: ${s.shadowOpacity};`);
    lines.push(`--shadow-${key}-radius: ${s.shadowRadius}px;`);
    lines.push(`--shadow-${key}-elevation: ${s.elevation};`);
  }

  /* ── Motion ──────────────────────────────────────────── */
  lines.push('');
  lines.push('/* Motion */');
  for (const [key, val] of Object.entries(animation.duration)) {
    lines.push(`--duration-${key}: ${val}ms;`);
  }
  for (const [key, val] of Object.entries(animation.easing)) {
    lines.push(`--easing-${key}: ${val};`);
  }
  for (const [key, val] of Object.entries(opacity)) {
    lines.push(`--opacity-${key}: ${val};`);
  }
  for (const [key, val] of Object.entries(zIndex)) {
    lines.push(`--z-${key}: ${val};`);
  }

  return `:root {\n${lines.map((l) => (l.startsWith('@media') || l.startsWith('/*') || l === '' ? l : `  ${l}`)).join('\n')}\n}`;
}

export function generateCssFile(): string {
  return generateCssVariables();
}
