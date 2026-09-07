import { Router } from 'express';
import { getSettings, updateOrganizationSettings, updateIntegrationSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/organization', authorize(['Admin', 'Manager']), updateOrganizationSettings);
router.put('/integration', authorize(['Admin']), updateIntegrationSettings);

export default router;
