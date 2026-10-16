import { Router } from 'express';
import { getTests, createTest, updateTest, deleteTest } from '../controllers/testController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getTests);
router.post('/', createTest);
router.patch('/:id', updateTest);
router.delete('/:id', deleteTest);

export default router;
