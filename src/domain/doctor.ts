export type DoctorAvailability = {
  date: string;
  times: string[];
};

export type Doctor = {
  id: string;
  fullName: string;
  specialization: string;
  clinicName: string;
  city: string;
  available: boolean;
  availability: DoctorAvailability[];
};
