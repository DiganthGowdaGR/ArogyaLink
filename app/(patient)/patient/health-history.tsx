import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppText, Card, StatusBadge } from '@/components/ui';
import { mockHealthHistory } from '@/features/patient/mockData';
import { colors, radius, spacing } from '@/theme';

export default function PatientHealthHistoryScreen() {
  return (
    <PatientScreen
      title="Health History"
      subtitle="Visits grouped by doctor, clinic, and date"
    >
      {mockHealthHistory.map((visit) => (
        <Card key={`${visit.date}-${visit.doctor}`} contentStyle={styles.cardContent}>
          <View style={styles.visitHeader}>
            <View style={styles.iconArea}>
              <PatientIcon name={{ android: 'clinical_notes', web: 'clinical_notes' }} />
            </View>
            <View style={styles.visitCopy}>
              <AppText variant="title">{visit.date}</AppText>
              <AppText variant="bodyStrong">{visit.doctor}</AppText>
              <AppText variant="body" color="textSecondary">
                {visit.location}
              </AppText>
            </View>
          </View>

          <View style={styles.reasonBlock}>
            <AppText variant="caption" color="textSecondary">
              Reason
            </AppText>
            <AppText variant="bodyStrong">{visit.reason}</AppText>
          </View>

          <View style={styles.itemList}>
            {visit.items.map((item) => (
              <StatusBadge key={item} status="info">
                {item}
              </StatusBadge>
            ))}
          </View>
        </Card>
      ))}
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.lg,
  },
  iconArea: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  itemList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reasonBlock: {
    gap: spacing.xs,
  },
  visitCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  visitHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
