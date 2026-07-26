import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, ScreenContainer } from '@/components/ui';
import { routes } from '@/config/navigation';
import { useAuthSession } from '@/features/auth/AuthContext';
import { spacing } from '@/theme';

export default function RoleEntryScreen() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthSession();

  if (isAuthenticated && role === 'patient') {
    return <Redirect href={routes.patientHome} />;
  }

  if (isAuthenticated && role === 'doctor') {
    return <Redirect href={routes.doctorHome} />;
  }

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.content}>
        <Card>
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <AppText variant="display" style={styles.centerText}>
                ArogyaLink
              </AppText>
              <AppText variant="body" color="textSecondary" style={styles.centerText}>
                Continuous care, accessible to everyone.
              </AppText>
            </View>

            <View style={styles.actions}>
              <AppButton
                fullWidth
                accessibilityLabel="Login"
                onPress={() => router.push(routes.authLogin)}
              >
                Login
              </AppButton>
              <AppButton
                fullWidth
                variant="secondary"
                accessibilityLabel="Create account"
                onPress={() => router.push(routes.authRegister)}
              >
                Create Account
              </AppButton>
            </View>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  centerText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  screen: {
    flex: 1,
  },
});
