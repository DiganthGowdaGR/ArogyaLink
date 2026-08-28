import type {
  Appointment,
  AttentionItem,
  CarePlan,
  CarePlanItem,
  CareTask,
  CareTaskStatus,
  AdherenceEvent,
  Doctor,
  Patient,
} from '@/domain';

export type PatientRepository = {
  list: () => Patient[];
  getById: (id: string) => Patient | undefined;
  create: (patient: Patient) => Patient;
  update: (id: string, changes: Partial<Omit<Patient, 'id'>>) => Patient | undefined;
};

export type DoctorRepository = {
  list: () => Doctor[];
  getById: (id: string) => Doctor | undefined;
  create: (doctor: Doctor) => Doctor;
  update: (id: string, changes: Partial<Omit<Doctor, 'id'>>) => Doctor | undefined;
};

export type AppointmentRepository = {
  list: () => Appointment[];
  getById: (id: string) => Appointment | undefined;
  listByPatient: (patientId: string) => Appointment[];
  listByDoctor: (doctorId: string) => Appointment[];
  isSlotAvailable: (doctorId: string, date: string, time: string) => boolean;
  create: (appointment: Appointment) => Appointment;
  update: (id: string, changes: Partial<Omit<Appointment, 'id'>>) => Appointment | undefined;
  updateStatus: (id: string, status: Appointment['status']) => Appointment | undefined;
  confirmWithToken: (id: string) => Appointment | undefined;
  decline: (id: string) => Appointment | undefined;
  completeAppointment: (id: string) => Appointment | undefined;
  getConfirmedForDoctorDate: (doctorId: string, date: string) => Appointment[];
};

export type CarePlanRepository = {
  list: () => CarePlan[];
  getById: (id: string) => CarePlan | undefined;
  getByPatient: (patientId: string) => CarePlan[];
  getActiveByPatient: (patientId: string) => CarePlan | undefined;
  create: (carePlan: CarePlan) => CarePlan;
  update: (id: string, changes: Partial<Omit<CarePlan, 'id'>>) => CarePlan | undefined;
  listItemsByCarePlan: (carePlanId: string) => CarePlanItem[];
  createItem: (item: CarePlanItem) => CarePlanItem;
  updateItem: (id: string, changes: Partial<Omit<CarePlanItem, 'id'>>) => CarePlanItem | undefined;
};

export type CareTaskRepository = {
  list: () => CareTask[];
  listByPatient: (patientId: string) => CareTask[];
  create: (careTask: CareTask) => CareTask;
  markCompleted: (id: string, completedAt?: string) => CareTask | undefined;
  markMissed: (id: string) => CareTask | undefined;
  updateStatus: (id: string, status: CareTaskStatus, completedAt?: string) => CareTask | undefined;
};

export type AdherenceRepository = {
  list: () => AdherenceEvent[];
  listByPatient: (patientId: string) => AdherenceEvent[];
  listByTask: (careTaskId: string) => AdherenceEvent[];
  create: (event: AdherenceEvent) => AdherenceEvent;
};

export type AttentionRepository = {
  list: () => AttentionItem[];
  listByDoctor: (doctorId: string) => AttentionItem[];
  listUnresolvedByDoctor: (doctorId: string) => AttentionItem[];
  listByPatient: (patientId: string) => AttentionItem[];
  listUnresolvedByPatient: (patientId: string) => AttentionItem[];
  create: (item: AttentionItem) => AttentionItem;
  markResolved: (id: string) => AttentionItem | undefined;
};
