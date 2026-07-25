import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import {
  ActionCard,
  AppButton,
  AppText,
  Card,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { mockAppointments, mockMedication } from '@/features/patient/mockData';
import { colors, spacing } from '@/theme';

export default function PatientHomeScreen() {
  const router = useRouter();
  const nextAppointment = mockAppointments[0];

  return (
    <PatientScreen
      eyebrow="ArogyaLink"
      title="Good morning"
      subtitle="Let's take care of your health today."
    >
      <Card contentStyle={styles.cardContent}>
        <SectionHeader
          title="Next Appointment"
          subtitle={`${nextAppointment.doctor} - ${nextAppointment.specialty}`}
        />
        <View style={styles.detailGroup}>
          <AppText variant="bodyStrong">{nextAppointment.location}</AppText>
          <AppText variant="body" color="textSecondary">
            {nextAppointment.time}
          </AppText>
          <StatusBadge status="success">{nextAppointment.status}</StatusBadge>
        </View>
        <AppButton accessibilityLabel="View next appointment">
          View Appointment
        </AppButton>
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
        <SectionHeader title="Today's Medicine" />
        <View style={styles.detailGroup}>
          <AppText variant="bodyStrong">{mockMedication.name}</AppText>
          <AppText variant="body" color="textSecondary">
            {mockMedication.morningTime}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {mockMedication.instruction}
          </AppText>
          <StatusBadge status="warning">{mockMedication.status}</StatusBadge>
        </View>
        <AppButton variant="secondary" accessibilityLabel="View medication">
          View Medication
        </AppButton>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Update" />
        <View style={styles.updateRow}>
          <View style={styles.updateIcon}>
            <PatientIcon name={{ android: 'clinical_notes', web: 'clinical_notes' }} />
          </View>
          <View style={styles.updateCopy}>
            <AppText variant="bodyStrong">
              New prescription added by Dr. Kumar
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
