export const unsafeResponseFallback =
  'I can help explain your health information, but treatment or medication changes should be discussed with a qualified doctor.';

export const emergencyCareMessage =
  'This may require urgent medical attention. Please seek emergency medical care immediately.';

const emergencyPatterns = [
  /severe\s+chest\s+pain/i,
  /difficulty\s+breathing/i,
  /shortness\s+of\s+breath/i,
  /unconscious/i,
  /heavy\s+bleeding/i,
];

const unsafePatterns = [
  /\bstop\s+(?:taking\s+)?(?:your\s+)?(?:medicine|medication|prescription)\b/i,
  /\btake\s+[\w-]+\s+\d+\s*(?:mg|mcg|g|ml)\b/i,
  /\byou\s+definitely\s+have\b/i,
  /\bthis\s+confirms\b/i,
];

export function applyOutputGuardrails(text: string) {
  const blocked = unsafePatterns.some((pattern) => pattern.test(text));

  return {
    text: blocked ? unsafeResponseFallback : text,
    blocked,
  };
}

export function isEmergencyConcern(text: string) {
  return emergencyPatterns.some((pattern) => pattern.test(text));
}
