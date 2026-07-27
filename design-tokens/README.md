# 🎨 Taska Design System — `@taska/design-tokens`

A single source of truth for all visual primitives across Taska (mobile app, admin dashboard, and backend).

---

## Philosophy

- **Modern & Minimal** — Clean lines, purposeful whitespace, restrained use of color
- **Human-centered** — Accessible contrast ratios, generous touch targets, legible type
- **Premium & Professional** — Carefully crafted spacing, elevation, and motion that feel polished
- **Consistent** — Every pixel is derived from a token; no magic numbers

Design inspiration: Uber, Airbnb, Notion, Linear, Google Material 3.

---

## Color Palette

### Brand Colors

| Token        | Scale | Hex       | Usage                                  |
|-------------|-------|-----------|----------------------------------------|
| Primary     | 600   | `#2563EB` | Buttons, links, active states          |
| Success     | 500   | `#22C55E` | Confirmations, success states          |
| Warning     | 500   | `#F59E0B` | Alerts, cautionary states              |
| Error       | 500   | `#EF4444` | Errors, destructive actions            |

### Neutral Scale

| Token      | Scale | Hex       | Usage                         |
|------------|-------|-----------|-------------------------------|
| Background | 50    | `#F8FAFC` | Page backgrounds              |
| Surface    | 0     | `#FFFFFF` | Cards, modals, sheets         |
| Surface 2  | 100   | `#F1F5F9` | Secondary surfaces            |
| Text       | 900   | `#111827` | Primary text                  |
| Text 2     | 500   | `#6B7280` | Secondary/placeholder text    |
| Border     | 200   | `#E5E7EB` | Dividers, input borders       |

Each brand color has a full 10-stop scale (50–950) for fine-grained control.

---

## Typography

### Font Stack

```css
--font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
```

### Type Scale

| Style        | Size  | Weight   | Line Height | Usage                              |
|--------------|-------|----------|-------------|-------------------------------------|
| `display`    | 72px  | Bold     | 1.1         | Hero banners, splash pages         |
| `display-sm` | 60px  | Bold     | 1.1         | Section headers                    |
| `h1`         | 48px  | Bold     | 1.1         | Screen titles                      |
| `h2`         | 36px  | Bold     | 1.1         | Screen headers                     |
| `h3`         | 30px  | SemiBold | 1.375       | Section headers                    |
| `h4`         | 24px  | SemiBold | 1.375       | Card titles                        |
| `h5`         | 20px  | SemiBold | 1.5         | Subsection headers                 |
| `h6`         | 18px  | SemiBold | 1.5         | Small headers                      |
| `body-lg`    | 18px  | Regular  | 1.625       | Large body copy                    |
| `body`       | 16px  | Regular  | 1.625       | Default body                       |
| `body-sm`    | 14px  | Regular  | 1.5         | Secondary text                     |
| `caption`    | 12px  | Regular  | 1.5         | Labels, timestamps (letter-spaced) |
| `overline`   | 10px  | Medium   | 1.5         | Small labels (uppercase, wide)     |

### Font Weights

100–900 scale: Thin, ExtraLight, Light, Normal, Medium, SemiBold, Bold, ExtraBold, Black.

---

## Spacing

A 4px base unit with semantic aliases:

| Token | Pixels | Example                        |
|-------|--------|--------------------------------|
| none  | 0      |                                |
| xs    | 4      | Icons from text                |
| sm    | 8      | Stacked elements               |
| md    | 16     | Card padding, button gaps      |
| lg    | 24     | Section margins                |
| xl    | 32     | Screen edge padding (desktop)  |
| 2xl   | 48     | Large section gaps             |
| 3xl   | 64     | Hero spacing                   |
| 4xl   | 96     | Page-level separation          |

Screen padding adapts by device: 24px mobile, 32px tablet, 40px desktop.

---

## Border Radius

| Token  | Pixels | Usage                |
|--------|--------|----------------------|
| none   | 0      | Full-bleed elements  |
| xs     | 2      | Badges, small tags   |
| sm     | 4      | Inputs               |
| md     | 6      | Default              |
| lg     | 8      | Buttons, cards       |
| xl     | 12     | Elevated cards       |
| 2xl    | 16     | Modals, sheets       |
| 3xl    | 20     | Featured cards       |
| 4xl    | 24     | Large modals         |
| full   | 9999px | Chips, avatars       |

---

## Shadows & Elevation

| Token | Elevation | Y Offset | Blur | Opacity | Usage              |
|-------|-----------|----------|------|---------|--------------------|
| none  | 0         | 0        | 0    | 0       | Flat surfaces      |
| xs    | 1         | 1px      | 1px  | 0.05    | Subtle dividers    |
| sm    | 2         | 1px      | 2px  | 0.1     | Cards              |
| md    | 4         | 2px      | 4px  | 0.1     | Elevated cards     |
| lg    | 8         | 4px      | 8px  | 0.1     | Dropdowns, dialogs |
| xl    | 16        | 8px      | 16px | 0.15    | Modals, toasts     |
| 2xl   | 24        | 16px     | 32px | 0.15    | Full-screen sheets |

**Shadow color** uses `rgba(17, 24, 39, opacity)` — matching the darkest text color for a natural feel.

---

## Motion

### Duration

