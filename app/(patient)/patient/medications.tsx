import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppText, Card, SectionHeader, StatusBadge } from '@/components/ui';
import { mockMedication } from '@/features/patient/mockData';
import { colors, radius, spacing } from '@/theme';

export default function PatientMedicationsScreen() {
  return (
    <PatientScreen
      title="My Medications"
      subtitle="Medicines prescribed by your doctor"
    >
      <Card contentStyle={styles.cardContent}>
        <SectionHeader
          title="Current Prescription"
          subtitle={`Prescribed by ${mockMedication.prescribedBy}`}
        />
        <View style={styles.medicationRow}>
          <View style={styles.iconArea}>
            <PatientIcon name={{ android: 'medication', web: 'medication' }} />
          </View>
          <View style={styles.medicationCopy}>
            <AppText variant="title">{mockMedication.name}</AppText>
            <AppText variant="body" color="textSecondary">
              {mockMedication.dosage}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {mockMedication.instruction}
            </AppText>
            <AppText variant="bodyStrong">{mockMedication.morningTime}</AppText>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View>
            <AppText variant="caption" color="textSecondary">
              Duration
            </AppText>
            <AppText variant="bodyStrong">{mockMedication.duration}</AppText>
          </View>
          <StatusBadge status="warning">{mockMedication.status}</StatusBadge>
        </View>
      </Card>

      <Card contentStyle={styles.scheduleContent}>
        <SectionHeader title="Today's Schedule" />
        <View style={styles.scheduleItem}>
          <AppText variant="title">{mockMedication.eveningTime}</AppText>
          <View style={styles.scheduleCopy}>
            <AppText variant="bodyStrong">{mockMedication.name}</AppText>
            <AppText variant="caption" color="textSecondary">
              {"Follow your doctor's prescription"}
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <AppText variant="bodyStrong" color="primary" style={styles.infoText}>
          Only your doctor can update your prescription.
        </AppText>
      </Card>
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.lg,
  },
  iconArea: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  infoText: {
    textAlign: 'center',
  },
  medicationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  medicationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  scheduleContent: {
    gap: spacing.lg,
  },
  scheduleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
});
