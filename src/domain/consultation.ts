export type Consultation = {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  notes?: string;
  summary?: string;
};
