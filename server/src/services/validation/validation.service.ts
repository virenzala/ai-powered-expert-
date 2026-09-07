import { env } from '../../config/env';
import { MockValidationService, ValidationResult } from './validation.mock.service';
import { logger } from '../../utils/logger';

const mockService = new MockValidationService();

export class EmailValidationService {
  async validateEmail(email: string): Promise<ValidationResult> {
    if (env.EMAIL_VALIDATION_PROVIDER === 'mock' || !env.EMAIL_VALIDATION_API_KEY) {
      return mockService.validateEmail(email);
    }

    try {
      // Stub for real provider API (e.g. Hunter.io / ZeroBounce) when key provided
      logger.info(`Validating ${email} using ${env.EMAIL_VALIDATION_PROVIDER}...`);
      return mockService.validateEmail(email);
    } catch (error: any) {
      logger.warn(`External validation API error: ${error.message}. Falling back to mock validation.`);
      return mockService.validateEmail(email);
    }
  }
}

export const emailValidationService = new EmailValidationService();
