import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { LoadingScreen } from '../components';
import { RootStackParamList } from './types';
import { getNavigationTheme } from './constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  isLoading,
  isAuthenticated,
}) => {
  const navigationTheme = getNavigationTheme();

  if (isLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
