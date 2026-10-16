import { Router } from 'express';
import { register, login, logout, getMe, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);

export default router;
