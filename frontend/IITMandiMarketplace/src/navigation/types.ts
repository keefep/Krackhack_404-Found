import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  AddProduct: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetails: {
    productId: string;
    title: string;
  };
  Chat: {
    recipientId: string;
    recipientName: string;
  };
  Categories: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainApp: NavigatorScreenParams<MainStackParamList>;
};
