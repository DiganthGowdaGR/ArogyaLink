export const controlledSpecialities = [
  'General Physician',
  'Dermatologist',
  'Diabetologist',
  'Cardiologist',
  'Pediatrician',
  'Gynecologist',
  'Orthopedic',
  'ENT',
] as const;

export type AISpeciality = (typeof controlledSpecialities)[number];

export type AIRequest =
  | {
      type: 'prescriptionExplanation';
      medicationName: string;
      instructions?: string;
    }
  | {
      type: 'patientConcernSummary';
      concern: string;
    }
  | {
      type: 'doctorPatientSummary';
      patientName: string;
      history: string;
      carePlan?: string;
    }
  | {
      type: 'specialitySuggestion';
      concern: string;
    }
  | {
      type: 'recordExplanation';
      recordType: string;
      record: string;
    };

export type AIProviderRequest = {
  systemPrompt: string;
  request: AIRequest;
};

export type AIProviderResult = {
  text: string;
  suggestedSpeciality?: string;
};

export type AIResponse = {
  text: string;
  speciality?: AISpeciality;
  safetyFallbackUsed: boolean;
};

export interface AIProvider {
  complete(request: AIProviderRequest): Promise<AIProviderResult>;
}
