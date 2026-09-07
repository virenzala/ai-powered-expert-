import { Router } from 'express';
import { getSuppressions, createSuppression, deleteSuppression } from '../controllers/suppression.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSuppressions);
router.post('/', createSuppression);
router.delete('/:id', deleteSuppression);

export default router;
