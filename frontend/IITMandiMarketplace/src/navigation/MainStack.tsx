import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ProductDetailsScreen } from '../screens/main/ProductDetailsScreen';
import { CreateProductScreen } from '../screens/main/CreateProductScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SearchScreen } from '../components/SearchScreen/SearchScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { TransactionsScreen } from '../screens/main/TransactionsScreen';
import { SearchResultsScreen } from '../screens/main/SearchResultsScreen';
import {
  HomeStackParamList,
  ProfileStackParamList,
  NotificationsStackParamList,
  MainTabParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();

// Stack navigators with proper typing
const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerTitle: 'IIT Mandi Marketplace' }}
    />
    <HomeStack.Screen
      name="ProductDetails"
      component={ProductDetailsScreen}
      options={{ headerTitle: 'Product Details' }}
    />
    <HomeStack.Screen
      name="CreateProduct"
      component={CreateProductScreen}
      options={{ headerTitle: 'Create Listing' }}
    />
    <HomeStack.Screen
      name="Search"
      component={SearchResultsScreen}
      options={{ headerTitle: 'Search Results' }}
    />
    <HomeStack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ headerTitle: 'Chat' }}
    />
  </HomeStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{ headerTitle: 'Profile' }}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerTitle: 'Settings' }}
    />
    <ProfileStack.Screen
      name="MyTransactions"
      component={TransactionsScreen}
      options={{ headerTitle: 'My Transactions' }}
    />
    <ProfileStack.Screen
      name="MyListings"
      component={SearchResultsScreen}
      options={{ headerTitle: 'My Listings' }}
    />
  </ProfileStack.Navigator>
);

const NotificationsStackNavigator: React.FC = () => (
  <NotificationsStack.Navigator>
    <NotificationsStack.Screen
      name="NotificationsScreen"
      component={NotificationsScreen}
      options={{ headerTitle: 'Notifications' }}
    />
  </NotificationsStack.Navigator>
);

export const MainStack: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Search',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
