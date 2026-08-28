export type CarePlanStatus = 'active' | 'completed' | 'cancelled';
export type CarePlanItemType = 'medication' | 'test' | 'referral' | 'followUp';
export type CarePlanItemStatus = 'pending' | 'completed' | 'missed' | 'cancelled';

export type CarePlan = {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  status: CarePlanStatus;
};

export type CarePlanItem = {
  id: string;
  carePlanId: string;
  type: CarePlanItemType;
  title: string;
  instructions?: string;
  dueAt?: string;
  status: CarePlanItemStatus;
  dosage?: string;
  scheduledTimes?: string[];
  durationDays?: number;
  speciality?: string;
  referredDoctorId?: string;
};
