import { Router } from 'express';
import { industrialController } from '../controllers/industrial.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all industrial endpoints with JWT authentication
router.use(authenticate);

router.get('/hs-codes', (req, res, next) => industrialController.getHsCodes(req, res, next));
router.get('/standards-matrix', (req, res, next) => industrialController.getStandardsMatrix(req, res, next));
router.post('/calculate-quote', (req, res, next) => industrialController.calculateQuote(req, res, next));
router.post('/parse-rfq', (req, res, next) => industrialController.parseRfq(req, res, next));

export default router;
