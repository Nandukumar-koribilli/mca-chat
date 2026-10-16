import { Router } from 'express';
import {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getConversations);
router.post('/direct', getOrCreateDirectConversation);
router.post('/group', createGroupConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/read', markConversationAsRead);

export default router;
