import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialCommunityIcons as IconType } from '@expo/vector-icons';

type ButtonVariant = 'contained' | 'outlined' | 'text';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'contained',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'text':
        return {
          button: {
            backgroundColor: 'transparent',
            paddingHorizontal: 8,
            minHeight: undefined,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      default:
        return {
          button: {
            backgroundColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.background,
          },
        };
    }
  };

  const styles = StyleSheet.create({
    button: {
      minHeight: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles().button,
    },
    text: {
      fontSize: 16,
      fontWeight: '500',
      ...getVariantStyles().text,
    },
    icon: {
      marginRight: iconPosition === 'left' ? 8 : 0,
      marginLeft: iconPosition === 'right' ? 8 : 0,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={styles.text.color}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={styles.text.color}
              style={styles.icon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
