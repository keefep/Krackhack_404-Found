import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';

export const getDefaultScreenOptions = (): NativeStackNavigationOptions => {
  const theme = useTheme();

  return {
    headerStyle: {
      backgroundColor: theme.colors.background.default,
    },
    headerTitleStyle: {
      ...theme.typography.variants.h4,
      color: theme.colors.text.primary,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.primary.main,
    contentStyle: {
      backgroundColor: theme.colors.background.default,
    },
  };
};

export const getTabBarOptions = (): BottomTabNavigationOptions => {
  const theme = useTheme();

  return {
    tabBarStyle: {
      backgroundColor: theme.colors.background.paper,
      borderTopColor: theme.colors.border.light,
      height: theme.spacing.heights.tabBar,
      paddingBottom: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
    },
    tabBarActiveTintColor: theme.colors.primary.main,
    tabBarInactiveTintColor: theme.colors.text.secondary,
    headerStyle: {
      backgroundColor: theme.colors.background.default,
    },
    headerTitleStyle: {
      ...theme.typography.variants.h4,
      color: theme.colors.text.primary,
    },
    headerShadowVisible: false,
  };
};

export const getNavigationTheme = (): Theme => {
  const theme = useTheme();

  return {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary.main,
      background: theme.colors.background.default,
      card: theme.colors.background.paper,
      text: theme.colors.text.primary,
      border: theme.colors.border.main,
      notification: theme.colors.error.main,
    },
  };
};
