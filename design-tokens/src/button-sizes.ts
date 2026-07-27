export const buttonSize = {
  sm: {
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 8,
    gap: 4,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 10,
    gap: 8,
  },
  lg: {
    height: 56,
    paddingHorizontal: 28,
    paddingVertical: 12,
    fontSize: 16,
    iconSize: 24,
    borderRadius: 12,
    gap: 8,
  },
} as const;

export const buttonMinWidth = {
  sm: 48,
  md: 80,
  lg: 96,
} as const;

export type ButtonSizeName = keyof typeof buttonSize;