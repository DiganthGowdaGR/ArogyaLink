import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
  const router = useRouter();
  const [, refreshQueue] = useState(0);
  const doctor = doctorRepository.getById(demoIdentities.doctorId);
  const appointments = appointmentRepository.listByDoctor(demoIdentities.doctorId);
  const queueDate = doctor?.availability[0]?.date;
  const confirmedAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === 'confirmed' && (!queueDate || appointment.date === queueDate)
    )
    .sort((first, second) => compareTokens(first.tokenNumber, second.tokenNumber));
  const currentAppointment = confirmedAppointments[0];
  const waitingAppointments = confirmedAppointments.slice(1);
  const requests = appointments.filter((appointment) => appointment.status === 'requested');

  useFocusEffect(
    useCallback(() => {
      refreshQueue((value) => value + 1);
    }, [])
  );

  const handleAccept = (appointmentId: string) => {
    appointmentRepository.confirmWithToken(appointmentId);
    refreshQueue((value) => value + 1);
  };

  const handleDecline = (appointmentId: string) => {
    appointmentRepository.decline(appointmentId);
    refreshQueue((value) => value + 1);
  };

  const handleComplete = (appointmentId: string) => {
    appointmentRepository.completeAppointment(appointmentId);
    refreshQueue((value) => value + 1);
  };

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
          <>
            <AppText variant="caption" color="primary">
              Current Token
            </AppText>
            <QueueItem
              current
              token={currentAppointment.tokenNumber ?? 'A-01'}
              patient={patientRepository.getById(currentAppointment.patientId)?.fullName ?? currentAppointment.patientId}
            />
            <View style={styles.currentDetails}>
              <AppText variant="bodyStrong">{currentAppointment.date} - {currentAppointment.time}</AppText>
              <AppText variant="body" color="textSecondary">
                {currentAppointment.reason}
              </AppText>
            </View>
            <View style={styles.buttonRow}>
              <AppButton
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/doctor/patient/[id]/index',
                    params: { id: currentAppointment.patientId },
                  })
                }
                accessibilityLabel="Open current patient"
              >
                Open Patient
              </AppButton>
              <AppButton
                onPress={() => handleComplete(currentAppointment.id)}
                accessibilityLabel="Complete appointment and show next patient"
              >
                Complete &amp; Next
              </AppButton>
            </View>
          </>
        ) : (
          <EmptyState title="No patients waiting." description="Confirmed appointments will appear here." />
        )}
        <View style={styles.waitingList}>
          {waitingAppointments.length > 0 ? <AppText variant="caption" color="textSecondary">Waiting</AppText> : null}
          {waitingAppointments.map((appointment, index) => (
            <QueueItem
              key={appointment.id}
              token={appointment.tokenNumber ?? `A-${String(index + 2).padStart(2, '0')}`}
              patient={patientRepository.getById(appointment.patientId)?.fullName ?? appointment.patientId}
            />
          ))}
        </View>
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
              <AppButton
                variant="secondary"
                onPress={() => handleAccept(request.id)}
                accessibilityLabel={`Accept ${patient?.fullName ?? request.patientId}`}
              >
                Accept
              </AppButton>
              <AppButton
                variant="outline"
                onPress={() => handleDecline(request.id)}
                accessibilityLabel={`Decline ${patient?.fullName ?? request.patientId}`}
              >
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
  currentDetails: {
    gap: spacing.xs,
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

function compareTokens(first: string | undefined, second: string | undefined) {
  return tokenNumber(first) - tokenNumber(second);
}

function tokenNumber(token: string | undefined) {
  const match = token?.match(/^A-(\d+)$/);

  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
