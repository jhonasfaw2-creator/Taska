export const color = {
  primary: {
    base: '#000000',
    hover: '#1F1F1F',
    active: '#333333',
    light: '#F3F3F3',
    lightHover: '#E8E8E8',
    onLight: '#000000',
  },
  success: {
    base: '#05A357',
    hover: '#048A4A',
    active: '#03703D',
    light: '#E8F8EF',
    lightHover: '#D4F0E0',
    onSuccess: '#FFFFFF',
  },
  warning: {
    base: '#FFC043',
    hover: '#E6A830',
    active: '#CC9420',
    light: '#FFF8E8',
    lightHover: '#FFF0CC',
    onWarning: '#1A1A1A',
  },
  error: {
    base: '#E11900',
    hover: '#C71700',
    active: '#AD1400',
    light: '#FFF0EB',
    lightHover: '#FFE0D6',
    onError: '#FFFFFF',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F6F6F6',
    100: '#F0F0F0',
    200: '#E2E2E2',
    300: '#CCCCCC',
    400: '#A0A0A0',
    500: '#545454',
    600: '#383838',
    700: '#2A2A2A',
    800: '#1A1A1A',
    900: '#0A0A0A',
    950: '#000000',
  },
} as const;

export type ColorScale = keyof typeof color.primary;
export type ColorName = keyof typeof color;