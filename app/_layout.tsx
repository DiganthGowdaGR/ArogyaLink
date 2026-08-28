import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingState, ScreenContainer } from '@/components/ui';
import { AuthSessionProvider, useAuthSession } from '@/features/auth/AuthContext';
import { ConnectivityProvider } from '@/services/connectivity';
import { PatientOfflineDataProvider } from '@/services/offline';

function AppNavigator() {
  const { isRestoring } = useAuthSession();

  if (isRestoring) {
    return (
      <ScreenContainer contentStyle={{ justifyContent: 'center' }}>
        <LoadingState message="Restoring session..." />
      </ScreenContainer>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <ConnectivityProvider>
        <PatientOfflineDataProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </PatientOfflineDataProvider>
      </ConnectivityProvider>
    </AuthSessionProvider>
  );
}
