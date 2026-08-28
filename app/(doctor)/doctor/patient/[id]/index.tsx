import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  LoadingState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { mockSeed } from '@/data/mockSeed';
import {
  adherenceRepository,
  appointmentRepository,
  attentionRepository,
  carePlanRepository,
  careTaskRepository,
  patientRepository,
} from '@/repositories';
import { evaluateAttentionForPatient } from '@/services/attentionService';
import { useConnectivity } from '@/services/connectivity';
import { aiService, buildDoctorPatientContext } from '@/services/ai';
import { colors, radius, spacing } from '@/theme';

export default function DoctorPatientSnapshotScreen() {
  const router = useRouter();
  const [, refreshAlerts] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { isOffline } = useConnectivity();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = id ?? demoIdentities.patientId;
  useFocusEffect(
    useCallback(() => {
      evaluateAttentionForPatient(patientId);
      refreshAlerts((value) => value + 1);
    }, [patientId])
  );
  const patient = patientRepository.getById(patientId);
  const carePlans = patient ? carePlanRepository.getByPatient(patient.id) : [];
  const activeCarePlan = patient
    ? carePlanRepository.getActiveByPatient(patient.id)
    : undefined;
  const activeCarePlanItems = activeCarePlan
    ? carePlanRepository.listItemsByCarePlan(activeCarePlan.id)
    : [];
  const carePlanSummary = {
    medication: activeCarePlanItems.filter((item) => item.type === 'medication').length,
    test: activeCarePlanItems.filter((item) => item.type === 'test').length,
    referral: activeCarePlanItems.filter((item) => item.type === 'referral').length,
    followUp: activeCarePlanItems.filter((item) => item.type === 'followUp').length,
  };
  const carePlanItems = carePlans.flatMap((carePlan) =>
    carePlanRepository.listItemsByCarePlan(carePlan.id)
  );
  const medication = carePlanItems.find((item) => item.type === 'medication');
  const careTasks = patient ? careTaskRepository.listByPatient(patient.id) : [];
  const medicationTask = medication
    ? careTasks.find((task) => task.carePlanItemId === medication.id)
    : undefined;
  const medicationTaskIds = careTasks
    .filter((task) => task.type === 'medication')
    .map((task) => task.id);
  const adherenceEvents = adherenceRepository
    .listByPatient(patientId)
    .filter((event) => medicationTaskIds.includes(event.careTaskId));
  const consultations = mockSeed.consultations.filter(
    (consultation) => consultation.patientId === patientId
  );
  const consultation = consultations[consultations.length - 1];
  const lastAppointment = consultation
    ? appointmentRepository.getById(consultation.appointmentId)
    : undefined;
  const completed = adherenceEvents.filter((event) => event.status === 'onTime').length;
  const missed = adherenceEvents.filter((event) => event.status === 'missed').length;
  const late = adherenceEvents.filter((event) => event.status === 'late').length;
  const recentMissed = [...adherenceEvents]
    .filter((event) => event.status === 'missed')
    .sort((first, second) => second.recordedAt.localeCompare(first.recordedAt))[0];
  const careAlerts = attentionRepository
    .listUnresolvedByPatient(patientId)
    .sort((first, second) => severityRank(first.severity) - severityRank(second.severity));

  const handleGenerateSummary = async () => {
    if (isOffline || isGeneratingSummary) {
      return;
    }

    const context = buildDoctorPatientContext(patientId);

    if (!context) {
      setSummaryError('Summary unavailable right now. Patient records remain available below.');
      return;
    }

    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const result = await aiService.summarizeForDoctor(
        context.patientName,
        context.history,
        context.carePlan
      );
      setSummary(result.text);
    } catch {
      setSummaryError('Summary unavailable right now. Patient records remain available below.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!patient) {
    return (
      <DoctorScreen title="Patient Snapshot">
        <EmptyState title="Patient not found" description="This patient record is unavailable." />
      </DoctorScreen>
    );
  }

  return (
    <DoctorScreen
      title={patient.fullName}
      subtitle={`${patient.age} / ${patient.gender} - Patient ID: ${patient.id}`}
    >
      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Important" />
        <View style={styles.badgeRow}>
          {[...patient.conditions, ...patient.allergies].map((item) => (
            <StatusBadge key={item} status="warning">
              {item}
            </StatusBadge>
          ))}
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Care Alerts" subtitle="Rule-based follow-up alerts" />
        {careAlerts.length === 0 ? (
          <EmptyState title="No active care alerts." />
        ) : (
          careAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertBlock}>
              <StatusBadge status={alert.severity === 'high' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
                {alert.severity.toUpperCase()}
              </StatusBadge>
              <AppText variant="title">{alert.title}</AppText>
              <AppText variant="body" color="textSecondary">{alert.description}</AppText>
              <AppButton
                variant="outline"
                accessibilityLabel={`Mark ${alert.title} resolved`}
                onPress={() => {
                  attentionRepository.markResolved(alert.id);
                  refreshAlerts((value) => value + 1);
                }}
              >
                Mark Resolved
              </AppButton>
            </View>
          ))
        )}
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader
          title="AI Patient Summary"
          subtitle="A concise view of recorded patient information"
        />
        {isOffline ? (
          <AppText variant="body" color="textSecondary">
            AI summary requires internet access.
          </AppText>
        ) : null}
        {isGeneratingSummary ? (
          <LoadingState message="Generating patient summary..." />
        ) : summary ? (
          <AppText variant="body">{summary}</AppText>
        ) : (
          <AppText variant="body" color="textSecondary">
            Generate a concise summary from the recorded patient context.
          </AppText>
        )}
        {summaryError ? <AppText variant="body" color="danger">{summaryError}</AppText> : null}
        <AppButton
          variant="secondary"
          disabled={isOffline || isGeneratingSummary}
          loading={isGeneratingSummary}
          onPress={() => void handleGenerateSummary()}
          accessibilityLabel={summary ? 'Refresh patient summary' : 'Generate patient summary'}
        >
          {summary ? 'Refresh Summary' : 'Generate Summary'}
        </AppButton>
        <AppText variant="caption" color="textSecondary">
          AI-generated summary from recorded ArogyaLink data. Verify before clinical use.
        </AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader
          title="Active Care Plan"
          subtitle={
            activeCarePlan
              ? `${carePlanSummary.medication} medications, ${carePlanSummary.test} tests, ${carePlanSummary.followUp} follow-ups`
              : 'No active care plan'
          }
        />
        <AppText variant="body" color="textSecondary">
          {activeCarePlan
            ? `${carePlanSummary.referral} referrals included in the current plan.`
            : 'Create a plan to coordinate this patient\'s next steps.'}
        </AppText>
        <AppButton
          variant="secondary"
          accessibilityLabel={activeCarePlan ? 'View or update care plan' : 'Create care plan'}
          onPress={() =>
            router.push({
              pathname: '/doctor/patient/[id]/care-plan',
              params: { id: patientId },
            })
          }
        >
          {activeCarePlan ? 'View / Update Care Plan' : 'Create Care Plan'}
        </AppButton>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Current Medication" />
        <View style={styles.infoRow}>
          <View style={styles.iconArea}>
            <DoctorIcon name={{ android: 'medication', web: 'medication' }} />
          </View>
          <View style={styles.infoCopy}>
            <AppText variant="title">
              {medication?.title ?? 'No medication recorded'}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {medication?.scheduledTimes?.join(' / ') ?? 'No schedule recorded'}
              {medicationTask ? ` - ${medicationTask.status}` : ''}
            </AppText>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Medication Adherence" />
        <View style={styles.adherenceRow}>
          <View style={styles.adherenceMain}>
            <AppText variant="display" color="primary">{completed}</AppText>
            <AppText variant="caption" color="textSecondary">Completed</AppText>
          </View>
          <View style={styles.badgeColumn}>
            <StatusBadge status="success">{`${completed} on time`}</StatusBadge>
            <StatusBadge status="info">{`${late} late`}</StatusBadge>
            <StatusBadge status="warning">{`${missed} missed`}</StatusBadge>
          </View>
        </View>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Adherence Issue" />
        <AppText variant="bodyStrong">
          {recentMissed?.reason ?? 'No recent missed medication reason.'}
        </AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Complaint" />
        <AppText variant="bodyStrong">
          {consultation?.notes ?? 'No recent complaint recorded.'}
        </AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Last Consultation" />
        <AppText variant="bodyStrong">
          {consultation?.date ?? 'No consultation recorded'}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {lastAppointment?.reason ?? consultation?.summary ?? 'No consultation details recorded.'}
        </AppText>
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Consultation Summary" />
        <AppText variant="body" color="textSecondary">
          {consultation?.summary ?? 'No consultation summary recorded.'}
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
        <AppButton
          variant="outline"
          accessibilityLabel="Create care plan"
          onPress={() =>
            router.push({
              pathname: '/doctor/patient/[id]/care-plan',
              params: { id: patientId },
            })
          }
        >
          Create Care Plan
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
  alertBlock: {
    gap: spacing.sm,
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

function severityRank(severity: 'info' | 'warning' | 'high') {
  if (severity === 'high') return 0;
  if (severity === 'warning') return 1;
  return 2;
}
