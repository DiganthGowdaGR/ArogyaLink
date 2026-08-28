export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';

export type Patient = {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  bloodGroup?: string;
  allergies: string[];
  conditions: string[];
};
