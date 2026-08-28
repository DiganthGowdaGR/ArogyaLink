import { StyleSheet, View } from 'react-native';

import { useConnectivity } from '@/services/connectivity';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

export function OfflineBanner() {
  const { isOffline } = useConnectivity();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <AppText variant="bodyStrong" color="primary">
        You&apos;re offline
      </AppText>
      <AppText variant="caption" color="textSecondary">
        Your saved care information is still available.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
  },
});
