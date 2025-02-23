import React from 'react';
import { StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '../../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const baseStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.spacing.radius.md,
      padding: theme.spacing.sm,
      ...theme.shadows.sm,
    },
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[baseStyles.container, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
