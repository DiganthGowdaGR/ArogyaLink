export { aiService, completeAIRequest } from './aiService';
export { BackendAIProvider } from './provider';
export { MockAIProvider } from './mockProvider';
export {
  applyOutputGuardrails,
  emergencyCareMessage,
  isEmergencyConcern,
  unsafeResponseFallback,
} from './guardrails';
export { healthcareSystemPrompt } from './prompts';
export { runAiServiceChecks } from './verification';
export { buildDoctorPatientContext } from './patientContext';
export type { DoctorPatientContext } from './patientContext';
export type {
  AIProvider,
  AIProviderRequest,
  AIProviderResult,
  AIRequest,
  AIResponse,
  AISpeciality,
} from './types';
