import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import { QueueItem } from '@/components/doctor/QueueItem';
import {
  AppButton,
  AppText,
  Card,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import {
  mockAppointmentRequests,
  mockDoctor,
  mockQueue,
} from '@/features/doctor/mockData';
import { colors, radius, spacing } from '@/theme';

export default function DoctorQueueScreen() {
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
            <StatusBadge status="success">Available</StatusBadge>
            <AppText variant="bodyStrong">{mockDoctor.availability}</AppText>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.queueContent}>
        <SectionHeader title="Queue" />
        <QueueItem
          current
          token={mockQueue.current.token}
          patient={mockQueue.current.patient}
        />
        <View style={styles.waitingList}>
          {mockQueue.waiting.map((item) => (
            <QueueItem key={item.token} token={item.token} patient={item.patient} />
          ))}
        </View>
        <AppButton accessibilityLabel="Next patient">Next Patient</AppButton>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Appointment Requests" />
        {mockAppointmentRequests.map((request) => (
          <Card key={`${request.patient}-${request.time}`} contentStyle={styles.requestContent}>
            <View style={styles.requestTop}>
              <View style={styles.requestIcon}>
                <DoctorIcon name={{ android: 'pending_actions', web: 'pending_actions' }} />
              </View>
              <View style={styles.requestCopy}>
                <AppText variant="title">{request.patient}</AppText>
                <AppText variant="bodyStrong">{request.time}</AppText>
                <AppText variant="body" color="textSecondary">
                  {request.reason}
                </AppText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <AppButton variant="secondary" accessibilityLabel={`Accept ${request.patient}`}>
                Accept
              </AppButton>
              <AppButton variant="outline" accessibilityLabel={`Decline ${request.patient}`}>
                Decline
              </AppButton>
            </View>
          </Card>
        ))}
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
