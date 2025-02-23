import { MD3Theme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

export interface CustomTheme extends MD3Theme {
  customColors: typeof colors;
  customTypography: typeof typography;
  customSpacing: typeof spacing;
  shadows: typeof shadows;
}

declare global {
  namespace ReactNativePaper {
    interface Theme extends CustomTheme {}
  }
}
