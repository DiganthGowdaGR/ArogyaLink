import type { AIProvider, AIProviderRequest, AIProviderResult } from './types';

export class BackendAIProvider implements AIProvider {
  constructor(private readonly endpoint: string) {}

  async complete(_request: AIProviderRequest): Promise<AIProviderResult> {
    if (!this.endpoint) {
      throw new Error('AI backend endpoint is not configured');
    }

    throw new Error(
      'Backend AI provider is a placeholder. Connect this to a secure server endpoint before enabling it.'
    );
  }
}
