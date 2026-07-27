export const inputSize = {
  sm: {
    height: 34,
    paddingHorizontal: 12,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 8,
    labelFontSize: 12,
    helperFontSize: 11,
  },
  md: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 15,
    iconSize: 18,
    borderRadius: 10,
    labelFontSize: 13,
    helperFontSize: 12,
  },
  lg: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 12,
    labelFontSize: 14,
    helperFontSize: 13,
  },
} as const;

export const textAreaSize = {
  sm: {
    height: 80,
    minHeight: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 8,
  },
  md: {
    height: 100,
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
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
  sm: {
    height: 34,
    paddingHorizontal: 12,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 8,
  },
  md: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 15,
    iconSize: 18,
    borderRadius: 10,
  },
  lg: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 12,
  },
} as const;

export type InputSizeName = keyof typeof inputSize;
export type TextAreaSizeName = keyof typeof textAreaSize;
export type SelectSizeName = keyof typeof selectSize;