| Token    | ms   | Usage                         |
|----------|------|-------------------------------|
| instant  | 50   | Micro-interactions            |
| fast     | 100  | Hover, press feedback         |
| normal   | 200  | Standard transitions          |
| slow     | 300  | Panel open/close              |
| slower   | 400  | Page transitions              |
| slowest  | 500  | Emphasis, onboarding steps    |

### Easing

| Curve        | Cubic Bézier                      | Usage                        |
|--------------|-----------------------------------|------------------------------|
| linear       | `linear`                          | Progress bars                |
| easeIn       | `cubic-bezier(0.4, 0, 1, 1)`     | Elements leaving             |
| easeOut      | `cubic-bezier(0, 0, 0.2, 1)`     | Elements entering (default)  |
| easeInOut    | `cubic-bezier(0.4, 0, 0.2, 1)`   | Standard transitions         |
| emphasize    | `cubic-bezier(0.2, 0, 0, 1)`     | Hero animations              |
| spring       | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Bouncy UI |

---

## Icon Sizes

| Token   | px  | Usage                     |
|---------|-----|---------------------------|
| xs      | 12  | Badges, inline indicators |
| sm      | 16  | Inline with text          |
| md      | 20  | Action icons              |
| lg      | 24  | Button icons, nav items   |
| xl      | 28  | Large buttons             |
| 2xl     | 32  | Tab bar                   |
| 3xl     | 40  | Section illustrations     |
| 4xl     | 48  | Avatars                   |
| 5xl     | 56  | Large illustrations       |
| 6xl     | 64  | Empty states              |

---

## Button Sizes

| Token | Height | H-Padding | Font Size | Icon Size | Radius | Min Width |
|-------|--------|-----------|-----------|-----------|--------|-----------|
| xs    | 28px   | 10px      | 12px      | 14px      | 6px    | 48px      |
| sm    | 34px   | 14px      | 14px      | 16px      | 8px    | 64px      |
| md    | 42px   | 18px      | 15px      | 18px      | 10px   | 80px      |
| lg    | 50px   | 24px      | 16px      | 20px      | 12px   | 96px      |
| xl    | 58px   | 30px      | 18px      | 22px      | 14px   | 112px     |

---

## Input Sizes

| Token | Height | H-Padding | Font | Radius | Label |
|-------|--------|-----------|------|--------|-------|
| sm    | 34px   | 12px      | 14px | 8px    | 12px  |
| md    | 44px   | 14px      | 15px | 10px   | 13px  |
| lg    | 52px   | 16px      | 16px | 12px   | 14px  |

Textarea and select variants follow the same sizing convention.

---

## Dark Mode

Every semantic color has a corresponding dark-mode value (activated by the `.dark` class or `prefers-color-scheme: dark`). The dark palette:

- **Backgrounds** shift to neutral.950 (`#030712`) and neutral.800 (`#1F2937`)
- **Text** becomes neutral.50 (`#F9FAFB`) / neutral.400 (`#9CA3AF`)
- **Brand colors** brighten one scale step (primary.400, success.400, etc.)
- **Shadows** use black at higher opacity for depth

---

## Usage

### In TypeScript / React Native

```ts
import { spacing, borderRadius, semanticColor } from '@taska/design-tokens';

const style = {
  padding: spacing[4],           // 16px
  borderRadius: borderRadius.xl, // 12px
  backgroundColor: semanticColor.light.surface.primary,
};
```

### In Tailwind CSS (Mobile – NativeWind)

Tokens are already mapped in `mobile/tailwind.config.js`. Use utility classes:

```html
<View className="bg-surface p-md rounded-xl shadow-sm">
  <Text className="text-text-primary text-body font-semibold">Hello</Text>
</View>
```

### In Tailwind CSS (Admin Dashboard)

Tokens are mapped in `admin/tailwind.config.js`. Use color scales directly:

```html
<div className="bg-neutral-50 p-6 rounded-xl shadow-card border border-neutral-200">
  <h1 className="text-primary-600 font-bold">Dashboard</h1>
</div>
```

### CSS Custom Properties

Import the generated CSS file to use tokens in any web context:

```css
@import '@taska/design-tokens/css';
```

```css
.my-element {
  padding: var(--spacing-4);
  border-radius: var(--radius-xl);
  background: var(--color-primary-600);
}
```

---

## File Structure

```
design-tokens/
├── src/
│   ├── colors.ts           # Raw color scales (primary, success, warning, error, neutral)
│   ├── semantic-colors.ts   # Light/dark semantic color mappings
│   ├── typography.ts        # Type scale, weights, line-height, letter-spacing, text styles
│   ├── spacing.ts           # Spacing scale + semantic + screen padding
│   ├── border-radius.ts     # Border radius scale + semantic
│   ├── shadows.ts           # Shadows + elevation + semantic elevation
│   ├── icon-sizes.ts        # Icon sizes + semantic
│   ├── button-sizes.ts      # Button dimension tokens
│   ├── input-sizes.ts       # Input, textarea, select sizes
│   ├── motion.ts            # Animation durations, easings, opacity, z-index
│   ├── component-tokens.ts  # Component-level tokens (cards, etc.)
│   ├── css/                 # CSS variable generator
│   │   ├── index.ts
│   │   └── generator.ts
│   └── index.ts             # Re-exports everything
├── scripts/
│   └── generate-css.ts      # CLI script to produce tokens.css
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development

```bash
# Build the TypeScript
npm run build

# Generate CSS custom properties
npm run generate:css

# Watch mode
npm run dev
```
