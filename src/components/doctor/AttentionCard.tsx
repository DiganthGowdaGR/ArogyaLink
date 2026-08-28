import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, StatusBadge } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

import { DoctorIcon } from './DoctorIcon';

type AttentionCardProps = {
  patient: string;
  issue: string;
  detail: string;
  status: string;
  statusType: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  onPress?: () => void;
};

export function AttentionCard({
  patient,
  issue,
  detail,
  status,
  statusType,
  onPress,
}: AttentionCardProps) {
  return (
    <Card contentStyle={styles.content}>
      <View style={styles.iconArea}>
        <DoctorIcon name={{ android: 'priority_high', web: 'priority_high' }} />
      </View>
      <View style={styles.copy}>
        <AppText variant="title">{patient}</AppText>
        <AppText variant="bodyStrong">{issue}</AppText>
        <AppText variant="caption" color="textSecondary">
          {detail}
        </AppText>
        <StatusBadge status={statusType}>{status}</StatusBadge>
        {onPress ? (
          <AppButton variant="secondary" onPress={onPress} accessibilityLabel={`Open ${patient} patient`}>
            Open Patient
          </AppButton>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconArea: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    backgroundColor: colors.warningLight,
  },
});
