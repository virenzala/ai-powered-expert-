import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  getCampaignById,
  generateDrafts,
  approveCampaign,
  startCampaign,
  pauseCampaign,
} from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.post('/:id/generate-drafts', generateDrafts);
router.post('/:id/approve', authorize(['Admin', 'Manager']), approveCampaign);
router.post('/:id/start', startCampaign);
router.post('/:id/pause', pauseCampaign);

export default router;
