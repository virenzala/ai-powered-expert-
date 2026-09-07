import { Router } from 'express';
import { getActivityLogs } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getActivityLogs);

export default router;
