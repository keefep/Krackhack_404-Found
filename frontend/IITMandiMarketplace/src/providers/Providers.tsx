import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme } from '../theme/theme';
import { AuthProvider } from '../contexts/AuthContext';
import { RootNavigator } from '../navigation';
import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

// Navigation wrapper with auth state
const NavigationWrapper = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <RootNavigator />;
};

export const Providers: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={lightTheme}>
        <NavigationContainer theme={lightTheme}>
          <AuthProvider>
            <NavigationWrapper />
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
