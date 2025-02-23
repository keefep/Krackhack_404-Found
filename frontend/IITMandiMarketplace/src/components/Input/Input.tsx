import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { pressAnimation } from '../../utils/animations';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  helperStyle?: TextStyle;
  required?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  containerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  required,
  startAdornment,
  endAdornment,
  onFocus,
  onBlur,
  value,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const animation = useSharedValue(value ? 1 : 0);

  const handleFocus = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    animation.value = pressAnimation.press(1);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (!value) {
      animation.value = pressAnimation.release(0);
    }
    onBlur?.(e);
  }, [onBlur, value]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animation.value,
      [0, 1],
      [0, -theme.spacing.components.inputPadding * 1.5],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      animation.value,
      [0, 1],
      [1, 0.75],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  const getBorderColor = () => {
    if (error) return theme.colors.error.main;
    if (isFocused) return theme.colors.primary.main;
    return theme.colors.border.main;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.spacing.radius.md,
      backgroundColor: theme.colors.background.paper,
      overflow: 'hidden',
    },
    inputWrapper: {
      flex: 1,
      paddingVertical: theme.spacing.components.inputPadding,
    },
    input: {
      ...theme.typography.variants.body1,
      color: theme.colors.text.primary,
      paddingHorizontal: theme.spacing.components.inputPadding,
      paddingTop: theme.spacing.xs,
      height: theme.spacing.heights.input,
    },
    label: {
      position: 'absolute',
      left: theme.spacing.components.inputPadding,
      color: theme.colors.text.secondary,
      backgroundColor: 'transparent',
      ...theme.typography.variants.body1,
    },
    helper: {
      ...theme.typography.variants.caption,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.components.inputPadding,
    },
    error: {
      color: theme.colors.error.main,
    },
    errorLabel: {
      color: theme.colors.error.main,
    },
    required: {
      color: theme.colors.error.main,
    },
    adornment: {
      paddingHorizontal: theme.spacing.components.iconPadding,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        {
          borderColor: getBorderColor(),
          borderWidth: isFocused ? 2 : 1,
        },
      ]}>
        {startAdornment && (
          <View style={styles.adornment}>
            {startAdornment}
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              labelAnimatedStyle,
              labelStyle,
              error && styles.errorLabel,
            ]}
          >
            {label}{required && <Text style={styles.required}> *</Text>}
          </Animated.Text>

          <TextInput
            style={[
              styles.input,
              inputStyle,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            placeholderTextColor={theme.colors.text.hint}
            {...props}
          />
        </View>

        {endAdornment && (
          <View style={styles.adornment}>
            {endAdornment}
          </View>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helper,
            helperStyle,
            error && styles.error,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};
