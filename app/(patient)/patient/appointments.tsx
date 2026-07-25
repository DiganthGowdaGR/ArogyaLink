import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AppButton, AppText, Card, StatusBadge } from '@/components/ui';
import { mockAppointments } from '@/features/patient/mockData';
import { colors, radius, spacing } from '@/theme';

export default function PatientAppointmentsScreen() {
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

      {mockAppointments.map((appointment) => (
        <Card key={`${appointment.doctor}-${appointment.time}`} contentStyle={styles.cardContent}>
          <View style={styles.appointmentTop}>
            <View style={styles.iconArea}>
              <PatientIcon name={{ android: 'calendar_month', web: 'calendar_month' }} />
            </View>
            <View style={styles.appointmentCopy}>
              <AppText variant="title">{appointment.doctor}</AppText>
              <AppText variant="body" color="textSecondary">
                {appointment.specialty}
              </AppText>
            </View>
          </View>
          <View style={styles.detailGroup}>
            <AppText variant="bodyStrong">{appointment.location}</AppText>
            <AppText variant="body" color="textSecondary">
              {appointment.time}
            </AppText>
          </View>
          <StatusBadge status={appointment.statusType}>
            {appointment.status}
          </StatusBadge>
        </Card>
      ))}
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
