import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { gmailService } from '../services/gmail/gmail.service';
import { Integration } from '../models/Integration';

export const getGmailStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await gmailService.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGmailAuthUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const url = await gmailService.getAuthUrl();
    res.json({ success: true, authUrl: url });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGmailOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).send('OAuth authorization code missing');
      return;
    }
    const result = await gmailService.handleOAuthCallback(code);
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #16a34a;">✓ Gmail Connected Successfully</h2>
          <p>Account: <strong>${result.email}</strong></p>
          <p>You may close this window and return to ExportFlow.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GMAIL_CONNECTED', email: '${result.email}' }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send('OAuth Failed: ' + error.message);
  }
};

export const disconnectGmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Integration.findOneAndUpdate({ service: 'gmail' }, { status: 'Disconnected' });
    res.json({ success: true, message: 'Gmail disconnected successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
