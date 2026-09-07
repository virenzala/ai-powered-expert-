import { Router } from 'express';
import { getFollowUps, createFollowUp, updateFollowUp, completeFollowUp } from '../controllers/followup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getFollowUps);
router.post('/', createFollowUp);
router.put('/:id', updateFollowUp);
router.patch('/:id/complete', completeFollowUp);

export default router;
