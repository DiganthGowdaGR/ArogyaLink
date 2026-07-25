export const mockDoctor = {
  name: 'Dr. Kumar',
  specialty: 'General Physician',
  clinic: 'City Clinic, Hassan',
  availability: '10:00 AM - 1:00 PM',
} as const;

export const mockDoctorSummary = [
  { label: "Today's Appointments", value: '12' },
  { label: 'Waiting Patients', value: '5' },
  { label: 'Needs Attention', value: '3' },
  { label: 'Follow-ups Due', value: '4' },
] as const;

export const mockQueue = {
  current: {
    token: 'A-05',
    patient: 'Meena K',
    reason: 'Diabetes follow-up',
    id: 'ARG10284',
  },
  waiting: [
    { token: 'A-06', patient: 'Arjun' },
    { token: 'A-07', patient: 'Lakshmi' },
    { token: 'A-08', patient: 'Rahul' },
  ],
} as const;

export const mockAttentionItems = [
  {
    patient: 'Lakshmi',
    issue: 'Medication adherence issue',
    detail: '2 missed confirmations',
    status: 'Needs Review',
    statusType: 'warning',
  },
  {
    patient: 'Ramesh',
    issue: 'Referral overdue',
    detail: '3 days',
    status: 'Overdue',
    statusType: 'danger',
  },
  {
    patient: 'Meena',
    issue: 'New symptom reported',
    detail: 'Needs review',
    status: 'Review',
    statusType: 'info',
  },
] as const;

export const mockAppointmentRequests = [
  {
    patient: 'Rahul',
    reason: 'General consultation',
    time: '11:30 AM',
  },
  {
    patient: 'Priya',
    reason: 'Follow-up',
    time: '12:00 PM',
  },
] as const;

export const mockDoctorPatients = [
  {
    id: 'ARG10284',
    name: 'Meena K',
    age: '45 years',
    condition: 'Diabetes',
    lastVisit: '5 Aug',
    status: 'Needs Review',
    statusType: 'warning',
  },
  {
    id: 'ARG10771',
    name: 'Lakshmi S',
    age: '62 years',
    condition: 'Hypertension',
    lastVisit: '2 Aug',
    status: 'Routine',
    statusType: 'success',
  },
] as const;

export const mockPatientSnapshot = {
  id: 'ARG10284',
  name: 'Meena K',
  demographics: '45 / Female',
  important: ['Diabetes Type 2', 'Penicillin allergy'],
  medication: 'Metformin 500 mg',
  medicationTiming: 'Morning + Night',
  adherence: '78%',
  missed: '2 missed',
  late: '3 late',
  complaint: 'Skin itching for 2 days',
  lastConsultation: {
    date: '5 Aug 2026',
    reason: 'Diabetes follow-up',
  },
  aiSummary:
    'Patient has diabetes, recent adherence issues, and a new skin complaint.',
} as const;

export const mockPatientHistory = [
  {
    date: '5 Aug 2026',
    doctor: 'Dr. Kumar',
    reason: 'Diabetes follow-up',
    items: ['Prescription', 'Report', 'Visit Summary'],
  },
  {
    date: '18 Jul 2026',
    doctor: 'Dr. Kumar',
    reason: 'General review',
    items: ['Visit Summary'],
  },
] as const;
