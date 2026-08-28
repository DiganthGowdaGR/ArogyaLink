import { adherenceRepository, careTaskRepository } from '@/repositories';
import { evaluateAttentionForPatient } from '@/services/attentionService';

import { listPendingActions, removeAction } from './queue';
import type { PendingSyncAction } from './types';

export async function processPendingActions() {
  const actions = (await listPendingActions()).sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt)
  );
  let processed = 0;
  let failed = 0;

  for (const action of actions) {
    try {
      applyAction(action);
      await removeAction(action.id);
      processed += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    processed,
    failed,
    remaining: actions.length - processed,
  };
}

function applyAction(action: PendingSyncAction) {
  const task = careTaskRepository
    .listByPatient(action.patientId)
    .find((careTask) => careTask.id === action.payload.careTaskId);

  if (!task) {
    throw new Error(`Care task ${action.payload.careTaskId} was not found`);
  }

  const existingEvent = adherenceRepository
    .listByTask(task.id)
    .find((event) => event.id === action.payload.adherenceEventId);

  if (action.type === 'completeCareTask') {
    if (task.status !== 'completed') {
      careTaskRepository.markCompleted(task.id, action.payload.completedAt);
    }

    if (!existingEvent) {
      adherenceRepository.create({
        id: action.payload.adherenceEventId,
        careTaskId: task.id,
        patientId: action.patientId,
        recordedAt: action.payload.completedAt,
        status: action.payload.adherenceStatus,
      });
    }

    return;
  }

  if (task.status !== 'missed') {
    careTaskRepository.markMissed(task.id);
  }

  if (!existingEvent) {
    adherenceRepository.create({
      id: action.payload.adherenceEventId,
      careTaskId: task.id,
      patientId: action.patientId,
      recordedAt: action.payload.recordedAt,
      status: 'missed',
      reason: action.payload.reason,
    });
  }

  evaluateAttentionForPatient(action.patientId);
}
