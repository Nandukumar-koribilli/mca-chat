import { Router } from 'express';
import { searchUsers, getUserByUsername, updateMe } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search', requireAuth, searchUsers);
router.patch('/me', requireAuth, updateMe);
router.get('/:username', requireAuth, getUserByUsername);

export default router;
