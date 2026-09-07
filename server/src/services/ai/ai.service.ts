import { env } from '../../config/env';
import { MockAIService, AIClassificationResult, AIPersonalizationResult } from './ai.mock.service';
import { logger } from '../../utils/logger';

const mockAiService = new MockAIService();

export class AIService {
  async classifyLead(leadData: any): Promise<AIClassificationResult> {
    if (env.AI_PROVIDER === 'mock' || (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY)) {
      return mockAiService.classifyLead(leadData);
    }

    try {
      logger.info(`Classifying lead ${leadData.companyName} with ${env.AI_PROVIDER}...`);
      // Stub for real Gemini/OpenAI API integration when API key is provided
      return mockAiService.classifyLead(leadData);
    } catch (error: any) {
      logger.warn(`AI Provider error (${error.message}). Falling back to mock AI classifier.`);
      return mockAiService.classifyLead(leadData);
    }
  }

  async personalizeEmail(input: {
    lead: any;
    template: any;
    productName: string;
    organizationName?: string;
  }): Promise<AIPersonalizationResult> {
    if (env.AI_PROVIDER === 'mock' || (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY)) {
      return mockAiService.personalizeEmail(input);
    }

    try {
      logger.info(`Personalizing email for ${input.lead.email} with ${env.AI_PROVIDER}...`);
      return mockAiService.personalizeEmail(input);
    } catch (error: any) {
      logger.warn(`AI Personalization API error (${error.message}). Falling back to mock AI personalizer.`);
      return mockAiService.personalizeEmail(input);
    }
  }
}

export const aiService = new AIService();
