export type AdherenceStatus = 'onTime' | 'late' | 'missed';

export type AdherenceEvent = {
  id: string;
  careTaskId: string;
  patientId: string;
  recordedAt: string;
  status: AdherenceStatus;
  reason?: string;
};
