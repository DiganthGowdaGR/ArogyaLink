import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, StatusBadge } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

import { DoctorIcon } from './DoctorIcon';

type PatientCardProps = {
  id: string;
  name: string;
  age: string;
  condition: string;
  lastVisit: string;
  status: string;
  statusType: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
};

export function PatientCard({
  id,
  name,
  age,
  condition,
  lastVisit,
  status,
  statusType,
}: PatientCardProps) {
  const router = useRouter();

  return (
    <Card contentStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.iconArea}>
          <DoctorIcon name={{ android: 'patient_list', web: 'patient_list' }} />
        </View>
        <View style={styles.copy}>
          <AppText variant="title">{name}</AppText>
          <AppText variant="body" color="textSecondary">
            {age}
          </AppText>
          <AppText variant="bodyStrong">{condition}</AppText>
        </View>
      </View>
      <View style={styles.metaRow}>
        <View>
          <AppText variant="caption" color="textSecondary">
            Last visit
          </AppText>
          <AppText variant="bodyStrong">{lastVisit}</AppText>
        </View>
        <StatusBadge status={statusType}>{status}</StatusBadge>
      </View>
      <AppButton
        variant="secondary"
        accessibilityLabel={`Open ${name} patient record`}
        onPress={() =>
          router.push({
            pathname: '/doctor/patient/[id]/index',
            params: { id },
          })
        }
      >
        Open Patient
      </AppButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconArea: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
