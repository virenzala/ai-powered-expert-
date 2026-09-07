import { Router } from 'express';
import { getGmailStatus, getGmailAuthUrl, handleGmailOAuthCallback, disconnectGmail } from '../controllers/gmail.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/status', authenticate, getGmailStatus);
router.get('/auth-url', authenticate, getGmailAuthUrl);
router.get('/oauth/callback', handleGmailOAuthCallback);
router.post('/disconnect', authenticate, disconnectGmail);

export default router;
