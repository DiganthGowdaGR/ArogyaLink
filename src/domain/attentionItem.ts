export type AttentionItemType =
  | 'adherence'
  | 'appointment'
  | 'carePlan'
  | 'medication_access'
  | 'possible_side_effect'
  | 'repeated_missed_medication'
  | 'overdue_test'
  | 'overdue_referral'
  | 'overdue_follow_up';
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
