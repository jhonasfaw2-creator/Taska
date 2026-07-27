export const buttonSize = {
  xs: {
    height: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    iconSize: 14,
    borderRadius: 6,
    gap: 4,
  },
  sm: {
    height: 34,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 8,
    gap: 6,
  },
  md: {
    height: 42,
    paddingHorizontal: 18,
    paddingVertical: 8,
    fontSize: 15,
    iconSize: 18,
    borderRadius: 10,
    gap: 8,
  },
  lg: {
    height: 50,
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 12,
    gap: 8,
  },
  xl: {
    height: 58,
    paddingHorizontal: 30,
    paddingVertical: 14,
    fontSize: 18,
    iconSize: 22,
    borderRadius: 14,
    gap: 10,
  },
} as const;

export const buttonMinWidth = {
  xs: 48,
  sm: 64,
  md: 80,
  lg: 96,
  xl: 112,
} as const;

export type ButtonSizeName = keyof typeof buttonSize;