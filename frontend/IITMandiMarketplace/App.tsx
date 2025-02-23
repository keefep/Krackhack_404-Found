import React from 'react';
import { Providers } from './src/providers';
import { RootNavigator } from './src/navigation';
import { useAuth } from './src/contexts';

const AppContent = () => {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <RootNavigator
      isLoading={isLoading}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
