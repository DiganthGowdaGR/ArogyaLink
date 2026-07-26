import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { PatientIcon } from '@/components/patient/PatientIcon';
import { PatientScreen } from '@/components/patient/PatientScreen';
import { AdherenceReasonPanel } from '@/components/patient/AdherenceReasonPanel';
import { AppButton, AppText, Card, EmptyState, SectionHeader, StatusBadge } from '@/components/ui';
import type { CareTask } from '@/domain';
import { evaluateAttentionForPatient } from '@/services/attentionService';
import {
  adherenceRepository,
  carePlanRepository,
  careTaskRepository,
} from '@/repositories';
import { colors, radius, spacing } from '@/theme';
import { usePatientOfflineData } from '@/services/offline';
import {
  enqueueAction,
  type CompleteCareTaskAction,
  type MissCareTaskAction,
} from '@/services/offlineSync';

export default function PatientMedicationsScreen() {
  const [, refreshMedication] = useState(0);
  const [reasonTaskId, setReasonTaskId] = useState<string | null>(null);
  const {
    adherenceEvents,
    carePlan,
    carePlanItems,
    careTasks,
    doctor,
    isCacheLoading,
    isOffline,
    pendingActions,
    refreshCache,
    refreshPendingActions,
    updateCachedTask,
  } = usePatientOfflineData();
  const medications = carePlanItems.filter((item) => item.type === 'medication');

  if (isCacheLoading) {
    return (
      <PatientScreen title="My Medications" subtitle="Medicines prescribed by your doctor">
        <AppText variant="body" color="textSecondary">
          Loading saved care information...
        </AppText>
      </PatientScreen>
    );
  }

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
    refreshMedication((value) => value + 1);
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
    refreshMedication((value) => value + 1);
  };

  const recentEvents = [...adherenceEvents]
    .sort((first, second) => second.recordedAt.localeCompare(first.recordedAt))
    .slice(0, 5);

  return (
    <PatientScreen
      title="My Medications"
      subtitle="Medicines prescribed by your doctor"
    >
      {isOffline ? (
        <AppText variant="caption" color="textSecondary">
          Saved on this device
        </AppText>
      ) : null}
      {medications.length === 0 ? (
        <EmptyState title="No medications" description="Your active prescriptions will appear here." />
      ) : (
        <Card contentStyle={styles.cardContent}>
          <SectionHeader
            title="Current Prescription"
            subtitle={`Prescribed by ${doctor?.fullName ?? 'your doctor'}`}
          />
          {medications.map((medication) => {
            const medicationTask = careTasks.find(
              (task) => task.carePlanItemId === medication.id && task.status !== 'missed'
            ) ?? careTasks.find((task) => task.carePlanItemId === medication.id);
            const latestEvent = medicationTask
              ? latestEventForTask(adherenceEvents, medicationTask.id)
              : undefined;
            const status = medicationStatus(medicationTask, latestEvent);

            return (
              <View key={medication.id} style={styles.medicationBlock}>
                <View style={styles.medicationRow}>
                  <View style={styles.iconArea}>
                    <PatientIcon name={{ android: 'medication', web: 'medication' }} />
                  </View>
                  <View style={styles.medicationCopy}>
                    <AppText variant="title">{medication.title}</AppText>
                    <AppText variant="body" color="textSecondary">
                      {medication.dosage ?? 'As prescribed'}
                    </AppText>
                    <AppText variant="body" color="textSecondary">
                      {medication.instructions ?? 'Follow your care plan instructions.'}
                    </AppText>
                    <AppText variant="bodyStrong">
                      {medication.scheduledTimes?.join(' / ') ?? 'Scheduled by your doctor'}
                    </AppText>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View>
                    <AppText variant="caption" color="textSecondary">
                      Duration
                    </AppText>
                    <AppText variant="bodyStrong">
                      {medication.durationDays ? `${medication.durationDays} days` : 'Ongoing'}
                    </AppText>
                  </View>
                <StatusBadge status={statusBadge(status)}>
                  {hasPendingSync(medicationTask?.id, pendingActions) ? `${status} · Pending Sync` : status}
                </StatusBadge>
              </View>
                {medicationTask?.status === 'pending' ? (
                  reasonTaskId === medicationTask.id ? (
                    <AdherenceReasonPanel
                      onCancel={() => setReasonTaskId(null)}
                      onSubmit={(reason) => void handleMissed(medicationTask, reason)}
                    />
                  ) : (
                    <View style={styles.taskActions}>
                      <AppButton
                        variant="secondary"
                        onPress={() => void handleCompleted(medicationTask)}
                        accessibilityLabel="Taken"
                      >
                        Taken
                      </AppButton>
                      <AppButton
                        variant="outline"
                        onPress={() => setReasonTaskId(medicationTask.id)}
                        accessibilityLabel="Couldn't take"
                      >
                        {"Couldn't Take"}
                      </AppButton>
                    </View>
                  )
                ) : null}
              </View>
            );
          })}
        </Card>
      )}

      <Card contentStyle={styles.scheduleContent}>
        <SectionHeader title="Today's Schedule" />
        {medications.length === 0 ? (
          <EmptyState title="No medication schedule" />
        ) : (
          medications.flatMap((medication) =>
            (medication.scheduledTimes ?? ['As prescribed']).map((time) => (
              <View key={`${medication.id}-${time}`} style={styles.scheduleItem}>
                <AppText variant="title">{time}</AppText>
                <View style={styles.scheduleCopy}>
                  <AppText variant="bodyStrong">{medication.title}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    Follow your care plan instructions.
                  </AppText>
                </View>
              </View>
            ))
          )
        )}
      </Card>

      <Card contentStyle={styles.historyContent}>
        <SectionHeader title="Recent Adherence" />
        {recentEvents.length === 0 ? (
          <EmptyState title="No adherence activity yet." />
        ) : (
          recentEvents.map((event) => {
            const task = careTasks.find((careTask) => careTask.id === event.careTaskId);
            const item = task ? carePlanRepository.listItemsByCarePlan(carePlan?.id ?? '').find((careItem) => careItem.id === task.carePlanItemId) : undefined;

            return (
              <View key={event.id} style={styles.historyRow}>
                <View style={styles.historyCopy}>
                  <AppText variant="bodyStrong">{formatEventTime(event.recordedAt)}</AppText>
                  <AppText variant="body" color="textSecondary">
                    {item?.title ?? 'Care task'}
                  </AppText>
                  {event.reason ? (
                    <AppText variant="caption" color="textSecondary">
                      Reason: {event.reason}
                    </AppText>
                  ) : null}
                </View>
                <StatusBadge status={statusBadge(event.status)}>{eventStatusLabel(event.status)}</StatusBadge>
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <AppText variant="bodyStrong" color="primary" style={styles.infoText}>
          Only your doctor can update your prescription.
        </AppText>
      </Card>
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: spacing.lg,
  },
  historyContent: {
    gap: spacing.md,
  },
  historyCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconArea: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.primaryLight,
  },
  infoText: {
    textAlign: 'center',
  },
  medicationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  medicationBlock: {
    gap: spacing.md,
  },
  medicationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  scheduleContent: {
    gap: spacing.lg,
  },
  scheduleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
  taskActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});

function latestEventForTask(events: ReturnType<typeof adherenceRepository.list>, taskId: string) {
  return [...events]
    .filter((event) => event.careTaskId === taskId)
    .sort((first, second) => second.recordedAt.localeCompare(first.recordedAt))[0];
}

function medicationStatus(
  task: CareTask | undefined,
  event: ReturnType<typeof adherenceRepository.list>[number] | undefined
) {
  if (event?.status === 'onTime') return 'On Time';
  if (event?.status === 'late') return 'Late';
  if (event?.status === 'missed' || task?.status === 'missed') return 'Missed';
  if (task?.status === 'completed') return 'Completed';
  return 'Pending';
}

function eventStatusLabel(status: 'onTime' | 'late' | 'missed') {
  if (status === 'onTime') return 'On Time';
  if (status === 'late') return 'Late';
  return 'Missed';
}

function statusBadge(status: string) {
  if (status === 'On Time' || status === 'Completed') return 'success' as const;
  if (status === 'Late') return 'info' as const;
  if (status === 'Missed') return 'danger' as const;
  return 'warning' as const;
}

function hasPendingSync(
  taskId: string | undefined,
  actions: { payload: { careTaskId: string } }[]
) {
  return taskId ? actions.some((action) => action.payload.careTaskId === taskId) : false;
}

function formatEventTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const dayLabel = date.toDateString() === today.toDateString() ? 'Today' : date.toLocaleDateString();
  return `${dayLabel} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
