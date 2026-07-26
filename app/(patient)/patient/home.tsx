import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import {
  ActionCard,
  AppButton,
  AppText,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { appointmentRepository, carePlanRepository, careTaskRepository, doctorRepository } from '@/repositories';
import { colors, spacing } from '@/theme';

export default function PatientHomeScreen() {
  const router = useRouter();
  const appointments = appointmentRepository.listByPatient(demoIdentities.patientId);
  const nextAppointment = appointments.find(
    (appointment) => appointment.status === 'requested' || appointment.status === 'confirmed'
  );
  const nextDoctor = nextAppointment
    ? doctorRepository.getById(nextAppointment.doctorId)
    : undefined;
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

  return (
    <PatientScreen
      eyebrow="ArogyaLink"
      title="Good morning"
      subtitle="Let's take care of your health today."
    >
      <Card contentStyle={styles.cardContent}>
        {nextAppointment && nextDoctor ? (
          <>
            <SectionHeader
              title="Next Appointment"
              subtitle={`${nextDoctor.fullName} - ${nextDoctor.specialization}`}
            />
            <View style={styles.detailGroup}>
              <AppText variant="bodyStrong">{nextDoctor.clinicName}</AppText>
              <AppText variant="body" color="textSecondary">
                {nextAppointment.date} - {nextAppointment.time}
              </AppText>
              <StatusBadge status={appointmentStatus(nextAppointment.status)}>
                {nextAppointment.status}
              </StatusBadge>
            </View>
            <AppButton accessibilityLabel="View next appointment">
              View Appointment
            </AppButton>
          </>
        ) : (
          <EmptyState title="No upcoming appointments" description="Your next visit will appear here." />
        )}
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionGrid}>
          <ActionCard
            icon={<PatientIcon name={{ android: 'calendar_month', web: 'calendar_month' }} />}
            label="Book Appointment"
            onPress={() => undefined}
            style={styles.actionCard}
          />
          <ActionCard
            icon={<PatientIcon name={{ android: 'medication', web: 'medication' }} />}
            label="My Medicines"
            onPress={() => undefined}
            style={styles.actionCard}
          />
          <ActionCard
            icon={<PatientIcon name={{ android: 'auto_awesome', web: 'auto_awesome' }} />}
            label="Ask Arogya AI"
            onPress={() => undefined}
            style={styles.actionCard}
          />
          <ActionCard
            icon={<PatientIcon name={{ android: 'history', web: 'history' }} />}
            label="Health History"
            accessibilityLabel="Open health history"
            onPress={() => router.push('/patient/health-history')}
            style={styles.actionCard}
          />
        </View>
      </View>

      <Card contentStyle={styles.cardContent}>
        {medication ? (
          <>
            <SectionHeader title="Today's Medicine" />
            <View style={styles.detailGroup}>
              <AppText variant="bodyStrong">
                {medication.title} {medication.dosage ?? ''}
              </AppText>
              <AppText variant="body" color="textSecondary">
                {medication.scheduledTimes?.[0] ?? medication.dueAt ?? 'As prescribed'}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {medication.instructions ?? 'Follow your care plan instructions.'}
              </AppText>
              <StatusBadge status={taskStatus(medicationTask?.status ?? medication.status)}>
                {medicationTask?.status ?? medication.status}
              </StatusBadge>
            </View>
            <AppButton variant="secondary" accessibilityLabel="View medication">
              View Medication
            </AppButton>
          </>
        ) : (
          <EmptyState title="No current medication" description="Your active care plan has no medication yet." />
        )}
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Update" />
        <View style={styles.updateRow}>
          <View style={styles.updateIcon}>
            <PatientIcon name={{ android: 'clinical_notes', web: 'clinical_notes' }} />
          </View>
          <View style={styles.updateCopy}>
            <AppText variant="bodyStrong">
              New care plan added by {nextDoctor?.fullName ?? 'your doctor'}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Today
            </AppText>
          </View>
        </View>
      </Card>
    </PatientScreen>
  );
}

function appointmentStatus(status: 'requested' | 'confirmed' | 'completed' | 'cancelled') {
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'requested') return 'warning' as const;
  return status === 'completed' ? 'neutral' as const : 'success' as const;
}

function taskStatus(status: 'pending' | 'completed' | 'missed' | 'cancelled') {
  if (status === 'missed' || status === 'cancelled') return 'danger' as const;
  if (status === 'completed') return 'success' as const;
  return 'warning' as const;
}

const styles = StyleSheet.create({
  actionCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardContent: {
    gap: spacing.lg,
  },
  detailGroup: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  updateCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  updateIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
