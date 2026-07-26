import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingState, ScreenContainer } from '@/components/ui';
import { AuthSessionProvider, useAuthSession } from '@/features/auth/AuthContext';

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
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthSessionProvider>
  );
}
