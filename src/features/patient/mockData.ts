export const mockPatient = {
  name: 'Meena K',
  patientId: 'ARG10284',
  bloodGroup: 'B+',
  allergies: 'No known allergies',
  knownConditions: 'Type 2 diabetes',
  emergencyContact: 'Demo contact - 00000 00000',
} as const;

export const mockAppointments = [
  {
    doctor: 'Dr. Kumar',
    specialty: 'General Physician',
    location: 'City Clinic',
    time: 'Tomorrow - 10:30 AM',
    status: 'Confirmed',
    statusType: 'success',
  },
  {
    doctor: 'Dr. Ananya',
    specialty: 'Dermatologist',
    location: 'Care Hospital',
    time: 'Aug 6 - 4:00 PM',
    status: 'Pending',
    statusType: 'warning',
  },
] as const;

export const mockMedication = {
  prescribedBy: 'Dr. Kumar',
  name: 'Metformin 500 mg',
  dosage: '1 tablet',
  instruction: 'After breakfast',
  morningTime: '8:00 AM',
  eveningTime: '8:00 PM',
  duration: '30 days',
  status: 'Pending',
} as const;

export const mockHealthHistory = [
  {
    date: '5 Aug 2026',
    doctor: 'Dr. Kumar',
    location: 'City Clinic',
    reason: 'Diabetes follow-up',
    items: ['Prescription', 'Reports', 'Visit Summary'],
  },
  {
    date: '18 Jul 2026',
    doctor: 'Dr. Sharma',
    location: 'ABC Hospital',
    reason: 'General consultation',
    items: ['Prescription', 'Visit Summary'],
  },
] as const;
