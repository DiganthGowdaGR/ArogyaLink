import type {
  Appointment,
  AttentionItem,
  CarePlan,
  CarePlanItem,
  CareTask,
  CareTaskStatus,
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
  create: (appointment: Appointment) => Appointment;
  update: (id: string, changes: Partial<Omit<Appointment, 'id'>>) => Appointment | undefined;
};

export type CarePlanRepository = {
  list: () => CarePlan[];
  getById: (id: string) => CarePlan | undefined;
  getByPatient: (patientId: string) => CarePlan[];
  create: (carePlan: CarePlan) => CarePlan;
  update: (id: string, changes: Partial<Omit<CarePlan, 'id'>>) => CarePlan | undefined;
  listItemsByCarePlan: (carePlanId: string) => CarePlanItem[];
  createItem: (item: CarePlanItem) => CarePlanItem;
  updateItem: (id: string, changes: Partial<Omit<CarePlanItem, 'id'>>) => CarePlanItem | undefined;
};

export type CareTaskRepository = {
  list: () => CareTask[];
  listByPatient: (patientId: string) => CareTask[];
  updateStatus: (id: string, status: CareTaskStatus, completedAt?: string) => CareTask | undefined;
};

export type AttentionRepository = {
  list: () => AttentionItem[];
  listByDoctor: (doctorId: string) => AttentionItem[];
  create: (item: AttentionItem) => AttentionItem;
  markResolved: (id: string) => AttentionItem | undefined;
};
