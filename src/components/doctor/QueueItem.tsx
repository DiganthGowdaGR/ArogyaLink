import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

type QueueItemProps = {
  token: string;
  patient: string;
  current?: boolean;
};

export function QueueItem({ token, patient, current = false }: QueueItemProps) {
  return (
    <Card style={current ? styles.currentCard : undefined} contentStyle={styles.content}>
      <View style={[styles.token, current && styles.currentToken]}>
        <AppText variant="bodyStrong" color={current ? 'surface' : 'primary'}>
          {token}
        </AppText>
      </View>
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{patient}</AppText>
        {current ? (
          <AppText variant="caption" color="textSecondary">
            Current patient
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  currentCard: {
    borderColor: colors.primary,
  },
  currentToken: {
    backgroundColor: colors.primary,
  },
  token: {
    minWidth: 58,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
  },
});
