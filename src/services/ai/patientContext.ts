import { mockSeed } from '@/data/mockSeed';
import type { AttentionSeverity } from '@/domain';
import {
  adherenceRepository,
  appointmentRepository,
  attentionRepository,
  carePlanRepository,
  careTaskRepository,
  patientRepository,
} from '@/repositories';

export type DoctorPatientContext = {
  patientName: string;
  history: string;
  carePlan: string;
};

export function buildDoctorPatientContext(patientId: string): DoctorPatientContext | null {
  const patient = patientRepository.getById(patientId);

  if (!patient) {
    return null;
  }

  const activeCarePlan = carePlanRepository.getActiveByPatient(patient.id);
  const carePlanItems = activeCarePlan
    ? carePlanRepository.listItemsByCarePlan(activeCarePlan.id)
    : [];
  const medicationTaskIds = careTaskRepository
    .listByPatient(patient.id)
    .filter((task) => task.type === 'medication')
    .map((task) => task.id);
  const adherenceEvents = adherenceRepository
    .listByPatient(patient.id)
    .filter((event) => medicationTaskIds.includes(event.careTaskId));
  const unresolvedAlerts = attentionRepository
    .listUnresolvedByPatient(patient.id)
    .sort((first, second) => severityRank(first.severity) - severityRank(second.severity));
  const recentMissedReasons = [...new Set(
    adherenceEvents
      .filter((event) => event.status === 'missed' && event.reason)
      .sort((first, second) => second.recordedAt.localeCompare(first.recordedAt))
      .map((event) => event.reason as string)
  )].slice(0, 4);
  const consultations = mockSeed.consultations
    .filter((consultation) => consultation.patientId === patient.id)
    .sort((first, second) => second.date.localeCompare(first.date));
  const latestConsultation = consultations[0];
  const latestAppointment = latestConsultation
    ? appointmentRepository.getById(latestConsultation.appointmentId)
    : undefined;

  const history = [
    `${patient.age}-year-old ${patient.gender} patient.`,
    `Known conditions: ${patient.conditions.join(', ') || 'none recorded'}.`,
    `Allergies: ${patient.allergies.join(', ') || 'none recorded'}.`,
    `Medication adherence: ${adherenceEvents.filter((event) => event.status === 'onTime').length} on-time, ${adherenceEvents.filter((event) => event.status === 'late').length} late, ${adherenceEvents.filter((event) => event.status === 'missed').length} missed.`,
    `Recent missed reasons: ${recentMissedReasons.join(', ') || 'none recorded'}.`,
    `Unresolved care alerts: ${formatAlerts(unresolvedAlerts)}.`,
    `Latest visit: ${latestConsultation ? `${latestConsultation.date}${latestAppointment?.reason ? ` for ${latestAppointment.reason}` : ''}.` : 'none recorded.'}`,
    latestConsultation?.notes ? `Patient-reported notes: ${latestConsultation.notes}` : '',
  ].filter(Boolean).join(' ');
  const carePlan = carePlanItems.length > 0
    ? carePlanItems.map((item) => `${item.title} (${item.type}${item.dosage ? `, ${item.dosage}` : ''})`).join('; ')
    : 'No active care-plan items recorded.';

  return {
    patientName: patient.fullName,
    history,
    carePlan,
  };
}

function formatAlerts(alerts: { title: string; severity: AttentionSeverity }[]) {
  return alerts.length > 0
    ? alerts.map((alert) => `${alert.title} (${alert.severity})`).join(', ')
    : 'none';
}

function severityRank(severity: AttentionSeverity) {
  if (severity === 'high') return 0;
  if (severity === 'warning') return 1;
  return 2;
}
