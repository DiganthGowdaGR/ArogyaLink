import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, EmptyState, StatusBadge } from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { appointmentRepository, doctorRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';

export default function PatientAppointmentsScreen() {
  const appointments = appointmentRepository.listByPatient(demoIdentities.patientId);

  return (
    <PatientScreen title="Appointments" subtitle="Manage your doctor visits">
      <View style={styles.segmented}>
        <View style={[styles.segment, styles.segmentActive]}>
          <AppText variant="button" color="primary">
            Upcoming
          </AppText>
        </View>
        <View style={styles.segment}>
          <AppText variant="button" color="textSecondary">
            Completed
          </AppText>
        </View>
      </View>

      <AppButton
        icon={<PatientIcon name={{ android: 'calendar_month', web: 'calendar_month' }} color={colors.surface} />}
        accessibilityLabel="Book appointment"
      >
        Book Appointment
      </AppButton>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments yet" description="Your doctor visits will appear here." />
      ) : (
        appointments.map((appointment) => {
          const doctor = doctorRepository.getById(appointment.doctorId);

          return (
            <Card key={appointment.id} contentStyle={styles.cardContent}>
              <View style={styles.appointmentTop}>
                <View style={styles.iconArea}>
                  <PatientIcon name={{ android: 'calendar_month', web: 'calendar_month' }} />
                </View>
                <View style={styles.appointmentCopy}>
                  <AppText variant="title">{doctor?.fullName ?? 'Doctor'}</AppText>
                  <AppText variant="body" color="textSecondary">
                    {doctor?.specialization ?? 'Healthcare visit'}
                  </AppText>
                </View>
              </View>
              <View style={styles.detailGroup}>
                <AppText variant="bodyStrong">{doctor?.clinicName ?? 'Clinic'}</AppText>
                <AppText variant="body" color="textSecondary">
                  {appointment.date} - {appointment.time}
                </AppText>
              </View>
              <StatusBadge status={appointmentStatus(appointment.status)}>
                {appointment.status}
              </StatusBadge>
            </Card>
          );
        })
      )}
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  appointmentCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardContent: {
    gap: spacing.md,
  },
  detailGroup: {
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
  segment: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    paddingHorizontal: spacing.md,
  },
  segmentActive: {
    backgroundColor: colors.primaryLight,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.xs,
  },
});

function appointmentStatus(status: 'requested' | 'confirmed' | 'completed' | 'cancelled') {
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'requested') return 'warning' as const;
  return status === 'completed' ? 'neutral' as const : 'success' as const;
}
