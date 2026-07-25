import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import {
  AppButton,
  AppText,
  Card,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { mockPatientSnapshot } from '@/features/doctor/mockData';
import { colors, radius, spacing } from '@/theme';

export default function DoctorPatientSnapshotScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = id ?? mockPatientSnapshot.id;

  return (
    <DoctorScreen
      title={mockPatientSnapshot.name}
      subtitle={`${mockPatientSnapshot.demographics} - Patient ID: ${patientId}`}
    >
      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Important" />
        <View style={styles.badgeRow}>
          {mockPatientSnapshot.important.map((item) => (
            <StatusBadge key={item} status="warning">
              {item}
            </StatusBadge>
          ))}
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Current Medication" />
        <View style={styles.infoRow}>
          <View style={styles.iconArea}>
            <DoctorIcon name={{ android: 'medication', web: 'medication' }} />
          </View>
          <View style={styles.infoCopy}>
            <AppText variant="title">{mockPatientSnapshot.medication}</AppText>
            <AppText variant="body" color="textSecondary">
              {mockPatientSnapshot.medicationTiming}
            </AppText>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Adherence" />
        <View style={styles.adherenceRow}>
          <View style={styles.adherenceMain}>
            <AppText variant="display" color="primary">
              {mockPatientSnapshot.adherence}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Overall adherence
            </AppText>
          </View>
          <View style={styles.badgeColumn}>
            <StatusBadge status="warning">{mockPatientSnapshot.missed}</StatusBadge>
            <StatusBadge status="info">{mockPatientSnapshot.late}</StatusBadge>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Complaint" />
        <AppText variant="bodyStrong">{mockPatientSnapshot.complaint}</AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Last Consultation" />
        <AppText variant="bodyStrong">
          {mockPatientSnapshot.lastConsultation.date}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {mockPatientSnapshot.lastConsultation.reason}
        </AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="AI Quick Summary" />
        <AppText variant="body" color="textSecondary">
          {mockPatientSnapshot.aiSummary}
        </AppText>
      </Card>

      <View style={styles.buttonRow}>
        <AppButton accessibilityLabel="Start consultation">Start Consultation</AppButton>
        <AppButton
          variant="secondary"
          accessibilityLabel="View full patient history"
          onPress={() =>
            router.push({
              pathname: '/doctor/patient/[id]/history',
              params: { id: patientId },
            })
          }
        >
          View Full History
        </AppButton>
        <AppButton variant="outline" accessibilityLabel="Update prescription">
          Update Prescription
        </AppButton>
      </View>
    </DoctorScreen>
  );
}

const styles = StyleSheet.create({
  adherenceMain: {
    flex: 1,
    gap: spacing.xs,
  },
  adherenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgeColumn: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonRow: {
    gap: spacing.md,
  },
  cardContent: {
    gap: spacing.md,
  },
  iconArea: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  infoCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
