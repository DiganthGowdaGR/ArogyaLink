import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppText, Card, EmptyState, SectionHeader, StatusBadge } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { carePlanRepository, careTaskRepository, doctorRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';

export default function PatientMedicationsScreen() {
  const carePlan = carePlanRepository.getByPatient(demoIdentities.patientId)[0];
  const medication = carePlan
    ? carePlanRepository
        .listItemsByCarePlan(carePlan.id)
        .find((item) => item.type === 'medication')
    : undefined;
  const medicationTask = medication
    ? careTaskRepository
        .listByPatient(demoIdentities.patientId)
        .find((task) => task.carePlanItemId === medication.id)
    : undefined;
  const doctor = carePlan ? doctorRepository.getById(carePlan.doctorId) : undefined;

  return (
    <PatientScreen
      title="My Medications"
      subtitle="Medicines prescribed by your doctor"
    >
      {medication ? (
        <>
          <Card contentStyle={styles.cardContent}>
            <SectionHeader
              title="Current Prescription"
              subtitle={`Prescribed by ${doctor?.fullName ?? 'your doctor'}`}
            />
            <View style={styles.medicationRow}>
              <View style={styles.iconArea}>
                <PatientIcon name={{ android: 'medication', web: 'medication' }} />
              </View>
              <View style={styles.medicationCopy}>
                <AppText variant="title">{medication.title}</AppText>
                <AppText variant="body" color="textSecondary">
                  {medication.dosage ?? 'As prescribed'}
                </AppText>
                <AppText variant="body" color="textSecondary">
                  {medication.instructions ?? 'Follow your care plan instructions.'}
                </AppText>
                <AppText variant="bodyStrong">
                  {medication.scheduledTimes?.[0] ?? 'Scheduled by your doctor'}
                </AppText>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View>
                <AppText variant="caption" color="textSecondary">
                  Duration
                </AppText>
                <AppText variant="bodyStrong">
                  {medication.durationDays ? `${medication.durationDays} days` : 'Ongoing'}
                </AppText>
              </View>
              <StatusBadge status={taskStatus(medicationTask?.status ?? medication.status)}>
                {medicationTask?.status ?? medication.status}
              </StatusBadge>
            </View>
          </Card>

          <Card contentStyle={styles.scheduleContent}>
            <SectionHeader title="Today's Schedule" />
            <View style={styles.scheduleItem}>
              <AppText variant="title">
                {medication.scheduledTimes?.[1] ?? medication.dueAt ?? 'As prescribed'}
              </AppText>
              <View style={styles.scheduleCopy}>
                <AppText variant="bodyStrong">{medication.title}</AppText>
                <AppText variant="caption" color="textSecondary">
                  Follow your care plan instructions.
                </AppText>
              </View>
            </View>
          </Card>
        </>
      ) : (
        <EmptyState title="No medications" description="Your active prescriptions will appear here." />
      )}

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

function taskStatus(status: 'pending' | 'completed' | 'missed' | 'cancelled') {
  if (status === 'missed' || status === 'cancelled') return 'danger' as const;
  if (status === 'completed') return 'success' as const;
  return 'warning' as const;
}
