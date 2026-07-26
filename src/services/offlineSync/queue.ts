import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PendingSyncAction } from './types';

export const pendingSyncQueueKey = '@arogya-link/pending-sync-v1';

export async function listPendingActions() {
  try {
    const storedActions = await AsyncStorage.getItem(pendingSyncQueueKey);

    if (!storedActions) {
      return [];
    }

    const parsedActions: unknown = JSON.parse(storedActions);

    return Array.isArray(parsedActions)
      ? parsedActions.filter(isPendingSyncAction)
      : [];
  } catch {
    return [];
  }
}

export async function enqueueAction(action: PendingSyncAction) {
  const actions = await listPendingActions();
  const existingAction = actions.find(
    (existing) =>
      existing.type === action.type &&
      existing.payload.careTaskId === action.payload.careTaskId
  );

  if (existingAction) {
    return existingAction;
  }

  const nextActions = [...actions, action].sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt)
  );
  await AsyncStorage.setItem(pendingSyncQueueKey, JSON.stringify(nextActions));

  return action;
}

export async function removeAction(actionId: string) {
  const actions = await listPendingActions();
  const nextActions = actions.filter((action) => action.id !== actionId);

  await AsyncStorage.setItem(pendingSyncQueueKey, JSON.stringify(nextActions));
}

export async function clearQueue() {
  await AsyncStorage.removeItem(pendingSyncQueueKey);
}

function isPendingSyncAction(value: unknown): value is PendingSyncAction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const action = value as Record<string, unknown>;
  const payload = action.payload as Record<string, unknown> | undefined;

  return (
    typeof action.id === 'string' &&
    (action.type === 'completeCareTask' || action.type === 'missCareTask') &&
    typeof action.patientId === 'string' &&
    typeof action.createdAt === 'string' &&
    action.status === 'pending' &&
    Boolean(payload) &&
    typeof payload?.careTaskId === 'string' &&
    typeof payload?.adherenceEventId === 'string'
  );
}
