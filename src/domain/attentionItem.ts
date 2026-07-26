export type AttentionItemType = 'adherence' | 'appointment' | 'carePlan';
export type AttentionSeverity = 'info' | 'warning' | 'high';

export type AttentionItem = {
  id: string;
  patientId: string;
  doctorId: string;
  type: AttentionItemType;
  title: string;
  description: string;
  severity: AttentionSeverity;
  createdAt: string;
  resolved: boolean;
};
