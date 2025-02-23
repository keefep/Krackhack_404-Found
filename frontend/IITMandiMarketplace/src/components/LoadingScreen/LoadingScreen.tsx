import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { LoadingAnimation } from './LoadingAnimation';

export interface LoadingScreenProps {
  message?: string;
  size?: number;
  style?: ViewStyle;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  size = 60,
  style,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.default,
    },
    message: {
      ...theme.typography.variants.body1,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <LoadingAnimation size={size} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};
