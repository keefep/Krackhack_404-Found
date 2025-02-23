import {
  withSpring,
  withTiming,
  withSequence,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

export const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
};

export const timingConfig: WithTimingConfig = {
  duration: 150,
};

export const pressAnimation = {
  press: (value: number) => withTiming(value, { duration: 100 }),
  release: (value: number) => withTiming(value, { duration: 100 }),
};

export const scaleAnimation = {
  press: () => withSequence(
    withTiming(0.95, { duration: 100 }),
    withTiming(1, { duration: 100 })
  ),
  bounce: () => withSpring(1, springConfig),
};
