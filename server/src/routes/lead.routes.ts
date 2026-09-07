import { Router } from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  validateLead,
  classifyLead,
  validateBulkLeads,
  classifyBulkLeads,
  handleBulkAction,
} from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/validate-bulk', validateBulkLeads);
router.post('/classify-bulk', classifyBulkLeads);
router.post('/bulk-action', handleBulkAction);
router.get('/:id', getLeadById);
router.post('/:id/validate', validateLead);
router.post('/:id/classify', classifyLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
