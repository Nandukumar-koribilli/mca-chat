import { Router } from 'express';
import { getReportsSummary } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/summary', getReportsSummary);

export default router;
