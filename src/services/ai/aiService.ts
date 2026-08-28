import { applyOutputGuardrails } from './guardrails';
import { healthcareSystemPrompt } from './prompts';
import { MockAIProvider } from './mockProvider';
import { controlledSpecialities, type AIProvider, type AIRequest, type AIResponse, type AISpeciality } from './types';

const defaultProvider: AIProvider = new MockAIProvider();

export async function completeAIRequest(
  request: AIRequest,
  provider: AIProvider = defaultProvider
): Promise<AIResponse> {
  const result = await provider.complete({
    systemPrompt: healthcareSystemPrompt,
    request,
  });
  const guarded = applyOutputGuardrails(result.text);

  return {
    text: guarded.text,
    speciality: request.type === 'specialitySuggestion'
      ? controlledSpeciality(result.suggestedSpeciality)
      : undefined,
    safetyFallbackUsed: guarded.blocked,
  };
}

export const aiService = {
  explainPrescription: (medicationName: string, instructions?: string) =>
    completeAIRequest({ type: 'prescriptionExplanation', medicationName, instructions }),
  summarizeConcern: (concern: string) =>
    completeAIRequest({ type: 'patientConcernSummary', concern }),
  summarizeForDoctor: (patientName: string, history: string, carePlan?: string) =>
    completeAIRequest({ type: 'doctorPatientSummary', patientName, history, carePlan }),
  suggestSpeciality: (concern: string) =>
    completeAIRequest({ type: 'specialitySuggestion', concern }),
  explainRecord: (recordType: string, record: string) =>
    completeAIRequest({ type: 'recordExplanation', recordType, record }),
};

function controlledSpeciality(value: string | undefined): AISpeciality {
  return controlledSpecialities.find((speciality) => speciality === value) ?? 'General Physician';
}
