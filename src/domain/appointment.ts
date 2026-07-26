export type AppointmentStatus = 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  tokenNumber?: string;
};
