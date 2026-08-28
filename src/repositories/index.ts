import { mockSeed } from '@/data/mockSeed';

import {
  MemoryAppointmentRepository,
  MemoryAdherenceRepository,
  MemoryAttentionRepository,
  MemoryCarePlanRepository,
  MemoryCareTaskRepository,
  MemoryDoctorRepository,
  MemoryPatientRepository,
} from './memory/MemoryRepositories';

export type {
  AppointmentRepository,
  AdherenceRepository,
  AttentionRepository,
  CarePlanRepository,
  CareTaskRepository,
  DoctorRepository,
  PatientRepository,
} from './contracts';

export const patientRepository = new MemoryPatientRepository(mockSeed.patients);
export const doctorRepository = new MemoryDoctorRepository(mockSeed.doctors);
export const appointmentRepository = new MemoryAppointmentRepository(mockSeed.appointments);
export const carePlanRepository = new MemoryCarePlanRepository(
  mockSeed.carePlans,
  mockSeed.carePlanItems
);
export const careTaskRepository = new MemoryCareTaskRepository(mockSeed.careTasks);
export const adherenceRepository = new MemoryAdherenceRepository(mockSeed.adherenceEvents);
export const attentionRepository = new MemoryAttentionRepository(mockSeed.attentionItems);
