import type { CarePlanItemType } from './carePlan';

export type CareTaskStatus = 'pending' | 'completed' | 'missed';

export type CareTask = {
  id: string;
  patientId: string;
  carePlanItemId: string;
  type: CarePlanItemType;
  scheduledAt: string;
  status: CareTaskStatus;
  completedAt?: string;
};
