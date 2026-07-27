export const inputSize = {
  md: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 10,
    labelFontSize: 14,
    helperFontSize: 12,
  },
  lg: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    iconSize: 24,
    borderRadius: 12,
    labelFontSize: 14,
    helperFontSize: 13,
  },
} as const;

export const textAreaSize = {
  md: {
    height: 100,
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 10,
  },
  lg: {
    height: 120,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 12,
  },
} as const;

export const selectSize = {
  md: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 10,
  },
  lg: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    iconSize: 24,
    borderRadius: 12,
  },
} as const;

export type InputSizeName = keyof typeof inputSize;
export type TextAreaSizeName = keyof typeof textAreaSize;
export type SelectSizeName = keyof typeof selectSize;