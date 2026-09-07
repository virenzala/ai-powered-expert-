import { env } from '../../config/env';
import { MockGmailService, SendEmailInput, SendEmailOutput } from './gmail.mock.service';
import { Integration } from '../../models/Integration';
import { logger } from '../../utils/logger';

const mockGmail = new MockGmailService();

export class GmailService {
  async getStatus(): Promise<{ connected: boolean; email?: string; provider: string }> {
    const integration = await Integration.findOne({ service: 'gmail' });
    if (integration && integration.status === 'Connected') {
      return {
        connected: true,
        email: integration.settings?.email || 'export.manager@apexindustrialexports.com',
        provider: integration.provider || 'google',
      };
    }
    // Default mock connected state in development if not explicitly configured
    return {
      connected: true,
      email: 'export.manager@apexindustrialexports.com',
      provider: 'mock',
    };
  }

  async getAuthUrl(): Promise<string> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return mockGmail.getAuthUrl();
    }
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GOOGLE_REDIRECT_URI)}&response_type=code&scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/userinfo.email&access_type=offline&prompt=consent`;
  }

  async handleOAuthCallback(code: string): Promise<any> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      const res = await mockGmail.handleCallback(code);
      await Integration.findOneAndUpdate(
        { service: 'gmail' },
        {
          service: 'gmail',
          provider: 'mock',
          status: 'Connected',
          settings: { email: res.email },
          lastSyncAt: new Date(),
        },
        { upsert: true }
      );
      return res;
    }

    // Real OAuth exchange stub
    const res = { connected: true, email: 'connected.export.user@gmail.com' };
    await Integration.findOneAndUpdate(
      { service: 'gmail' },
      {
        service: 'gmail',
        provider: 'google',
        status: 'Connected',
        settings: { email: res.email },
        lastSyncAt: new Date(),
      },
      { upsert: true }
    );
    return res;
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailOutput> {
    return mockGmail.sendEmail(input);
  }
}

export const gmailService = new GmailService();
