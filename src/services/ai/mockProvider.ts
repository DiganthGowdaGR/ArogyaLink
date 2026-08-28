import type { AIProvider, AIProviderRequest, AIProviderResult } from './types';

export class MockAIProvider implements AIProvider {
  async complete({ request }: AIProviderRequest): Promise<AIProviderResult> {
    switch (request.type) {
      case 'prescriptionExplanation':
        return {
          text: `${request.medicationName} is an existing prescription that your doctor may use for your care. ${request.instructions ? `Your recorded instructions are: ${request.instructions} ` : ''}Follow the instructions already provided by your doctor and ask them before making any treatment changes.`,
        };
      case 'patientConcernSummary':
        return {
          text: `Patient concern summary: ${request.concern.trim()} Please share this concern with a qualified clinician, especially if it is severe, worsening, or accompanied by emergency symptoms.`,
        };
      case 'doctorPatientSummary':
        return {
          text: `Clinical Overview\n${request.patientName}. ${request.history.trim()}\n\nTreatment Follow-up\n${request.carePlan?.trim() || 'No active care-plan items recorded.'}\n\nCare Gaps / Alerts\nReview the recorded adherence, missed reasons, and unresolved alerts above.\n\nItems to Review\nVerify this summary against the complete patient record before clinical use.`,
        };
      case 'specialitySuggestion':
        return {
          text: 'A general clinical review can help choose the right next step.',
          suggestedSpeciality: suggestSpeciality(request.concern),
        };
      case 'recordExplanation':
        return {
          text: `${request.recordType} is an existing health record. In simple terms: ${request.record.trim()} Please ask your clinician to explain anything that is unclear or concerning.`,
        };
    }
  }
}

function suggestSpeciality(concern: string) {
  const value = concern.toLowerCase();

  if (/(itch|rash|skin|acne|eczema)/i.test(value)) return 'Dermatologist';
  if (/(diabetes|blood sugar|glucose)/i.test(value)) return 'Diabetologist';
  if (/(chest pain|palpitation|heart)/i.test(value)) return 'Cardiologist';
  if (/(child|baby|infant)/i.test(value)) return 'Pediatrician';
  if (/(pregnan|period|gynec)/i.test(value)) return 'Gynecologist';
  if (/(bone|joint|fracture|back pain)/i.test(value)) return 'Orthopedic';
  if (/(ear|nose|throat|sinus)/i.test(value)) return 'ENT';

  return 'General Physician';
}
