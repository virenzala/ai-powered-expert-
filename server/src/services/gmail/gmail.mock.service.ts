import { logger } from '../../utils/logger';

export interface SendEmailInput {
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

export interface SendEmailOutput {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

export class MockGmailService {
  async getAuthUrl(): Promise<string> {
    return 'http://localhost:5000/api/gmail/oauth/callback?code=mock_authorization_code_exportflow';
  }

  async handleCallback(code: string): Promise<{ connected: boolean; email: string }> {
    logger.info(`Processing mock OAuth callback with code: ${code}`);
    return {
      connected: true,
      email: 'export.manager@apexindustrialexports.com',
    };
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailOutput> {
    const { recipientEmail, subject } = input;
    logger.info(`[MOCK GMAIL SENDER] Dispatching email to ${recipientEmail} | Subject: "${subject}"`);

    // Simulate transient failure for invalid format test
    if (recipientEmail.includes('fail') || recipientEmail.includes('bounce')) {
      return {
        success: false,
        error: 'Recipient mailbox unavailable or domain rejected SMTP connection.',
      };
    }

    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    return {
      success: true,
      messageId: `msg_gmail_mock_${randomSuffix}`,
      threadId: `thread_gmail_mock_${randomSuffix}`,
    };
  }
}
