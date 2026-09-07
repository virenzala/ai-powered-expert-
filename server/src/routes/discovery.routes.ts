import { Router } from 'express';
import { searchBuyers, enrichDomainEmail } from '../controllers/discovery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/search', searchBuyers);
router.post('/enrich-email', enrichDomainEmail);

export default router;
