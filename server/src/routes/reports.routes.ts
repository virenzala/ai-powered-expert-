import { Router } from 'express';
import { getLeadReports, getValidationReports, getCampaignReports } from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/leads', getLeadReports);
router.get('/validation', getValidationReports);
router.get('/campaigns', getCampaignReports);

export default router;
