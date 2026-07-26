import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockSeed } from '@/data/mockSeed';
import type {
  AdherenceEvent,
  Appointment,
  CarePlan,
  CarePlanItem,
  CareTask,
  Consultation,
  Doctor,
  Patient,
} from '@/domain';
import {
  adherenceRepository,
  appointmentRepository,
  carePlanRepository,
  careTaskRepository,
  doctorRepository,
  patientRepository,
} from '@/repositories';

export const patientCacheVersion = 1;
export const patientCacheKey = '@arogya-link/offline-patient-v1';

export type OfflinePatientSnapshot = {
  version: number;
  cachedAt: string;
  patient: Patient;
  doctor: Doctor | null;
  carePlan: CarePlan | null;
  carePlanItems: CarePlanItem[];
  careTasks: CareTask[];
  adherenceEvents: AdherenceEvent[];
  appointments: Appointment[];
  consultations: Consultation[];
};

export function buildPatientSnapshot(): OfflinePatientSnapshot | null {
  const patient = patientRepository.getById('patient-001');

  if (!patient) {
    return null;
  }

  const carePlan = carePlanRepository.getActiveByPatient(patient.id) ?? null;
  const carePlanItems = carePlan ? carePlanRepository.listItemsByCarePlan(carePlan.id) : [];
  const today = new Date().toISOString().slice(0, 10);
  const appointments = appointmentRepository
    .listByPatient(patient.id)
    .filter(
      (appointment) => appointment.status === 'confirmed' && appointment.date >= today
    );

  return {
    version: patientCacheVersion,
    cachedAt: new Date().toISOString(),
    patient,
    doctor: carePlan ? doctorRepository.getById(carePlan.doctorId) ?? null : null,
    carePlan,
    carePlanItems,
    careTasks: careTaskRepository
      .listByPatient(patient.id)
      .filter((task) => isToday(task.scheduledAt)),
    adherenceEvents: adherenceRepository
      .listByPatient(patient.id)
      .sort((first, second) => second.recordedAt.localeCompare(first.recordedAt))
      .slice(0, 10),
    appointments,
    consultations: mockSeed.consultations.filter(
      (consultation) => consultation.patientId === patient.id
    ),
  };
}

export async function readPatientSnapshot() {
  try {
    const storedSnapshot = await AsyncStorage.getItem(patientCacheKey);

    if (!storedSnapshot) {
      return null;
    }

    const parsedSnapshot: unknown = JSON.parse(storedSnapshot);

    return isOfflinePatientSnapshot(parsedSnapshot) ? parsedSnapshot : null;
  } catch {
    return null;
  }
}

export async function refreshPatientSnapshot() {
  const snapshot = buildPatientSnapshot();

  if (snapshot) {
    await writePatientSnapshot(snapshot);
  }

  return snapshot;
}

export async function writePatientSnapshot(snapshot: OfflinePatientSnapshot) {
  await AsyncStorage.setItem(patientCacheKey, JSON.stringify(snapshot));
}

function isOfflinePatientSnapshot(value: unknown): value is OfflinePatientSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Record<string, unknown>;

  return (
    snapshot.version === patientCacheVersion &&
    typeof snapshot.cachedAt === 'string' &&
    Boolean(snapshot.patient) &&
    Array.isArray(snapshot.carePlanItems) &&
    Array.isArray(snapshot.careTasks) &&
    Array.isArray(snapshot.adherenceEvents) &&
    Array.isArray(snapshot.appointments) &&
    Array.isArray(snapshot.consultations)
  );
}

function isToday(value: string) {
  return new Date(value).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
}
