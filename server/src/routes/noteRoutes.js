import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getNotes);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
