import { ViewStyle } from 'react-native';
import { colors } from './colors';

interface Shadow {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (height: number, opacity: number): Shadow => ({
  shadowColor: colors.neutral[900],
  shadowOffset: {
    width: 0,
    height,
  },
  shadowOpacity: opacity,
  shadowRadius: height * 2,
  elevation: height * 2,
});

export const shadows = {
  none: {},
  xs: createShadow(1, 0.1),
  sm: createShadow(2, 0.15),
  md: createShadow(4, 0.2),
  lg: createShadow(8, 0.25),
  xl: createShadow(12, 0.3),
} satisfies Record<string, ViewStyle>;
