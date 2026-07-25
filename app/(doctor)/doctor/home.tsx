import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AttentionCard } from '@/components/doctor/AttentionCard';
import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import {
  AppButton,
  AppText,
  Card,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import {
  mockAppointmentRequests,
  mockAttentionItems,
  mockDoctorSummary,
  mockQueue,
} from '@/features/doctor/mockData';
import { colors, radius, spacing } from '@/theme';

export default function DoctorHomeScreen() {
  const router = useRouter();

  return (
    <DoctorScreen
      title="Good morning, Dr. Kumar"
      subtitle="Here's what needs your attention today."
    >
      <View style={styles.summaryGrid}>
        {mockDoctorSummary.map((item) => (
          <Card key={item.label} style={styles.summaryCard}>
            <AppText variant="display" color="primary">
              {item.value}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {item.label}
            </AppText>
          </Card>
        ))}
      </View>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Current Queue" />
        <View style={styles.currentToken}>
          <View style={styles.tokenBlock}>
            <AppText variant="caption" color="surface">
              Current Token
            </AppText>
            <AppText variant="display" color="surface">
              {mockQueue.current.token}
            </AppText>
          </View>
          <View style={styles.currentCopy}>
            <AppText variant="title">{mockQueue.current.patient}</AppText>
            <AppText variant="body" color="textSecondary">
              {mockQueue.current.reason}
            </AppText>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <AppButton
            accessibilityLabel="Open current patient"
            onPress={() =>
              router.push({
                pathname: '/doctor/patient/[id]/index',
                params: { id: mockQueue.current.id },
              })
            }
          >
            Open Patient
          </AppButton>
          <AppButton variant="secondary" accessibilityLabel="Next patient">
            Next Patient
          </AppButton>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Care Attention" />
        {mockAttentionItems.map((item) => (
          <AttentionCard key={`${item.patient}-${item.issue}`} {...item} />
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Appointment Requests" />
        {mockAppointmentRequests.slice(0, 2).map((request) => (
          <Card key={`${request.patient}-${request.time}`} contentStyle={styles.requestContent}>
            <View style={styles.requestTop}>
              <View style={styles.requestIcon}>
                <DoctorIcon name={{ android: 'event_available', web: 'event_available' }} />
              </View>
              <View style={styles.requestCopy}>
                <AppText variant="title">{request.patient}</AppText>
                <AppText variant="body" color="textSecondary">
                  {request.reason}
                </AppText>
                <StatusBadge status="info">{request.time}</StatusBadge>
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardContent: {
    gap: spacing.lg,
  },
  currentCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  currentToken: {
    flexDirection: 'row',
    alignItems: 'center',
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
  summaryCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tokenBlock: {
    minWidth: 112,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.large,
    backgroundColor: colors.primary,
    padding: spacing.md,
  },
});
