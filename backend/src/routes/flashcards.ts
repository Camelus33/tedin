import express from 'express';
import { createFlashcard, getFlashcards, reviewFlashcard, fromMemo, updateFlashcard, deleteFlashcard } from '../controllers/flashcardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', createFlashcard);
router.get('/', getFlashcards);
router.post('/:id/review', reviewFlashcard);
router.post('/from-memo', fromMemo);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);

export default router; 