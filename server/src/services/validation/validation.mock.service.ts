export interface ValidationResult {
  validationStatus: 'Valid' | 'Invalid' | 'Risky' | 'Unknown' | 'Disposable';
  isDisposable: boolean;
  reason: string;
  providerResponse?: any;
}

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
];

const INVALID_PATTERNS = ['test@test.com', 'fake.com', 'invalid.com'];

export class MockValidationService {
  async validateEmail(email: string): Promise<ValidationResult> {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return {
        validationStatus: 'Invalid',
        isDisposable: false,
        reason: 'Malformed email syntax structure',
      };
    }

    const domain = cleanEmail.split('@')[1];
    const username = cleanEmail.split('@')[0];

    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return {
        validationStatus: 'Disposable',
        isDisposable: true,
        reason: 'Temporary disposable email address detected',
      };
    }

    if (INVALID_PATTERNS.some((pat) => cleanEmail.includes(pat))) {
      return {
        validationStatus: 'Invalid',
        isDisposable: false,
        reason: 'Domain or address flagged as non-deliverable test domain',
      };
    }

    // Role-based addresses flagged as Risky
    if (['info', 'sales', 'contact', 'admin', 'support', 'help'].includes(username)) {
      return {
        validationStatus: 'Risky',
        isDisposable: false,
        reason: 'Generic role-based address (catch-all or distribution list)',
      };
    }

    // High quality business domain email
    return {
      validationStatus: 'Valid',
      isDisposable: false,
      reason: 'Domain MX verified, active mailbox syntax confirmed',
    };
  }
}
