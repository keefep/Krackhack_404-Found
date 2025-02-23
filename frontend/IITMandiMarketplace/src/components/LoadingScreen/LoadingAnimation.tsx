import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 40,
  color,
}) => {
  const theme = useTheme();
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
    );
  }, []);

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinner: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: size / 10,
      borderColor: (color || theme.colors.primary.main) + '40', // 40 is hex for 25% opacity
      borderTopColor: color || theme.colors.primary.main,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, animatedStyle]} />
    </View>
  );
};
