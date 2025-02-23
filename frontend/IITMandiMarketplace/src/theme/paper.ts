import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import type { CustomTheme } from './types';

export const paperTheme: CustomTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    error: colors.error.main,
    errorContainer: colors.error.light,
    background: colors.background.default,
    surface: colors.background.paper,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    outline: colors.border.main,
    onPrimary: colors.primary.contrast,
    onSecondary: colors.secondary.contrast,
    onError: colors.error.contrast,
  },
  // Add our custom theme properties
  customColors: colors,
  customTypography: typography,
  customSpacing: spacing,
  shadows: shadows,
};
