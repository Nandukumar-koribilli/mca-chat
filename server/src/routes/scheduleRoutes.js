import { Router } from 'express';
import {
  getSchedule,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
} from '../controllers/scheduleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getSchedule);
router.post('/', createScheduleItem);
router.patch('/:id', updateScheduleItem);
router.delete('/:id', deleteScheduleItem);

export default router;
