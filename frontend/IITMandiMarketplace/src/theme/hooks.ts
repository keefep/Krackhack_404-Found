import { useTheme as usePaperTheme } from 'react-native-paper';
import type { CustomTheme } from './types';

export const useTheme = () => {
  const theme = usePaperTheme<CustomTheme>();
  
  return {
    ...theme,
    colors: theme.customColors,
    typography: theme.customTypography,
    spacing: theme.customSpacing,
    shadows: theme.shadows,
  };
};

// Types for components to use
export type Theme = ReturnType<typeof useTheme>;
