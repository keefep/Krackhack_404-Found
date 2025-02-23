import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'SF Pro Text',
    medium: 'SF Pro Text Medium',
    semibold: 'SF Pro Text Semibold',
    bold: 'SF Pro Text Bold',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium', // Android doesn't have semibold
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

// Scale factor for responsive typography
const scale = 1;

export const typography = {
  fonts: fontFamily,

  // Font sizes
  sizes: {
    xs: 12 * scale,
    sm: 14 * scale,
    base: 16 * scale,
    lg: 18 * scale,
    xl: 20 * scale,
    '2xl': 24 * scale,
    '3xl': 30 * scale,
    '4xl': 36 * scale,
    '5xl': 48 * scale,
    '6xl': 60 * scale,
  },

  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },

  // Predefined text styles
  variants: {
    h1: {
      fontSize: 36 * scale,
      lineHeight: 1.25,
      fontFamily: fontFamily.bold,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 30 * scale,
      lineHeight: 1.3,
      fontFamily: fontFamily.bold,
      letterSpacing: -0.4,
    },
    h3: {
      fontSize: 24 * scale,
      lineHeight: 1.35,
      fontFamily: fontFamily.semibold,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20 * scale,
      lineHeight: 1.4,
      fontFamily: fontFamily.semibold,
      letterSpacing: -0.2,
    },
    subtitle1: {
      fontSize: 18 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.medium,
      letterSpacing: 0,
    },
    subtitle2: {
      fontSize: 16 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.medium,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.regular,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.regular,
      letterSpacing: 0,
    },
    button: {
      fontSize: 16 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.medium,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: 12 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.regular,
      letterSpacing: 0.4,
    },
    overline: {
      fontSize: 12 * scale,
      lineHeight: 1.5,
      fontFamily: fontFamily.medium,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export type Typography = typeof typography;
