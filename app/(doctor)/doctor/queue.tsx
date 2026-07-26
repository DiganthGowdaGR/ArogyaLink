import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { QueueItem } from '@/components/doctor/QueueItem';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { appointmentRepository, doctorRepository, patientRepository } from '@/repositories';
import { colors, radius, spacing } from '@/theme';

export default function DoctorQueueScreen() {
  const doctor = doctorRepository.getById(demoIdentities.doctorId);
  const appointments = appointmentRepository.listByDoctor(demoIdentities.doctorId);
  const currentAppointment =
    appointments.find(
      (appointment) => appointment.status === 'confirmed' || appointment.status === 'requested'
    ) ?? appointments[0];
  const waitingAppointments = appointments.filter(
    (appointment) => appointment.id !== currentAppointment?.id
  );
  const requests = appointments.filter((appointment) => appointment.status === 'requested');

  return (
    <DoctorScreen title="Today's Queue">
      <Card contentStyle={styles.availabilityContent}>
        <SectionHeader title="Doctor Availability" />
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityIcon}>
            <DoctorIcon
              name={{ android: 'toggle_on', web: 'toggle_on' }}
              color={colors.success}
              size={36}
            />
          </View>
          <View style={styles.availabilityCopy}>
            <StatusBadge status={doctor?.available ? 'success' : 'neutral'}>
              {doctor?.available ? 'Available' : 'Unavailable'}
            </StatusBadge>
            <AppText variant="bodyStrong">
              {doctor?.available ? 'Available for appointments' : 'Currently unavailable'}
            </AppText>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.queueContent}>
        <SectionHeader title="Queue" />
        {currentAppointment ? (
          <QueueItem
            current
            token={`A-${appointments.indexOf(currentAppointment) + 5}`}
            patient={patientRepository.getById(currentAppointment.patientId)?.fullName ?? currentAppointment.patientId}
          />
        ) : (
          <EmptyState title="Queue is empty" description="Confirmed appointments will appear here." />
        )}
        <View style={styles.waitingList}>
          {waitingAppointments.map((appointment, index) => (
            <QueueItem
              key={appointment.id}
              token={`A-${index + 6}`}
              patient={patientRepository.getById(appointment.patientId)?.fullName ?? appointment.patientId}
            />
          ))}
        </View>
        <AppButton accessibilityLabel="Next patient">Next Patient</AppButton>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Appointment Requests" />
        {requests.length === 0 ? (
          <EmptyState title="No appointment requests" description="New requests will appear here." />
        ) : (
          requests.map((request) => {
            const patient = patientRepository.getById(request.patientId);

            return (
          <Card key={request.id} contentStyle={styles.requestContent}>
            <View style={styles.requestTop}>
              <View style={styles.requestIcon}>
                <DoctorIcon name={{ android: 'pending_actions', web: 'pending_actions' }} />
              </View>
              <View style={styles.requestCopy}>
                <AppText variant="title">{patient?.fullName ?? request.patientId}</AppText>
                <AppText variant="bodyStrong">{request.date} - {request.time}</AppText>
                <AppText variant="body" color="textSecondary">
                  {request.reason}
                </AppText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <AppButton variant="secondary" accessibilityLabel={`Accept ${patient?.fullName ?? request.patientId}`}>
                Accept
              </AppButton>
              <AppButton variant="outline" accessibilityLabel={`Decline ${patient?.fullName ?? request.patientId}`}>
                Decline
              </AppButton>
            </View>
          </Card>
            );
          })
        )}
      </View>
    </DoctorScreen>
  );
}

const styles = StyleSheet.create({
  availabilityContent: {
    gap: spacing.md,
  },
  availabilityCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  availabilityIcon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.successLight,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  queueContent: {
    gap: spacing.md,
  },
  requestContent: {
    gap: spacing.md,
  },
  requestCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  requestIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  requestTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  waitingList: {
    gap: spacing.sm,
  },
});
