import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AttentionCard } from '@/components/doctor/AttentionCard';
import { DoctorIcon } from '@/components/doctor/DoctorIcon';
import { DoctorScreen } from '@/components/doctor/DoctorScreen';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import { appointmentRepository, attentionRepository, carePlanRepository, doctorRepository, patientRepository } from '@/repositories';
import { evaluateAttentionForDoctor } from '@/services/attentionService';
import { colors, radius, spacing } from '@/theme';

export default function DoctorHomeScreen() {
  const router = useRouter();
  const [, refreshAttention] = useState(0);
  useFocusEffect(
    useCallback(() => {
      evaluateAttentionForDoctor(demoIdentities.doctorId);
      refreshAttention((value) => value + 1);
    }, [])
  );
  const doctor = doctorRepository.getById(demoIdentities.doctorId);
  const appointments = appointmentRepository.listByDoctor(demoIdentities.doctorId);
  const patients = patientRepository.list();
  const attentionItems = attentionRepository
    .listUnresolvedByDoctor(demoIdentities.doctorId)
    .sort((first, second) => severityRank(first.severity) - severityRank(second.severity));
  const requests = appointments.filter((appointment) => appointment.status === 'requested');
  const currentAppointment =
    appointments.find(
      (appointment) => appointment.status === 'confirmed' || appointment.status === 'requested'
    ) ?? appointments[0];
  const currentPatient = currentAppointment
    ? patientRepository.getById(currentAppointment.patientId)
    : undefined;
  const followUpsDue = patients.reduce((count, patient) => {
    const plans = carePlanRepository.getByPatient(patient.id);
    return (
      count +
      plans.reduce(
        (planCount, plan) =>
          planCount +
          carePlanRepository
            .listItemsByCarePlan(plan.id)
            .filter((item) => item.type === 'followUp' && item.status === 'pending').length,
        0
      )
    );
  }, 0);
  const summary = [
    { label: "Today's Appointments", value: String(appointments.length) },
    {
      label: 'Waiting Patients',
      value: String(appointments.filter((appointment) => appointment.status === 'requested').length),
    },
    {
      label: 'Needs Attention',
      value: String(attentionItems.filter((item) => !item.resolved).length),
    },
    { label: 'Follow-ups Due', value: String(followUpsDue) },
  ];

  return (
    <DoctorScreen
      title={`Good morning, ${doctor?.fullName ?? 'Doctor'}`}
      subtitle="Here's what needs your attention today."
    >
      <View style={styles.summaryGrid}>
        {summary.map((item) => (
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
        {currentAppointment && currentPatient ? (
          <>
            <View style={styles.currentToken}>
              <View style={styles.tokenBlock}>
                <AppText variant="caption" color="surface">
                  Current Token
                </AppText>
                <AppText variant="display" color="surface">
                  A-{appointments.indexOf(currentAppointment) + 5}
                </AppText>
              </View>
              <View style={styles.currentCopy}>
                <AppText variant="title">{currentPatient.fullName}</AppText>
                <AppText variant="body" color="textSecondary">
                  {currentAppointment.reason}
                </AppText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <AppButton
                accessibilityLabel="Open current patient"
                onPress={() =>
                  router.push({
                    pathname: '/doctor/patient/[id]/index',
                    params: { id: currentPatient.id },
                  })
                }
              >
                Open Patient
              </AppButton>
              <AppButton variant="secondary" accessibilityLabel="Next patient">
                Next Patient
              </AppButton>
            </View>
          </>
        ) : (
          <EmptyState title="No patients in queue" description="Upcoming appointments will appear here." />
        )}
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Care Attention" />
        {attentionItems.length === 0 ? (
          <EmptyState title="No attention items" description="Your care queue is clear." />
        ) : (
          attentionItems.map((item) => {
            const patient = patientRepository.getById(item.patientId);

            return (
              <AttentionCard
                key={item.id}
                patient={patient?.fullName ?? item.patientId}
                issue={item.title}
                detail={item.description}
                status={item.severity.toUpperCase()}
                statusType={item.severity === 'high' ? 'danger' : item.severity === 'warning' ? 'warning' : 'info'}
                onPress={() =>
                  router.push({
                    pathname: '/doctor/patient/[id]/index',
                    params: { id: item.patientId },
                  })
                }
              />
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Appointment Requests" />
        {requests.length === 0 ? (
          <EmptyState title="No appointment requests" description="New requests will appear here." />
        ) : (
          requests.slice(0, 2).map((request) => {
            const patient = patientRepository.getById(request.patientId);

            return (
          <Card key={request.id} contentStyle={styles.requestContent}>
            <View style={styles.requestTop}>
              <View style={styles.requestIcon}>
                <DoctorIcon name={{ android: 'event_available', web: 'event_available' }} />
              </View>
              <View style={styles.requestCopy}>
                <AppText variant="title">{patient?.fullName ?? request.patientId}</AppText>
                <AppText variant="body" color="textSecondary">
                  {request.reason}
                </AppText>
                <StatusBadge status="info">{`${request.date} - ${request.time}`}</StatusBadge>
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

function severityRank(severity: 'info' | 'warning' | 'high') {
  if (severity === 'high') return 0;
  if (severity === 'warning') return 1;
  return 2;
}
