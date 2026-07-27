import { borderRadiusSemantic } from './border-radius';
import { buttonSize } from './button-sizes';
import { spacingSemantic } from './spacing';

export const cardTokens = {
  padding: {
    sm: spacingSemantic.sm,
    md: spacingSemantic.md,
    lg: spacingSemantic.lg,
  },
  borderRadius: borderRadiusSemantic.card,
  elevatedBorderRadius: borderRadiusSemantic['2xl'],
} as const;