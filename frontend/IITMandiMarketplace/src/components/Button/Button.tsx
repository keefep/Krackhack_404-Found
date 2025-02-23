import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { pressAnimation } from '../../utils/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.neutral[300];
    switch (variant) {
      case 'primary':
        return theme.colors.primary.main;
      case 'secondary':
        return theme.colors.secondary.main;
      case 'outlined':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary.main;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.neutral[300];
    switch (variant) {
      case 'outlined':
        return theme.colors.primary.main;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.neutral[500];
    switch (variant) {
      case 'primary':
        return theme.colors.primary.contrast;
      case 'secondary':
        return theme.colors.secondary.contrast;
      case 'outlined':
      case 'text':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.contrast;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return theme.spacing.components.buttonPadding - 4;
      case 'large':
        return theme.spacing.components.buttonPadding + 4;
      default:
        return theme.spacing.components.buttonPadding;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (!disabled && !loading) {
      scale.value = withSequence(
        pressAnimation.press(0.95),
        pressAnimation.release(1)
      );
      runOnJS(onPress)();
    }
  };

  const styles = StyleSheet.create({
    button: {
      borderRadius: theme.spacing.radius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      elevation: 2,
      shadowColor: theme.colors.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    text: {
      ...theme.typography.variants.button,
      textAlign: 'center',
    },
  });

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      padding: getPadding(),
      width: fullWidth ? '100%' : 'auto',
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
    },
    textStyle,
  ];

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[buttonStyles, animatedStyle]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};
