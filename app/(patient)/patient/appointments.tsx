import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, EmptyState, StatusBadge } from '@/components/ui';
import type { AppointmentStatus } from '@/domain';
import { doctorRepository } from '@/repositories';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { usePatientOfflineData } from '@/services/offline';

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const {
    appointments,
    doctor: cachedDoctor,
    isCacheLoading,
    isOffline,
  } = usePatientOfflineData();

  if (isCacheLoading) {
    return (
      <PatientScreen title="Appointments" subtitle="Manage your doctor visits">
        <AppText variant="body" color="textSecondary">
          Loading saved appointments...
        </AppText>
      </PatientScreen>
    );
  }

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
        disabled={isOffline}
        onPress={isOffline ? undefined : () => router.push('/patient/doctors')}
      >
        Book Appointment
      </AppButton>
      {isOffline ? (
        <AppText variant="caption" color="textSecondary">
          Internet connection required to request a new appointment.
        </AppText>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState title="No appointments yet" description="Your doctor visits will appear here." />
      ) : (
        appointments.map((appointment) => {
          const doctor = cachedDoctor ?? doctorRepository.getById(appointment.doctorId);

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
                {appointmentStatusLabel(appointment.status)}
              </StatusBadge>
              {(appointment.status === 'confirmed' || appointment.status === 'completed') && appointment.tokenNumber ? (
                <View style={styles.tokenPanel}>
                  <AppText variant="caption" color="textSecondary">
                    Your Token
                  </AppText>
                  <AppText variant="display" color="primary">
                    {appointment.tokenNumber}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {appointment.status === 'completed'
                      ? 'Visit completed'
                      : 'Please arrive near your appointment time.'}
                  </AppText>
                </View>
              ) : null}
              {appointment.status === 'declined' ? (
                <>
                  <AppText variant="body" color="textSecondary">
                    Please choose another available appointment.
                  </AppText>
                  <AppButton
                    variant="outline"
                    onPress={() => router.push('/patient/doctors')}
                    accessibilityLabel="Choose another appointment"
                  >
                    Find Another Appointment
                  </AppButton>
                </>
              ) : null}
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
  tokenPanel: {
    gap: spacing.xs,
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
  },
});

function appointmentStatus(status: AppointmentStatus) {
  if (status === 'cancelled' || status === 'declined') return 'danger' as const;
  if (status === 'requested') return 'warning' as const;
  return status === 'completed' ? 'neutral' as const : 'success' as const;
}

function appointmentStatusLabel(status: AppointmentStatus) {
  if (status === 'requested') return 'Waiting for doctor confirmation';
  if (status === 'declined') return 'Request Declined';
  return status.charAt(0).toUpperCase() + status.slice(1);
}
