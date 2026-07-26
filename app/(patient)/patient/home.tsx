import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AdherenceReasonPanel } from '@/components/patient/AdherenceReasonPanel';
import {
  ActionCard,
  AppButton,
  AppText,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { demoIdentities } from '@/config/demoIdentities';
import type { AppointmentStatus, CareTask } from '@/domain';
import { evaluateAttentionForPatient } from '@/services/attentionService';
import {
  adherenceRepository,
  appointmentRepository,
  carePlanRepository,
  careTaskRepository,
  doctorRepository,
} from '@/repositories';
import { colors, spacing } from '@/theme';

export default function PatientHomeScreen() {
  const router = useRouter();
  const [, refreshTasks] = useState(0);
  const [reasonTaskId, setReasonTaskId] = useState<string | null>(null);
  const appointments = appointmentRepository.listByPatient(demoIdentities.patientId);
  const nextAppointment = appointments.find(
    (appointment) => appointment.status === 'requested' || appointment.status === 'confirmed'
  );
  const nextDoctor = nextAppointment
    ? doctorRepository.getById(nextAppointment.doctorId)
    : undefined;
  const carePlan = carePlanRepository.getByPatient(demoIdentities.patientId)[0];
  const medication = carePlan
    ? carePlanRepository
        .listItemsByCarePlan(carePlan.id)
        .find((item) => item.type === 'medication')
    : undefined;
  const medicationTask = medication
    ? careTaskRepository
        .listByPatient(demoIdentities.patientId)
        .find((task) => task.carePlanItemId === medication.id)
    : undefined;
  const careItems = carePlan
    ? carePlanRepository.listItemsByCarePlan(carePlan.id)
    : [];
  const todayTasks = careTaskRepository
    .listByPatient(demoIdentities.patientId)
    .filter((task) => isToday(task.scheduledAt) && task.status === 'pending');

  const handleCompleted = (task: CareTask) => {
    const recordedAt = new Date();
    const scheduledAt = new Date(task.scheduledAt);
    const status =
      recordedAt.getTime() - scheduledAt.getTime() > 60 * 60 * 1000 ? 'late' : 'onTime';

    careTaskRepository.markCompleted(task.id, recordedAt.toISOString());
    adherenceRepository.create({
      id: `adherence-event-${recordedAt.toISOString()}`,
      careTaskId: task.id,
      patientId: task.patientId,
      recordedAt: recordedAt.toISOString(),
      status,
    });
    evaluateAttentionForPatient(task.patientId);
    refreshTasks((value) => value + 1);
  };

  const handleMissed = (task: CareTask, reason: string) => {
    const recordedAt = new Date().toISOString();

    careTaskRepository.markMissed(task.id);
    adherenceRepository.create({
      id: `adherence-event-${recordedAt}`,
      careTaskId: task.id,
      patientId: task.patientId,
      recordedAt,
      status: 'missed',
      reason,
    });
    evaluateAttentionForPatient(task.patientId);
    setReasonTaskId(null);
    refreshTasks((value) => value + 1);
  };

  return (
    <PatientScreen
      eyebrow="ArogyaLink"
      title="Good morning"
      subtitle="Let's take care of your health today."
    >
      <Card contentStyle={styles.cardContent}>
        {nextAppointment && nextDoctor ? (
          <>
            <SectionHeader
              title="Next Appointment"
              subtitle={`${nextDoctor.fullName} - ${nextDoctor.specialization}`}
            />
            <View style={styles.detailGroup}>
              <AppText variant="bodyStrong">{nextDoctor.clinicName}</AppText>
              <AppText variant="body" color="textSecondary">
                {nextAppointment.date} - {nextAppointment.time}
              </AppText>
              <StatusBadge status={appointmentStatus(nextAppointment.status)}>
                {nextAppointment.status}
              </StatusBadge>
            </View>
            <AppButton accessibilityLabel="View next appointment">
              View Appointment
            </AppButton>
          </>
        ) : (
          <EmptyState title="No upcoming appointments" description="Your next visit will appear here." />
        )}
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionGrid}>
          <ActionCard
            icon={<PatientIcon name={{ android: 'calendar_month', web: 'calendar_month' }} />}
            label="Book Appointment"
            accessibilityLabel="Book appointment"
            onPress={() => router.push('/patient/doctors')}
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

      <View style={styles.section}>
        <SectionHeader title="Today's Care" subtitle="Tasks scheduled for today" />
        {todayTasks.length === 0 ? (
          <EmptyState title="No care tasks scheduled for today." />
        ) : (
          todayTasks.map((task) => {
            const item = careItems.find((careItem) => careItem.id === task.carePlanItemId);

            return (
              <Card key={task.id} contentStyle={styles.careTaskContent}>
                <View style={styles.careTaskHeader}>
                  <View style={styles.careTaskCopy}>
                    <AppText variant="title">
                      {item?.title ?? 'Care task'}
                      {item?.dosage ? ` ${item.dosage}` : ''}
                    </AppText>
                    <AppText variant="body" color="textSecondary">
                      {formatTaskTime(task.scheduledAt)}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {item?.instructions ?? 'Follow your care plan.'}
                    </AppText>
                  </View>
                  <StatusBadge status="warning">Pending</StatusBadge>
                </View>
                {reasonTaskId === task.id ? (
                  <AdherenceReasonPanel
                    onCancel={() => setReasonTaskId(null)}
                    onSubmit={(reason) => handleMissed(task, reason)}
                  />
                ) : (
                  <View style={styles.taskActions}>
                    <AppButton
                      variant="secondary"
                      onPress={() => handleCompleted(task)}
                      accessibilityLabel={task.type === 'medication' ? 'Taken' : 'Completed'}
                    >
                      {task.type === 'medication' ? 'Taken' : 'Completed'}
                    </AppButton>
                    <AppButton
                      variant="outline"
                      onPress={() => setReasonTaskId(task.id)}
                      accessibilityLabel={task.type === 'medication' ? "Couldn't take" : 'Not done'}
                    >
                      {task.type === 'medication' ? "Couldn't Take" : 'Not Done'}
                    </AppButton>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </View>

      <Card contentStyle={styles.cardContent}>
        {medication ? (
          <>
            <SectionHeader title="Today's Medicine" />
            <View style={styles.detailGroup}>
              <AppText variant="bodyStrong">
                {medication.title} {medication.dosage ?? ''}
              </AppText>
              <AppText variant="body" color="textSecondary">
                {medication.scheduledTimes?.[0] ?? medication.dueAt ?? 'As prescribed'}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {medication.instructions ?? 'Follow your care plan instructions.'}
              </AppText>
              <StatusBadge status={taskStatus(medicationTask?.status ?? medication.status)}>
                {medicationTask?.status ?? medication.status}
              </StatusBadge>
            </View>
            <AppButton variant="secondary" accessibilityLabel="View medication">
              View Medication
            </AppButton>
          </>
        ) : (
          <EmptyState title="No current medication" description="Your active care plan has no medication yet." />
        )}
      </Card>

      <Card contentStyle={styles.cardContent}>
        <SectionHeader title="Recent Update" />
        <View style={styles.updateRow}>
          <View style={styles.updateIcon}>
            <PatientIcon name={{ android: 'clinical_notes', web: 'clinical_notes' }} />
          </View>
          <View style={styles.updateCopy}>
            <AppText variant="bodyStrong">
              New care plan added by {nextDoctor?.fullName ?? 'your doctor'}
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

function appointmentStatus(status: AppointmentStatus) {
  if (status === 'cancelled' || status === 'declined') return 'danger' as const;
  if (status === 'requested') return 'warning' as const;
  return status === 'completed' ? 'neutral' as const : 'success' as const;
}

function taskStatus(status: 'pending' | 'completed' | 'missed' | 'cancelled') {
  if (status === 'missed' || status === 'cancelled') return 'danger' as const;
  if (status === 'completed') return 'success' as const;
  return 'warning' as const;
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
  careTaskContent: {
    gap: spacing.md,
  },
  careTaskCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  careTaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailGroup: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  taskActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

function isToday(value: string) {
  return new Date(value).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function formatTaskTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
