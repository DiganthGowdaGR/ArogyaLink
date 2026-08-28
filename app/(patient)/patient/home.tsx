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
import type { AppointmentStatus, CareTask } from '@/domain';
import { evaluateAttentionForPatient } from '@/services/attentionService';
import {
  adherenceRepository,
  careTaskRepository,
} from '@/repositories';
import { colors, spacing } from '@/theme';
import { useConnectivity } from '@/services/connectivity';
import { usePatientOfflineData } from '@/services/offline';
import {
  enqueueAction,
  type CompleteCareTaskAction,
  type MissCareTaskAction,
} from '@/services/offlineSync';

export default function PatientHomeScreen() {
  const router = useRouter();
  const [, refreshTasks] = useState(0);
  const [reasonTaskId, setReasonTaskId] = useState<string | null>(null);
  const { isOffline } = useConnectivity();
  const {
    appointments,
    carePlan,
    carePlanItems,
    careTasks,
    doctor,
    isCacheLoading,
    pendingActions,
    pendingSyncCount,
    refreshCache,
    refreshPendingActions,
    syncStatus,
    updateCachedTask,
  } = usePatientOfflineData();
  if (isCacheLoading) {
    return (
      <PatientScreen title="Good morning" subtitle="Let's take care of your health today.">
        <AppText variant="body" color="textSecondary">
          Loading saved care information...
        </AppText>
      </PatientScreen>
    );
  }
  const nextAppointment = appointments.find(
    (appointment) => appointment.status === 'requested' || appointment.status === 'confirmed'
  );
  const nextDoctor = doctor;
  const medication = carePlan
    ? carePlanItems.find((item) => item.type === 'medication')
    : undefined;
  const medicationTask = medication
    ? careTasks.find((task) => task.carePlanItemId === medication.id)
    : undefined;
  const careItems = carePlanItems;
  const todayTasks = careTasks.filter((task) => isToday(task.scheduledAt));

  const handleCompleted = async (task: CareTask) => {
    const recordedAt = new Date();
    const scheduledAt = new Date(task.scheduledAt);
    const status =
      recordedAt.getTime() - scheduledAt.getTime() > 60 * 60 * 1000 ? 'late' : 'onTime';
    const recordedAtValue = recordedAt.toISOString();

    if (isOffline) {
      const actionId = `offline-completeCareTask-${task.id}`;
      const action: CompleteCareTaskAction = {
        id: actionId,
        type: 'completeCareTask',
        patientId: task.patientId,
        createdAt: recordedAtValue,
        status: 'pending',
        payload: {
          careTaskId: task.id,
          completedAt: recordedAtValue,
          adherenceEventId: `adherence-${actionId}`,
          adherenceStatus: status,
        },
      };

      await enqueueAction(action);
      await updateCachedTask({
        taskId: task.id,
        status: 'completed',
        recordedAt: recordedAtValue,
        adherenceEventId: action.payload.adherenceEventId,
        adherenceStatus: status,
      });
      await refreshPendingActions();
    } else {
      careTaskRepository.markCompleted(task.id, recordedAtValue);
      adherenceRepository.create({
        id: `adherence-event-${recordedAtValue}`,
        careTaskId: task.id,
        patientId: task.patientId,
        recordedAt: recordedAtValue,
        status,
      });
      evaluateAttentionForPatient(task.patientId);
      await refreshCache();
    }
    refreshTasks((value) => value + 1);
  };

  const handleMissed = async (task: CareTask, reason: string) => {
    const recordedAt = new Date().toISOString();

    if (isOffline) {
      const actionId = `offline-missCareTask-${task.id}`;
      const action: MissCareTaskAction = {
        id: actionId,
        type: 'missCareTask',
        patientId: task.patientId,
        createdAt: recordedAt,
        status: 'pending',
        payload: {
          careTaskId: task.id,
          recordedAt,
          adherenceEventId: `adherence-${actionId}`,
          reason,
        },
      };

      await enqueueAction(action);
      await updateCachedTask({
        taskId: task.id,
        status: 'missed',
        recordedAt,
        adherenceEventId: action.payload.adherenceEventId,
        adherenceStatus: 'missed',
        reason,
      });
      await refreshPendingActions();
    } else {
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
      await refreshCache();
    }
    setReasonTaskId(null);
    refreshTasks((value) => value + 1);
  };

  return (
    <PatientScreen
      eyebrow="ArogyaLink"
      title="Good morning"
      subtitle="Let's take care of your health today."
    >
      {isOffline ? (
        <AppText variant="caption" color="textSecondary">
          Saved on this device
        </AppText>
      ) : null}
      {pendingSyncCount > 0 ? (
        <Card contentStyle={styles.syncCard}>
          <AppText variant="bodyStrong" color="primary">
            {pendingSyncCount} change{pendingSyncCount === 1 ? '' : 's'} waiting to sync
          </AppText>
          <AppText variant="caption" color="textSecondary">
            Saved offline - will sync when connected.
          </AppText>
        </Card>
      ) : syncStatus === 'synced' ? (
        <Card contentStyle={styles.syncCard}>
          <AppText variant="bodyStrong" color="success">All changes synced</AppText>
        </Card>
      ) : null}
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
            description={isOffline ? 'Internet connection required' : undefined}
            accessibilityLabel="Book appointment"
            onPress={isOffline ? undefined : () => router.push('/patient/doctors')}
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
                  <StatusBadge status={taskStatus(task.status)}>
                    {taskLabel(task.status, hasPendingSync(task.id, pendingActions))}
                  </StatusBadge>
                </View>
                {task.status === 'pending' && reasonTaskId === task.id ? (
                  <AdherenceReasonPanel
                    onCancel={() => setReasonTaskId(null)}
                    onSubmit={(reason) => void handleMissed(task, reason)}
                  />
                ) : task.status === 'pending' ? (
                  <View style={styles.taskActions}>
                    <AppButton
                      variant="secondary"
                      onPress={() => void handleCompleted(task)}
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
                ) : null}
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

function taskLabel(
  status: 'pending' | 'completed' | 'missed' | 'cancelled',
  pendingSync: boolean
) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return pendingSync ? `${label} · Pending Sync` : label;
}

function hasPendingSync(taskId: string, actions: { payload: { careTaskId: string } }[]) {
  return actions.some((action) => action.payload.careTaskId === taskId);
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
  syncCard: {
    gap: spacing.xs,
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
