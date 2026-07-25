import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, ScreenContainer } from '@/components/ui';
import { routes } from '@/config/navigation';
import { spacing } from '@/theme';

export default function RoleEntryScreen() {
  const router = useRouter();

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

            <AppText variant="title" style={styles.centerText}>
              Choose how you want to continue
            </AppText>

            <View style={styles.actions}>
              <AppButton
                fullWidth
                accessibilityLabel="Continue as Patient"
                onPress={() => router.push(routes.patientHome)}
              >
                Continue as Patient
              </AppButton>
              <AppButton
                fullWidth
                variant="secondary"
                accessibilityLabel="Continue as Doctor"
                onPress={() => router.push(routes.doctorHome)}
              >
                Continue as Doctor
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
