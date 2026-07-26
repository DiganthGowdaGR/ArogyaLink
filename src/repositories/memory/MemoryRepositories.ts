import type {
  Appointment,
  AdherenceEvent,
  AttentionItem,
  CarePlan,
  CarePlanItem,
  CareTask,
  CareTaskStatus,
  Doctor,
  Patient,
} from '@/domain';

import type {
  AppointmentRepository,
  AdherenceRepository,
  AttentionRepository,
  CarePlanRepository,
  CareTaskRepository,
  DoctorRepository,
  PatientRepository,
} from '../contracts';

export class MemoryPatientRepository implements PatientRepository {
  constructor(private readonly patients: Patient[]) {}

  list() {
    return [...this.patients];
  }

  getById(id: string) {
    return this.patients.find((patient) => patient.id === id);
  }

  create(patient: Patient) {
    this.patients.push(patient);
    return patient;
  }

  update(id: string, changes: Partial<Omit<Patient, 'id'>>) {
    const patient = this.getById(id);

    return patient ? Object.assign(patient, changes) : undefined;
  }
}

export class MemoryDoctorRepository implements DoctorRepository {
  constructor(private readonly doctors: Doctor[]) {}

  list() {
    return [...this.doctors];
  }

  getById(id: string) {
    return this.doctors.find((doctor) => doctor.id === id);
  }

  create(doctor: Doctor) {
    this.doctors.push(doctor);
    return doctor;
  }

  update(id: string, changes: Partial<Omit<Doctor, 'id'>>) {
    const doctor = this.getById(id);

    return doctor ? Object.assign(doctor, changes) : undefined;
  }
}

export class MemoryAppointmentRepository implements AppointmentRepository {
  constructor(private readonly appointments: Appointment[]) {}

  list() {
    return [...this.appointments];
  }

  getById(id: string) {
    return this.appointments.find((appointment) => appointment.id === id);
  }

  listByPatient(patientId: string) {
    return this.appointments.filter((appointment) => appointment.patientId === patientId);
  }

  listByDoctor(doctorId: string) {
    return this.appointments.filter((appointment) => appointment.doctorId === doctorId);
  }

  create(appointment: Appointment) {
    this.appointments.push(appointment);
    return appointment;
  }

  update(id: string, changes: Partial<Omit<Appointment, 'id'>>) {
    const appointment = this.getById(id);

    return appointment ? Object.assign(appointment, changes) : undefined;
  }
}

export class MemoryCarePlanRepository implements CarePlanRepository {
  constructor(
    private readonly carePlans: CarePlan[],
    private readonly carePlanItems: CarePlanItem[]
  ) {}

  list() {
    return [...this.carePlans];
  }

  getById(id: string) {
    return this.carePlans.find((carePlan) => carePlan.id === id);
  }

  getByPatient(patientId: string) {
    return this.carePlans.filter((carePlan) => carePlan.patientId === patientId);
  }

  getActiveByPatient(patientId: string) {
    return this.carePlans.find(
      (carePlan) => carePlan.patientId === patientId && carePlan.status === 'active'
    );
  }

  create(carePlan: CarePlan) {
    this.carePlans.push(carePlan);
    return carePlan;
  }

  update(id: string, changes: Partial<Omit<CarePlan, 'id'>>) {
    const carePlan = this.getById(id);

    return carePlan ? Object.assign(carePlan, changes) : undefined;
  }

  listItemsByCarePlan(carePlanId: string) {
    return this.carePlanItems.filter((item) => item.carePlanId === carePlanId);
  }

  createItem(item: CarePlanItem) {
    this.carePlanItems.push(item);
    return item;
  }

  updateItem(id: string, changes: Partial<Omit<CarePlanItem, 'id'>>) {
    const item = this.carePlanItems.find((carePlanItem) => carePlanItem.id === id);

    return item ? Object.assign(item, changes) : undefined;
  }
}

export class MemoryCareTaskRepository implements CareTaskRepository {
  constructor(private readonly careTasks: CareTask[]) {}

  list() {
    return [...this.careTasks];
  }

  listByPatient(patientId: string) {
    return this.careTasks.filter((careTask) => careTask.patientId === patientId);
  }

  create(careTask: CareTask) {
    this.careTasks.push(careTask);
    return careTask;
  }

  markCompleted(id: string, completedAt?: string) {
    return this.updateStatus(id, 'completed', completedAt);
  }

  markMissed(id: string) {
    return this.updateStatus(id, 'missed');
  }

  updateStatus(id: string, status: CareTaskStatus, completedAt?: string) {
    const careTask = this.careTasks.find((task) => task.id === id);

    if (!careTask) {
      return undefined;
    }

    careTask.status = status;

    if (status === 'completed') {
      careTask.completedAt = completedAt ?? new Date().toISOString();
    } else {
      delete careTask.completedAt;
    }

    return careTask;
  }
}

export class MemoryAdherenceRepository implements AdherenceRepository {
  constructor(private readonly adherenceEvents: AdherenceEvent[]) {}

  list() {
    return [...this.adherenceEvents];
  }

  listByPatient(patientId: string) {
    return this.adherenceEvents.filter((event) => event.patientId === patientId);
  }

  listByTask(careTaskId: string) {
    return this.adherenceEvents.filter((event) => event.careTaskId === careTaskId);
  }

  create(event: AdherenceEvent) {
    this.adherenceEvents.push(event);
    return event;
  }
}

export class MemoryAttentionRepository implements AttentionRepository {
  constructor(private readonly attentionItems: AttentionItem[]) {}

  list() {
    return [...this.attentionItems];
  }

  listByDoctor(doctorId: string) {
    return this.attentionItems.filter((item) => item.doctorId === doctorId);
  }

  listUnresolvedByDoctor(doctorId: string) {
    return this.listByDoctor(doctorId).filter((item) => !item.resolved);
  }

  listByPatient(patientId: string) {
    return this.attentionItems.filter((item) => item.patientId === patientId);
  }

  listUnresolvedByPatient(patientId: string) {
    return this.listByPatient(patientId).filter((item) => !item.resolved);
  }

  create(item: AttentionItem) {
    this.attentionItems.push(item);
    return item;
  }

  markResolved(id: string) {
    const attentionItem = this.attentionItems.find((item) => item.id === id);

    if (attentionItem) {
      attentionItem.resolved = true;
    }

    return attentionItem;
  }
}
