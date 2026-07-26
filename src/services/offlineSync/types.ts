import type { AdherenceStatus } from '@/domain';

export type CompleteCareTaskAction = {
  id: string;
  type: 'completeCareTask';
  patientId: string;
  createdAt: string;
  status: 'pending';
  payload: {
    careTaskId: string;
    completedAt: string;
    adherenceEventId: string;
    adherenceStatus: Exclude<AdherenceStatus, 'missed'>;
  };
};

export type MissCareTaskAction = {
  id: string;
  type: 'missCareTask';
  patientId: string;
  createdAt: string;
  status: 'pending';
  payload: {
    careTaskId: string;
    recordedAt: string;
    adherenceEventId: string;
    reason: string;
  };
};

export type PendingSyncAction = CompleteCareTaskAction | MissCareTaskAction;
