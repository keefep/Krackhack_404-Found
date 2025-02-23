import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetails: { productId: string };
  Search: { query?: string };
  CreateProduct: undefined;
  Chat: { recipientId: string };
};

export type NotificationsStackParamList = {
  NotificationsScreen: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  MyListings: undefined;
  MyTransactions: undefined;
  MyNotifications: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Search: { query?: string };
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen props with composite navigation
export type HomeScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type NotificationsScreenProps<T extends keyof NotificationsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<NotificationsStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

// Main tab screen props
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

// Auth screen props
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Navigation prop types for direct usage
export type HomeStackNavigationProp = HomeScreenProps<keyof HomeStackParamList>['navigation'];
export type ProfileStackNavigationProp = ProfileScreenProps<keyof ProfileStackParamList>['navigation'];
export type NotificationsStackNavigationProp = NotificationsScreenProps<keyof NotificationsStackParamList>['navigation'];
export type MainTabNavigationProp = MainTabScreenProps<keyof MainTabParamList>['navigation'];
export type AuthNavigationProp = AuthScreenProps<keyof AuthStackParamList>['navigation'];
